"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gql } from "@apollo/client";
import { apolloClient } from "./apollo-client";

export interface Evaluation {
  cp: number | null;
  mate: number | null;
}

const ENGINE_URL = "/stockfish/stockfish-18-lite-single.js";
const BESTMOVE_DEPTH = 12;
const EVAL_DEPTH = 14;
const REQUEST_TIMEOUT_MS = 8000;
/** How long we wait for the worker to send a UCI "readyok" before giving up. */
const READY_TIMEOUT_MS = 4000;

type PendingResolver = {
  done: (line: string) => boolean;
  resolve: (value: { lines: string[]; lastInfo: string | null }) => void;
  reject: (err: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
  buffer: string[];
  lastInfo: string | null;
};

/* ───────────────────────────────────────────────────────────────────
 * Backend fallback — invoked when the WASM worker fails to load,
 * throws, or stops responding. The server runs the native Stockfish
 * binary via `services/stockfish.service.ts`.
 * ─────────────────────────────────────────────────────────────────── */

const ENGINE_BEST_MOVE = gql`
  query EngineBestMove($fen: String!, $elo: Int) {
    engineBestMove(fen: $fen, elo: $elo)
  }
`;

const ENGINE_EVALUATION = gql`
  query EngineEvaluation($fen: String!) {
    engineEvaluation(fen: $fen) {
      cp
      mate
    }
  }
`;

async function backendBestMove(fen: string, elo: number): Promise<string | null> {
  try {
    const { data } = await apolloClient.query<{ engineBestMove: string | null }>({
      query: ENGINE_BEST_MOVE,
      variables: { fen, elo },
      fetchPolicy: "no-cache",
    });
    return data?.engineBestMove ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[engine] backend fallback failed", err);
    return null;
  }
}

async function backendEvaluation(fen: string): Promise<Evaluation> {
  try {
    const { data } = await apolloClient.query<{ engineEvaluation: Evaluation | null }>({
      query: ENGINE_EVALUATION,
      variables: { fen },
      fetchPolicy: "no-cache",
    });
    return data?.engineEvaluation ?? { cp: null, mate: null };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[engine] backend evaluation fallback failed", err);
    return { cp: null, mate: null };
  }
}

/* ───────────────────────────────────────────────────────────────────
 * EngineDriver — wraps the Stockfish web worker.
 * ─────────────────────────────────────────────────────────────────── */

class EngineDriver {
  private worker: Worker | null = null;
  private pending: PendingResolver | null = null;
  private queue: Array<() => Promise<unknown>> = [];
  private running = false;
  private elo: number;
  private eloApplied: number | null = null;
  /** Set once the worker has either thrown or failed readiness. */
  private deadReason: string | null = null;
  private onWorkerError?: (reason: string) => void;

  constructor(elo: number, onWorkerError?: (reason: string) => void) {
    this.elo = elo;
    this.onWorkerError = onWorkerError;
  }

  setElo(elo: number) {
    this.elo = elo;
  }

  isDead(): boolean {
    return this.deadReason !== null;
  }

  private kill(reason: string) {
    if (this.deadReason) return;
    this.deadReason = reason;
    // eslint-disable-next-line no-console
    console.warn(`[engine] WASM worker disabled: ${reason}. Falling back to backend.`);
    this.onWorkerError?.(reason);
    if (this.pending) {
      clearTimeout(this.pending.timeout);
      this.pending.reject(new Error(reason));
      this.pending = null;
    }
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        /* ignore */
      }
      this.worker = null;
    }
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    // Construct the worker URL with a hash override so the loader resolves
    // the WASM path explicitly. The loader script reads
    // `self.location.hash.substr(1).split(",")` and uses index 0 as the
    // WASM URL; index 1 must equal "worker" so it identifies itself.
    const url = `${ENGINE_URL}#${encodeURIComponent(
      "/stockfish/stockfish-18-lite-single.wasm"
    )},worker`;
    let w: Worker;
    try {
      w = new Worker(url);
    } catch (err) {
      this.kill(err instanceof Error ? err.message : "worker constructor threw");
      throw err;
    }
    w.onmessage = (e) =>
      this.handleLine(typeof e.data === "string" ? e.data : "");
    w.onerror = (event) => {
      const reason =
        (event as ErrorEvent).message ?? "unknown worker error";
      this.kill(reason);
    };
    w.onmessageerror = () => this.kill("worker messageerror");
    this.worker = w;
    w.postMessage("uci");
    w.postMessage("isready");
    return w;
  }

  private handleLine(line: string) {
    const p = this.pending;
    if (!p) return;
    p.buffer.push(line);
    if (line.startsWith("info ")) p.lastInfo = line;
    if (p.done(line)) {
      clearTimeout(p.timeout);
      this.pending = null;
      p.resolve({ lines: p.buffer, lastInfo: p.lastInfo });
    }
  }

  private send(cmd: string) {
    const w = this.ensureWorker();
    if (!w) throw new Error("worker unavailable");
    w.postMessage(cmd);
  }

  private waitFor(
    predicate: (line: string) => boolean,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
  ): Promise<{ lines: string[]; lastInfo: string | null }> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pending) {
          this.pending = null;
          try {
            this.worker?.postMessage("stop");
          } catch {
            /* ignore */
          }
          this.kill("engine timeout");
          reject(new Error("Engine timeout"));
        }
      }, timeoutMs);
      this.pending = {
        done: predicate,
        resolve,
        reject,
        timeout,
        buffer: [],
        lastInfo: null,
      };
    });
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await task());
        } catch (err) {
          reject(err);
        }
      });
      void this.drain();
    });
  }

  private async drain() {
    if (this.running) return;
    this.running = true;
    try {
      while (this.queue.length) {
        const task = this.queue.shift()!;
        await task();
      }
    } finally {
      this.running = false;
    }
  }

  private applyEloIfNeeded() {
    if (this.eloApplied === this.elo) return;
    if (this.elo >= 2850) {
      this.send("setoption name UCI_LimitStrength value false");
    } else {
      const clamped = Math.max(1320, Math.min(3190, this.elo));
      this.send("setoption name UCI_LimitStrength value true");
      this.send(`setoption name UCI_Elo value ${clamped}`);
    }
    this.eloApplied = this.elo;
  }

  /**
   * One-time readiness probe — confirms the worker actually responds with
   * "readyok" within READY_TIMEOUT_MS. If not, we mark the driver dead.
   */
  async warmup(): Promise<boolean> {
    if (this.deadReason) return false;
    try {
      this.ensureWorker();
    } catch {
      return false;
    }
    try {
      await this.waitFor((line) => line.startsWith("readyok"), READY_TIMEOUT_MS);
      return true;
    } catch {
      return false;
    }
  }

  bestMove(fen: string): Promise<string | null> {
    return this.enqueue(async () => {
      if (this.deadReason) return null;
      this.applyEloIfNeeded();
      this.send(`position fen ${fen}`);
      this.send(`go depth ${BESTMOVE_DEPTH}`);
      const { lines } = await this.waitFor((line) => line.startsWith("bestmove"));
      const last = [...lines].reverse().find((l) => l.startsWith("bestmove"));
      if (!last) return null;
      const tokens = last.split(/\s+/);
      const move = tokens[1];
      if (!move || move === "(none)" || move === "0000") return null;
      return move;
    });
  }

  evaluate(fen: string): Promise<Evaluation> {
    return this.enqueue(async () => {
      if (this.deadReason) return { cp: null, mate: null };
      this.send("setoption name UCI_LimitStrength value false");
      this.eloApplied = null;
      this.send(`position fen ${fen}`);
      this.send(`go depth ${EVAL_DEPTH}`);
      const { lastInfo } = await this.waitFor((line) => line.startsWith("bestmove"));
      if (!lastInfo) return { cp: null, mate: null };

      const sideToMove = fen.split(" ")[1] === "b" ? -1 : 1;
      const cpMatch = lastInfo.match(/score cp (-?\d+)/);
      const mateMatch = lastInfo.match(/score mate (-?\d+)/);
      if (mateMatch) return { cp: null, mate: parseInt(mateMatch[1], 10) * sideToMove };
      if (cpMatch) return { cp: parseInt(cpMatch[1], 10) * sideToMove, mate: null };
      return { cp: null, mate: null };
    });
  }

  destroy() {
    if (this.pending) {
      clearTimeout(this.pending.timeout);
      this.pending = null;
    }
    this.queue = [];
    if (this.worker) {
      try {
        this.worker.postMessage("quit");
      } catch {
        /* ignore */
      }
      this.worker.terminate();
      this.worker = null;
    }
  }
}

/* ───────────────────────────────────────────────────────────────────
 * useStockfish — local WASM with backend fallback.
 *
 * Behaviour:
 *   1. On mount we create an EngineDriver and warm it up (one isready
 *      round-trip). If that fails we mark `wasmDead` and every future
 *      call goes to the server.
 *   2. If the WASM driver throws mid-game we mark it dead and fall back.
 *   3. The `error` field surfaces the latest reason for the user.
 *   4. The hook still returns `ready: true` once *either* path is
 *      usable, so the caller can fire the engine without waiting on
 *      a flag that may never flip.
 * ─────────────────────────────────────────────────────────────────── */

export function useStockfish(elo: number) {
  const driverRef = useRef<EngineDriver | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [wasmDead, setWasmDead] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Worker === "undefined") {
      // No worker support → use backend exclusively.
      setWasmDead(true);
      setReady(true);
      return;
    }
    let mounted = true;
    const driver = new EngineDriver(elo, (reason) => {
      if (!mounted) return;
      setWasmDead(true);
      setError(reason);
    });
    driverRef.current = driver;
    // Probe the worker. We mark "ready" as soon as we know which path
    // we'll use (either WASM warmed up, or it failed and we go server-side).
    driver
      .warmup()
      .then((ok) => {
        if (!mounted) return;
        if (!ok) setWasmDead(true);
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setWasmDead(true);
        setReady(true);
      });
    return () => {
      mounted = false;
      driver.destroy();
      driverRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    driverRef.current?.setElo(elo);
  }, [elo]);

  const getBestMove = useCallback(
    async (fen: string): Promise<string | null> => {
      setError(null);
      const driver = driverRef.current;
      // If the WASM is alive, try it first.
      if (driver && !wasmDead && !driver.isDead()) {
        try {
          const move = await driver.bestMove(fen);
          if (move) return move;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("[engine] WASM bestMove failed, falling back to backend", err);
          setError(err instanceof Error ? err.message : "Engine failed");
        }
      }
      // Backend fallback.
      const move = await backendBestMove(fen, elo);
      if (!move) setError("Engine unavailable — random move");
      return move;
    },
    [wasmDead, elo],
  );

  const getEvaluation = useCallback(
    async (fen: string): Promise<Evaluation> => {
      const driver = driverRef.current;
      if (driver && !wasmDead && !driver.isDead()) {
        try {
          return await driver.evaluate(fen);
        } catch {
          /* fall through */
        }
      }
      return backendEvaluation(fen);
    },
    [wasmDead],
  );

  return { getBestMove, getEvaluation, ready, error, wasmDead };
}
