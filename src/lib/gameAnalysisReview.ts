import { Chess } from "chess.js";

export type Classification = "best" | "good" | "inaccuracy" | "mistake" | "blunder";

export const CLASSIFICATION_META: Record<
  Classification,
  { label: string; color: string; symbol: string }
> = {
  best: { label: "Best", color: "#3fb27f", symbol: "★" },
  good: { label: "Good", color: "#7f9cf5", symbol: "✓" },
  inaccuracy: { label: "Inaccuracy", color: "#e8c14b", symbol: "?!" },
  mistake: { label: "Mistake", color: "#e8954b", symbol: "?" },
  blunder: { label: "Blunder", color: "#e0655c", symbol: "??" },
};

export interface MoveReviewRow {
  playedSan: string;
  bestSan: string;
  /** Mover-perspective centipawn loss vs the best move. */
  cpLoss?: number;
  classification?: Classification;
  /** Evaluation AFTER the move, from white's perspective. */
  evalCp?: number | null;
  evalMate?: number | null;
}

export interface SideStats {
  inaccuracies: number;
  mistakes: number;
  blunders: number;
  acpl: number;
  accuracy?: number;
}

export interface StoredGameAnalysis {
  white: SideStats;
  black: SideStats;
  evalSeries: { ply: number; cp: number }[];
  moveReviews?: MoveReviewRow[];
}

/** White-POV win probability (0–100) from an evaluation (lichess model). */
export function winPercent(cp: number | null, mate: number | null): number {
  if (mate !== null) return mate > 0 ? 100 : 0;
  if (cp === null) return 50;
  const c = Math.max(-1000, Math.min(1000, cp));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1);
}

/** Per-move accuracy (0–100) from the mover's win% before vs after (lichess formula). */
export function moveAccuracy(winBefore: number, winAfter: number): number {
  const acc = 103.1668 * Math.exp(-0.04354 * (winBefore - winAfter)) - 3.1669;
  return Math.max(0, Math.min(100, acc));
}

/** Classify a move from the mover's win-probability drop. */
export function classifyByWinDelta(delta: number, isBest: boolean): Classification {
  if (isBest || delta <= 2) return "best";
  if (delta <= 5) return "good";
  if (delta <= 10) return "inaccuracy";
  if (delta <= 20) return "mistake";
  return "blunder";
}

export function parseGameAnalysis(json: string | null | undefined): StoredGameAnalysis | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as StoredGameAnalysis;
  } catch {
    return null;
  }
}

/** FEN after applying the first `count` moves from `sanMoves` (0 = start). */
export function fenAfterMoves(sanMoves: string[], count: number): string {
  const chess = new Chess();
  const n = Math.max(0, Math.min(count, sanMoves.length));
  for (let i = 0; i < n; i++) {
    try {
      chess.move(sanMoves[i]!);
    } catch {
      break;
    }
  }
  return chess.fen();
}

export function sanToArrow(
  fen: string,
  san: string
): { startSquare: string; endSquare: string } | null {
  const chess = new Chess();
  try {
    chess.load(fen);
  } catch {
    return null;
  }
  const verbose = chess.moves({ verbose: true });
  const m = verbose.find((x) => x.san === san);
  if (!m) return null;
  return { startSquare: m.from, endSquare: m.to };
}

export function hasMoveReviewData(analysis: StoredGameAnalysis | null): boolean {
  return !!(analysis?.moveReviews && analysis.moveReviews.length > 0);
}
