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
    setReady(false);
    const worker = new Worker("/stockfish/stockfish-18-lite-single.js");

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
        setReady(true);
      }
    };

    worker.onerror = (err) => {
      if (mounted) {
        setError(err.message || "Stockfish failed to load");
        setReady(false);
      }
    };

    worker.postMessage("uci");
    worker.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
    worker.postMessage("isready");

    workerRef.current = worker;
    return () => {
      mounted = false;
      if (resolveRef.current) {
        resolveRef.current(null);
        resolveRef.current = null;
      }
      worker.terminate();
      workerRef.current = null;
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
