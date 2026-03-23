import { Chess } from "chess.js";

export interface MoveReviewRow {
  playedSan: string;
  bestSan: string;
}

export interface StoredGameAnalysis {
  white: { inaccuracies: number; mistakes: number; blunders: number; acpl: number };
  black: { inaccuracies: number; mistakes: number; blunders: number; acpl: number };
  evalSeries: { ply: number; cp: number }[];
  moveReviews?: MoveReviewRow[];
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
