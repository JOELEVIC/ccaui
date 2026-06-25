"use client";

import { useCallback, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useStockfish, REVIEW_DEPTH } from "./useStockfish";
import {
  type StoredGameAnalysis,
  type MoveReviewRow,
  type Classification,
  winPercent,
  moveAccuracy,
  classifyByWinDelta,
} from "./gameAnalysisReview";

const CACHE_PREFIX = "dchess-analysis-v2-";
const MATE_CP = 1000; // eval-graph clamp for mate scores

export interface AnalysisProgress {
  done: number;
  total: number;
}

function cacheKey(sanMoves: string[]): string {
  return CACHE_PREFIX + sanMoves.join("_");
}

/** UCI string of a SAN move in a position, e.g. "e2e4" / "e7e8q". */
function uciOf(fen: string, san: string): string | null {
  const c = new Chess();
  try {
    c.load(fen);
    const m = c.move(san);
    if (!m) return null;
    return m.promotion ? `${m.from}${m.to}${m.promotion}` : `${m.from}${m.to}`;
  } catch {
    return null;
  }
}

/** SAN of a UCI move in a position. */
function sanOf(fen: string, uci: string): string | null {
  const c = new Chess();
  try {
    c.load(fen);
    const m = c.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: (uci.slice(4) || "q") as "q" | "r" | "b" | "n",
    });
    return m ? m.san : null;
  } catch {
    return null;
  }
}

/** White-POV cp value for the eval graph (mate → ±MATE_CP). */
function graphCp(cp: number | null, mate: number | null): number {
  if (mate !== null) return mate > 0 ? MATE_CP : -MATE_CP;
  return Math.max(-MATE_CP, Math.min(MATE_CP, cp ?? 0));
}

/** Mover-perspective cp of a white-POV eval. */
function moverCp(cp: number | null, mate: number | null, moverIsWhite: boolean): number {
  const sign = moverIsWhite ? 1 : -1;
  if (mate !== null) return mate * sign > 0 ? MATE_CP : -MATE_CP;
  return (cp ?? 0) * sign;
}

/**
 * In-browser, progressive game review. Walks every position with Stockfish
 * (depth 12), classifying each move and accumulating accuracy/ACPL live so the
 * UI can fill in as it goes. Results are cached in localStorage by move list.
 */
export function useGameAnalysis() {
  // Full strength for analysis (elo >= 2850 disables UCI_LimitStrength).
  const { analyse, warming, wasmDead } = useStockfish(3000);
  const [analysis, setAnalysis] = useState<StoredGameAnalysis | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress>({ done: 0, total: 0 });
  const cancelRef = useRef(false);
  const runningRef = useRef(false);

  const run = useCallback(
    async (sanMoves: string[]) => {
      if (runningRef.current || sanMoves.length === 0) return;

      try {
        const cached = localStorage.getItem(cacheKey(sanMoves));
        if (cached) {
          setAnalysis(JSON.parse(cached) as StoredGameAnalysis);
          return;
        }
      } catch {
        /* ignore */
      }

      runningRef.current = true;
      cancelRef.current = false;
      setRunning(true);

      // Build the FEN sequence + normalized SANs.
      const chess = new Chess();
      const fens: string[] = [chess.fen()];
      const sans: string[] = [];
      for (const san of sanMoves) {
        try {
          const m = chess.move(san);
          if (!m) break;
          sans.push(m.san);
          fens.push(chess.fen());
        } catch {
          break;
        }
      }

      const positions = fens.length; // moves + 1
      setProgress({ done: 0, total: positions });

      const evalsWhite: { cp: number | null; mate: number | null }[] = [];
      const bestUci: (string | null)[] = [];
      const moveReviews: MoveReviewRow[] = [];
      const evalSeries: { ply: number; cp: number }[] = [];
      const counts = {
        white: { inaccuracies: 0, mistakes: 0, blunders: 0 },
        black: { inaccuracies: 0, mistakes: 0, blunders: 0 },
      };
      const accs: { white: number[]; black: number[] } = { white: [], black: [] };
      const loss = { white: 0, black: 0 };
      const lossN = { white: 0, black: 0 };

      const assemble = (): StoredGameAnalysis => {
        const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 100);
        return {
          white: {
            ...counts.white,
            acpl: lossN.white ? Math.round(loss.white / lossN.white) : 0,
            accuracy: Math.round(mean(accs.white) * 10) / 10,
          },
          black: {
            ...counts.black,
            acpl: lossN.black ? Math.round(loss.black / lossN.black) : 0,
            accuracy: Math.round(mean(accs.black) * 10) / 10,
          },
          evalSeries: [...evalSeries],
          moveReviews: [...moveReviews],
        };
      };

      for (let i = 0; i < positions; i++) {
        if (cancelRef.current) break;
        const r = await analyse(fens[i], REVIEW_DEPTH);
        let cp = r.cp;
        let mate = r.mate;
        // Terminal position: engines report `mate 0` at a checkmate, which loses its
        // sign. The side to move is the one that's mated (and lost), so resolve it
        // from white's perspective explicitly.
        try {
          const probe = new Chess();
          probe.load(fens[i]);
          if (probe.isCheckmate()) {
            const whiteToMove = fens[i].split(" ")[1] === "w";
            cp = null;
            mate = whiteToMove ? -1 : 1; // white mated → black wins; black mated → white wins
          }
        } catch {
          /* ignore */
        }
        evalsWhite[i] = { cp, mate };
        bestUci[i] = r.bestMove;
        evalSeries.push({ ply: i, cp: graphCp(cp, mate) });

        // Classify the move that LED to position i (move index i-1), using the
        // best move + eval of the position BEFORE it (already computed at i-1).
        if (i >= 1) {
          const m = i - 1;
          const moverIsWhite = m % 2 === 0;
          const side = moverIsWhite ? "white" : "black";
          const before = evalsWhite[i - 1];
          const after = evalsWhite[i];

          const wbMover = moverIsWhite
            ? winPercent(before.cp, before.mate)
            : 100 - winPercent(before.cp, before.mate);
          const waMover = moverIsWhite
            ? winPercent(after.cp, after.mate)
            : 100 - winPercent(after.cp, after.mate);
          const delta = Math.max(0, wbMover - waMover);

          const bestU = bestUci[i - 1];
          const playedUci = uciOf(fens[i - 1], sans[m]);
          const isBest = !!bestU && !!playedUci && bestU === playedUci;
          const cls: Classification = classifyByWinDelta(delta, isBest);

          const cpLoss = Math.max(
            0,
            Math.round(moverCp(before.cp, before.mate, moverIsWhite) - moverCp(after.cp, after.mate, moverIsWhite))
          );
          const bestSan = bestU ? sanOf(fens[i - 1], bestU) : null;

          moveReviews.push({
            playedSan: sans[m],
            bestSan: bestSan ?? sans[m],
            cpLoss,
            classification: cls,
            evalCp: after.cp,
            evalMate: after.mate,
          });

          accs[side].push(moveAccuracy(wbMover, waMover));
          loss[side] += cpLoss;
          lossN[side] += 1;
          if (cls === "inaccuracy") counts[side].inaccuracies += 1;
          else if (cls === "mistake") counts[side].mistakes += 1;
          else if (cls === "blunder") counts[side].blunders += 1;
        }

        setAnalysis(assemble());
        setProgress({ done: i + 1, total: positions });
      }

      const finalAnalysis = assemble();
      setAnalysis(finalAnalysis);
      if (!cancelRef.current) {
        try {
          localStorage.setItem(cacheKey(sanMoves), JSON.stringify(finalAnalysis));
        } catch {
          /* ignore quota */
        }
      }
      runningRef.current = false;
      setRunning(false);
    },
    [analyse]
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return { analysis, run, cancel, running, progress, warming, wasmDead, setAnalysis };
}
