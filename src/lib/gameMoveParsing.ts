/** Strip move-number tokens (e.g. "1.", "12.") from a PGN-style move list. */
export function parseMoveTokens(moves: string): string[] {
  return moves
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0 && !/^\d+\.?$/.test(t));
}
