"use client";

import { useCallback, useState } from "react";
import { getCcaApiBase } from "./game-api";

export interface Evaluation {
  cp: number | null;
  mate: number | null;
}

export function useStockfish(elo: number) {
  const [error, setError] = useState<string | null>(null);

  const getBestMove = useCallback(
    async (fen: string): Promise<string | null> => {
      setError(null);
      try {
        const base = getCcaApiBase();
        const res = await fetch(`${base}/api/stockfish/bestmove`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fen, elo }),
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
    [elo]
  );

  const getEvaluation = useCallback(async (fen: string): Promise<Evaluation> => {
    try {
      const base = getCcaApiBase();
      const res = await fetch(`${base}/api/stockfish/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as Evaluation;
      return { cp: data.cp ?? null, mate: data.mate ?? null };
    } catch {
      return { cp: null, mate: null };
    }
  }, []);

  return {
    getBestMove,
    getEvaluation,
    ready: true,
    error,
  };
}
