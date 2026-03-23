import { Chess, type Move, type Square } from "chess.js";

/** Legal moves as if it were `side` to move (same piece placement; EP cleared for stability). */
export function legalMovesIfSideToMove(fen: string, side: "w" | "b"): Move[] {
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4) return [];
  parts[1] = side;
  parts[3] = "-";
  const fen6 = parts.slice(0, 6).join(" ");
  const c = new Chess();
  try {
    c.load(fen6);
  } catch {
    return [];
  }
  return c.moves({ verbose: true }) as Move[];
}

export function uciFromVerbose(m: Pick<Move, "from" | "to" | "promotion">): string {
  const p = m.promotion ? m.promotion.toLowerCase() : "";
  return `${m.from}${m.to}${p}`;
}

export function findPremoveMove(fen: string, side: "w" | "b", from: Square, to: Square): Move | null {
  const legal = legalMovesIfSideToMove(fen, side);
  const match = legal.find((m) => m.from === from && m.to === to);
  return match ?? null;
}

export function isPremoveStillValid(fen: string, side: "w" | "b", from: string, to: string): boolean {
  return findPremoveMove(fen, side, from as Square, to as Square) !== null;
}
