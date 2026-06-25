/**
 * Per-move analysis for a finished placement game. Evaluates each position once
 * with the in-browser engine, then derives centipawn loss + lichess move-accuracy
 * for the USER's moves only (the server fuses these into the rating estimate).
 *
 * `analyse` returns WHITE-POV cp/mate + the engine's best move (see useStockfish).
 */

import { Chess } from "chess.js";
import { winPercent, moveAccuracy } from "@/lib/gameAnalysisReview";
import type { AnalysisResult } from "@/lib/useStockfish";

export interface PlacementMoveStat {
  cpLoss: number;
  accuracy: number;
}

/** Opening plies to skip (book moves shouldn't count toward strength). */
const BOOK_PLIES = 4;
/** Mate scores capped to a large cp value for cpLoss arithmetic. */
const MATE_CP = 1000;

function whiteCp(r: AnalysisResult | undefined): number {
  if (!r) return 0;
  if (r.mate != null) return r.mate > 0 ? MATE_CP : -MATE_CP;
  return r.cp ?? 0;
}

export async function analyzePlacementGame(opts: {
  startFen: string;
  moves: string[]; // UCI moves in order
  userColor: "w" | "b";
  analyse: (fen: string, depth?: number) => Promise<AnalysisResult>;
  depth?: number;
  onProgress?: (done: number, total: number) => void;
}): Promise<PlacementMoveStat[]> {
  const { startFen, moves, userColor, analyse, depth = 11, onProgress } = opts;

  // FEN before each move (fens[i]); fens[moves.length] is the final position.
  const fens: string[] = [];
  const chess = new Chess(startFen);
  fens.push(chess.fen());
  for (const uci of moves) {
    try {
      chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: (uci[4] as "q" | "r" | "b" | "n") || undefined,
      });
      fens.push(chess.fen());
    } catch {
      break;
    }
  }

  // One eval per position (reused for both "before" and "after").
  const evals: AnalysisResult[] = [];
  for (let i = 0; i < fens.length; i++) {
    evals.push(await analyse(fens[i], depth));
    onProgress?.(i + 1, fens.length);
  }

  const stats: PlacementMoveStat[] = [];
  for (let i = 0; i < moves.length; i++) {
    const sideToMove = fens[i].split(" ")[1] === "b" ? "b" : "w";
    if (sideToMove !== userColor) continue; // only the user's own moves
    if (i < BOOK_PLIES) continue; // skip opening book

    const before = evals[i];
    const after = evals[i + 1];
    if (!before || !after) continue;

    // Mover-POV centipawns.
    const moverBest = userColor === "w" ? whiteCp(before) : -whiteCp(before);
    const moverAfter = userColor === "w" ? whiteCp(after) : -whiteCp(after);

    // Mover-POV win% before/after (winPercent is white-POV).
    const wpBefore = winPercent(before.cp, before.mate);
    const wpAfter = winPercent(after.cp, after.mate);
    const winBefore = userColor === "w" ? wpBefore : 100 - wpBefore;
    const winAfter = userColor === "w" ? wpAfter : 100 - wpAfter;

    // Skip dead-won/dead-lost positions where precision is meaningless.
    if (winBefore < 5 || winBefore > 95) continue;

    stats.push({
      cpLoss: Math.max(0, moverBest - moverAfter),
      accuracy: moveAccuracy(winBefore, winAfter),
    });
  }
  return stats;
}
