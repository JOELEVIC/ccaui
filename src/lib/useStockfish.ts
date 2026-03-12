"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { skillLevel: number; depth: number; movetime: number }
> = {
  easy: { skillLevel: 5, depth: 8, movetime: 500 },
  medium: { skillLevel: 12, depth: 14, movetime: 1500 },
  hard: { skillLevel: 18, depth: 20, movetime: 3000 },
};

export function useStockfish(difficulty: Difficulty) {
  const workerRef = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolveRef = useRef<((move: string | null) => void) | null>(null);

  const config = DIFFICULTY_CONFIG[difficulty];

  useEffect(() => {
    let mounted = true;
    let wasmBlobUrl: string | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    setReady(false);
    setError(null);

    async function init() {
      try {
        const res = await fetch("/api/stockfish-wasm");
        if (!mounted) return;
        if (!res.ok) throw new Error(`WASM fetch failed: ${res.status}`);
        const buf = await res.arrayBuffer();
        if (!mounted) return;
        const magic = new Uint8Array(buf, 0, 4);
        if (magic[0] !== 0 || magic[1] !== 0x61 || magic[2] !== 0x73 || magic[3] !== 0x6d) {
          throw new Error("Invalid WASM: not a WebAssembly binary");
        }
        const blob = new Blob([buf], { type: "application/wasm" });
        wasmBlobUrl = URL.createObjectURL(blob);

        const workerUrl = `/stockfish/stockfish-18-lite-single.js#${encodeURIComponent(wasmBlobUrl)},worker`;
        const worker = new Worker(workerUrl);
        if (!mounted) {
          worker.terminate();
          URL.revokeObjectURL(wasmBlobUrl);
          return;
        }

        worker.onmessage = (e: MessageEvent<string>) => {
          const line = e.data;
          if (line.startsWith("bestmove ")) {
            const match = line.match(/bestmove (\S+)/);
            const move = match ? match[1] : null;
            if (resolveRef.current) {
              resolveRef.current(move === "(none)" ? null : move);
              resolveRef.current = null;
            }
          } else if (line === "readyok" && mounted) {
            if (timeoutId) clearTimeout(timeoutId);
            setReady(true);
          }
        };

        worker.onerror = (err) => {
          if (mounted) {
            setError(err.message || "Stockfish failed to load");
            setReady(false);
          }
        };

        workerRef.current = worker;

        worker.postMessage("uci");
        worker.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
        worker.postMessage("isready");

        timeoutId = setTimeout(() => {
          if (mounted) setError("Engine timed out—using random moves");
        }, 15000);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Stockfish failed to load");
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (resolveRef.current) {
        resolveRef.current(null);
        resolveRef.current = null;
      }
      workerRef.current?.terminate();
      workerRef.current = null;
      if (wasmBlobUrl) URL.revokeObjectURL(wasmBlobUrl);
    };
  }, [config.skillLevel]);

  const getBestMove = useCallback(
    (fen: string): Promise<string | null> => {
      return new Promise((resolve) => {
        const worker = workerRef.current;
        if (!worker || !ready) {
          resolve(null);
          return;
        }
        resolveRef.current = resolve;
        worker.postMessage("ucinewgame");
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage(`go movetime ${config.movetime}`);
      });
    },
    [ready, config.movetime]
  );

  return { getBestMove, ready, error };
}
