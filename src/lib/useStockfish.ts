"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Evaluation {
  cp: number | null;
  mate: number | null;
}

const ENGINE_URL = "/stockfish/stockfish-18-lite-single.js";
const BESTMOVE_DEPTH = 12;
const EVAL_DEPTH = 14;
const REQUEST_TIMEOUT_MS = 8000;

type PendingResolver = {
  done: (line: string) => boolean;
  resolve: (value: { lines: string[]; lastInfo: string | null }) => void;
  timeout: ReturnType<typeof setTimeout>;
  buffer: string[];
  lastInfo: string | null;
};

class EngineDriver {
  private worker: Worker | null = null;
  private pending: PendingResolver | null = null;
  private queue: Array<() => Promise<unknown>> = [];
  private running = false;
  private elo: number;
  private eloApplied: number | null = null;

  constructor(elo: number) {
    this.elo = elo;
  }

  setElo(elo: number) {
    this.elo = elo;
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const w = new Worker(ENGINE_URL);
    w.onmessage = (e) => this.handleLine(typeof e.data === "string" ? e.data : "");
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
    this.ensureWorker().postMessage(cmd);
  }

  private waitFor(predicate: (line: string) => boolean): Promise<{
    lines: string[];
    lastInfo: string | null;
  }> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pending) {
          this.pending = null;
          this.send("stop");
          reject(new Error("Engine timeout"));
        }
      }, REQUEST_TIMEOUT_MS);
      this.pending = {
        done: predicate,
        resolve,
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

  bestMove(fen: string): Promise<string | null> {
    return this.enqueue(async () => {
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

export function useStockfish(elo: number) {
  const driverRef = useRef<EngineDriver | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Worker === "undefined") {
      setError("Web Workers unavailable");
      return;
    }
    try {
      driverRef.current = new EngineDriver(elo);
      setReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Engine failed");
    }
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    driverRef.current?.setElo(elo);
  }, [elo]);

  const getBestMove = useCallback(async (fen: string): Promise<string | null> => {
    setError(null);
    const driver = driverRef.current;
    if (!driver) return null;
    try {
      return await driver.bestMove(fen);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Engine failed");
      return null;
    }
  }, []);

  const getEvaluation = useCallback(async (fen: string): Promise<Evaluation> => {
    const driver = driverRef.current;
    if (!driver) return { cp: null, mate: null };
    try {
      return await driver.evaluate(fen);
    } catch {
      return { cp: null, mate: null };
    }
  }, []);

  return { getBestMove, getEvaluation, ready, error };
}
