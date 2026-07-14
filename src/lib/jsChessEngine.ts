"use client";

import { Chess, type Move } from "chess.js";

/**
 * Pure-JS chess engine — final fallback when Stockfish WASM and the
 * server engine are both unreachable. Negamax with alpha-beta pruning
 * over a simple material + mobility evaluation, plus piece-square
 * tables for a more human-looking opening / middlegame.
 *
 * It's not a competition engine — depth 3 plays roughly 1100–1400 Elo
 * depending on the position — but it always plays a legal, reasonable
 * move, never deadlocks, and runs anywhere chess.js does.
 *
 *   getBestMoveJS(fen, elo)  → returns UCI string or null
 *
 * Elo mapping:
 *   ≤  500 → depth 1, top-K random pick (8 candidates)
 *   ≤  900 → depth 2, top-K random pick (5 candidates)
 *   ≤ 1500 → depth 3, top-K random pick (3 candidates)
 *   > 1500 → depth 3, always-best move
 *
 * The top-K randomness gives lower-rated bots a believable "blundery"
 * personality without making moves completely irrational.
 */

/** Material values in centipawns. */
const PIECE_VALUE: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20_000,
};

/**
 * Piece-square tables (white perspective, rank-8 first). Values are
 * centipawn adjustments added to the piece's base material score.
 * Mirrored along the rank axis for black.
 *
 * Numbers come from the classic Tomasz Michniewski tables — battle-tested,
 * tiny, and easy to reason about.
 */
// prettier-ignore
const PST: Record<string, number[]> = {
  p: [
      0,   0,   0,   0,   0,   0,   0,   0,
     50,  50,  50,  50,  50,  50,  50,  50,
     10,  10,  20,  30,  30,  20,  10,  10,
      5,   5,  10,  25,  25,  10,   5,   5,
      0,   0,   0,  20,  20,   0,   0,   0,
      5,  -5, -10,   0,   0, -10,  -5,   5,
      5,  10,  10, -20, -20,  10,  10,   5,
      0,   0,   0,   0,   0,   0,   0,   0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20,   0,   0,   0,   0, -20, -40,
    -30,   0,  10,  15,  15,  10,   0, -30,
    -30,   5,  15,  20,  20,  15,   5, -30,
    -30,   0,  15,  20,  20,  15,   0, -30,
    -30,   5,  10,  15,  15,  10,   5, -30,
    -40, -20,   0,   5,   5,   0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10,   0,   0,   0,   0,   0,   0, -10,
    -10,   0,   5,  10,  10,   5,   0, -10,
    -10,   5,   5,  10,  10,   5,   5, -10,
    -10,   0,  10,  10,  10,  10,   0, -10,
    -10,  10,  10,  10,  10,  10,  10, -10,
    -10,   5,   0,   0,   0,   0,   5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  r: [
      0,   0,   0,   0,   0,   0,   0,   0,
      5,  10,  10,  10,  10,  10,  10,   5,
     -5,   0,   0,   0,   0,   0,   0,  -5,
     -5,   0,   0,   0,   0,   0,   0,  -5,
     -5,   0,   0,   0,   0,   0,   0,  -5,
     -5,   0,   0,   0,   0,   0,   0,  -5,
     -5,   0,   0,   0,   0,   0,   0,  -5,
      0,   0,   0,   5,   5,   0,   0,   0,
  ],
  q: [
    -20, -10, -10,  -5,  -5, -10, -10, -20,
    -10,   0,   0,   0,   0,   0,   0, -10,
    -10,   0,   5,   5,   5,   5,   0, -10,
     -5,   0,   5,   5,   5,   5,   0,  -5,
      0,   0,   5,   5,   5,   5,   0,  -5,
    -10,   5,   5,   5,   5,   5,   0, -10,
    -10,   0,   5,   0,   0,   0,   0, -10,
    -20, -10, -10,  -5,  -5, -10, -10, -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
     20,  20,   0,   0,   0,   0,  20,  20,
     20,  30,  10,   0,   0,  10,  30,  20,
  ],
};

function pstIndex(rankIdx: number, fileIdx: number, isWhite: boolean): number {
  return isWhite ? rankIdx * 8 + fileIdx : (7 - rankIdx) * 8 + fileIdx;
}

/** Position evaluation from the side-to-move's perspective. */
function evaluate(c: Chess): number {
  if (c.isCheckmate()) return -100_000;
  if (c.isDraw() || c.isStalemate() || c.isThreefoldRepetition()) return 0;

  const board = c.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r]?.[f];
      if (!sq) continue;
      const base = PIECE_VALUE[sq.type] ?? 0;
      const pst = PST[sq.type]?.[pstIndex(r, f, sq.color === "w")] ?? 0;
      const sign = sq.color === "w" ? 1 : -1;
      score += sign * (base + pst);
    }
  }
  // Flip so the score is from the side-to-move's perspective.
  return c.turn() === "w" ? score : -score;
}

/** Order moves: captures (MVV-LVA), promotions, then quiet — improves alpha-beta. */
function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => moveScore(b) - moveScore(a));
}

function moveScore(m: Move): number {
  let s = 0;
  if (m.captured) {
    s += 10 * (PIECE_VALUE[m.captured] ?? 0) - (PIECE_VALUE[m.piece] ?? 0);
  }
  if (m.promotion) s += PIECE_VALUE[m.promotion] ?? 0;
  if ((m.flags ?? "").includes("c")) s += 5; // castling
  // Checks first — under tight deadlines this guarantees we always look at
  // mate-delivering moves before quiet moves get evaluated.
  if (m.san?.endsWith("#")) s += 50_000;
  else if (m.san?.endsWith("+")) s += 50;
  return s;
}

/** Scan root moves for an immediate checkmate. Cheap, always runs first. */
function findMateInOne(c: Chess, moves: Move[]): Move | null {
  for (const m of moves) {
    if (m.san?.endsWith("#")) return m;
    // Some chess.js versions don't suffix '#' until after the move is made;
    // double-check by playing it.
    c.move(m);
    const mate = c.isCheckmate();
    c.undo();
    if (mate) return m;
  }
  return null;
}

/**
 * Quiescence search — at the leaf, keep searching captures and promotions
 * until the position is "quiet". Without this the fixed-depth negamax has a
 * horizon effect and happily hangs pieces to a recapture one ply past the
 * limit. This is the single biggest strength fix for the fallback engine.
 */
function quiescence(
  c: Chess,
  alpha: number,
  beta: number,
  deadline: number,
): number {
  if (c.isGameOver()) return evaluate(c);
  const standPat = evaluate(c);
  if (standPat >= beta) return beta;
  if (standPat > alpha) alpha = standPat;
  if (Date.now() > deadline) return alpha;

  const tactical = orderMoves(
    c.moves({ verbose: true }).filter((m) => m.captured || m.promotion),
  );
  for (const m of tactical) {
    c.move(m);
    const score = -quiescence(c, -beta, -alpha, deadline);
    c.undo();
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

interface NegamaxResult {
  score: number;
  move: Move | null;
}

function negamax(
  c: Chess,
  depth: number,
  alpha: number,
  beta: number,
  deadline: number,
): NegamaxResult {
  if (Date.now() > deadline) {
    return { score: evaluate(c), move: null };
  }
  if (c.isGameOver()) {
    return { score: evaluate(c), move: null };
  }
  if (depth === 0) {
    return { score: quiescence(c, alpha, beta, deadline), move: null };
  }
  const moves = orderMoves(c.moves({ verbose: true }));
  if (moves.length === 0) {
    return { score: evaluate(c), move: null };
  }

  let bestMove: Move | null = null;
  let bestScore = -Infinity;
  for (const m of moves) {
    c.move(m);
    const { score } = negamax(c, depth - 1, -beta, -alpha, deadline);
    c.undo();
    const flipped = -score;
    if (flipped > bestScore) {
      bestScore = flipped;
      bestMove = m;
    }
    alpha = Math.max(alpha, flipped);
    if (alpha >= beta) break;
  }
  return { score: bestScore, move: bestMove };
}

interface EngineConfig {
  depth: number;
  topK: number;
  budgetMs: number;
}

function configForElo(elo: number): EngineConfig {
  // Depth and time budget scale with Elo so the strength slider actually does
  // something above 1500. Combined with quiescence search, each extra ply is a
  // real strength jump. High bots get a longer budget — a slower answer beats
  // a mislabeled weak one; iterative deepening still replies on time.
  if (elo <= 500) return { depth: 1, topK: 6, budgetMs: 1200 };
  if (elo <= 900) return { depth: 2, topK: 4, budgetMs: 1200 };
  if (elo <= 1300) return { depth: 3, topK: 3, budgetMs: 1200 };
  if (elo <= 1700) return { depth: 4, topK: 2, budgetMs: 1200 };
  if (elo <= 2200) return { depth: 5, topK: 1, budgetMs: 2500 };
  return { depth: 6, topK: 1, budgetMs: 3000 };
}

/**
 * Return the engine's chosen move in UCI form, or null if there are no
 * legal moves (game over).
 *
 * Time-budgeted via iterative deepening: always returns the deepest fully
 * completed search, capped per Elo (~1.2–3 s).
 */
export function getBestMoveJS(fen: string, elo: number = 1600): string | null {
  let c: Chess;
  try {
    c = new Chess(fen);
  } catch {
    return null;
  }
  if (c.isGameOver()) return null;

  const { depth: maxDepth, topK, budgetMs } = configForElo(elo);
  // Iterative deepening below means we always have a complete result to fall
  // back on if the budget runs out.
  const deadline = Date.now() + budgetMs;

  const allMoves = c.moves({ verbose: true });

  // Fast path: if any root move is a forced checkmate, just play it. This
  // guarantees we never miss mate-in-1 even when the deeper search would
  // time out before reaching that move in the iteration order.
  const mate = findMateInOne(c, allMoves);
  if (mate) return `${mate.from}${mate.to}${mate.promotion ?? ""}`;

  const rootMoves = orderMoves(allMoves);
  // Iterative deepening: keep the deepest ranking that FULLY completed, so a
  // mid-search timeout never leaves us choosing from a partial (and thus
  // capture-biased) scan. maxDepth caps strength per Elo; weak bots stay
  // shallow even when there's time to spare.
  let scored: { move: Move; score: number }[] = rootMoves.map((m) => ({ move: m, score: 0 }));
  for (let d = 1; d <= maxDepth; d++) {
    const partial: { move: Move; score: number }[] = [];
    let completed = true;
    for (const m of rootMoves) {
      if (Date.now() > deadline) {
        completed = false;
        break;
      }
      c.move(m);
      const { score } = negamax(c, d - 1, -Infinity, Infinity, deadline);
      c.undo();
      partial.push({ move: m, score: -score });
    }
    if (!completed) break;
    partial.sort((a, b) => b.score - a.score);
    scored = partial;
  }

  if (scored.length === 0) return null;

  const pool = scored.slice(0, Math.min(topK, scored.length));
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? scored[0];
  const m = pick.move;
  return `${m.from}${m.to}${m.promotion ?? ""}`;
}
