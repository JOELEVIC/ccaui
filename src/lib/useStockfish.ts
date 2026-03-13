"use client";

import { useCallback, useState } from "react";
import { getCcaApiBase } from "./game-api";

export type Difficulty = "easy" | "medium" | "hard";

export function useStockfish(difficulty: Difficulty) {
  const [error, setError] = useState<string | null>(null);

  const getBestMove = useCallback(
    async (fen: string): Promise<string | null> => {
      setError(null);
      try {
        const base = getCcaApiBase();
        const res = await fetch(`${base}/api/stockfish/bestmove`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fen, difficulty }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as { move?: string | null };
        return data.move ?? null;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Engine failed");
        return null;
      }
    },
    [difficulty]
  );

  return {
    getBestMove,
    ready: true,
    error,
  };
}
