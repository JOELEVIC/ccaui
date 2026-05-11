"use client";

/**
 * Heuristic Chess.com → R2M attribute mapper.
 *
 * Given a sample of the player's recent games, compute a 6-attribute profile
 * and a Hunter Class without running a chess engine. Heuristics:
 *
 *   • Strength   — capture density per move + sacrifice signals + win-by-mate share
 *   • Agility    — bullet/blitz rating, fast wins, time class mix
 *   • Intelligence — repertoire breadth (distinct ECO openings) + opening accuracy proxy
 *   • Vitality   — long-game survival, defensive saves (drawn losing positions proxy)
 *   • Sense      — quiet-move density, low-blunder games (short losing streaks)
 *   • Willpower  — endgame conversion, decisive long games
 *
 * The output is intentionally interpretable: every score is a 0–100 number
 * that the radar chart can render directly.
 */

import { Chess } from "chess.js";
import { fetchLatestMonth, fetchMonth, fetchArchives, type ImportedGame } from "./chesscomImport";
import {
  type Attributes,
  type HunterClassDef,
  classifyByAttributes,
  recommendedDungeon,
} from "./r2m-attributes";

export interface HunterProfile {
  username: string;
  /** ISO timestamp of when the profile was computed (cache key). */
  computedAt: string;
  attributes: Attributes;
  hunterClass: HunterClassDef;
  /** Source sample size and median rating across the sample. */
  sample: {
    games: number;
    medianRating: number;
    timeClassMix: Record<string, number>;
    avgPlies: number;
  };
  /** Weakest attribute + recommended dungeon. */
  recommendation: {
    attribute: keyof Attributes;
    title: string;
    href: string;
  };
}

interface GameStats {
  plies: number;
  captures: number;
  checks: number;
  quietMoves: number;
  endedInMate: boolean;
  opening: string;
  perspectiveWin: boolean | null;
  perspectiveLoss: boolean | null;
  myRating: number;
  timeClass: string;
  longEndgame: boolean; // > 50 plies AND last 20 plies have < 4 captures
}

/**
 * Score a single game on quick PGN-level metrics. We deliberately avoid the
 * engine: this runs in the browser within a couple of hundred milliseconds
 * for 50 games.
 */
function analyseGame(g: ImportedGame): GameStats | null {
  try {
    const c = new Chess();
    c.loadPgn(g.pgn);
    const history = c.history({ verbose: true });
    const plies = history.length;
    if (plies < 4) return null;

    let captures = 0;
    let checks = 0;
    let quietMoves = 0;
    for (const m of history) {
      const isCapture = m.captured !== undefined;
      const flags = m.flags ?? "";
      if (isCapture) captures++;
      if (m.san?.endsWith("+") || m.san?.endsWith("#")) checks++;
      if (!isCapture && !flags.includes("e") && !flags.includes("c") && !flags.includes("p")) {
        quietMoves++;
      }
    }
    const endedInMate = history[history.length - 1]?.san?.endsWith("#") ?? false;

    // Long endgame heuristic: late portion of the game has few captures
    const tail = history.slice(-20);
    const tailCaptures = tail.filter((m) => m.captured !== undefined).length;
    const longEndgame = plies > 50 && tailCaptures < 4;

    const ecoHeader = c.header().ECO ?? c.header().Opening ?? "Unknown";

    const target = g.perspective;
    return {
      plies,
      captures,
      checks,
      quietMoves,
      endedInMate,
      opening: ecoHeader,
      perspectiveWin: target ? target.outcome === "win" : null,
      perspectiveLoss: target ? target.outcome === "loss" : null,
      myRating: target ? (target.color === "white" ? g.white.rating : g.black.rating) : 0,
      timeClass: g.timeClass,
      longEndgame,
    };
  } catch {
    return null;
  }
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? Math.round((s[mid - 1] + s[mid]) / 2) : s[mid];
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/**
 * Roll a normalised score for a stat with `value` against a tunable ceiling.
 * 0 → 0, ceiling → 80, ceiling*1.5 → 95. Above that asymptotes to 100.
 */
function score(value: number, ceiling: number): number {
  if (value <= 0) return 0;
  const ratio = value / ceiling;
  return clamp(80 * Math.tanh(ratio * 1.0) + 15 * Math.tanh(ratio - 1));
}

/** Map the per-game stats array to a 6-attribute profile. */
export function attributesFromGames(games: GameStats[]): Attributes {
  if (games.length === 0) {
    return { strength: 30, agility: 30, intelligence: 30, vitality: 30, sense: 30, willpower: 30 };
  }

  const n = games.length;
  const totalPlies = games.reduce((s, g) => s + g.plies, 0);
  const totalCaptures = games.reduce((s, g) => s + g.captures, 0);
  const totalQuiet = games.reduce((s, g) => s + g.quietMoves, 0);
  const totalChecks = games.reduce((s, g) => s + g.checks, 0);
  const wins = games.filter((g) => g.perspectiveWin).length;
  const mateWins = games.filter((g) => g.endedInMate && g.perspectiveWin).length;
  const longGames = games.filter((g) => g.plies > 60).length;
  const longWins = games.filter((g) => g.plies > 60 && g.perspectiveWin).length;
  const longEndgameGames = games.filter((g) => g.longEndgame).length;
  const longEndgameWins = games.filter((g) => g.longEndgame && g.perspectiveWin).length;
  const openings = new Set(games.map((g) => g.opening).filter(Boolean));

  // Time-class breakdown
  const bulletBlitz = games.filter((g) => g.timeClass === "bullet" || g.timeClass === "blitz").length;
  const bulletBlitzWins = games.filter(
    (g) => (g.timeClass === "bullet" || g.timeClass === "blitz") && g.perspectiveWin
  ).length;

  // 1. Strength: capture rate + share of wins via mate + check density
  const captureRate = totalPlies > 0 ? totalCaptures / totalPlies : 0;
  const strength = clamp(
    score(captureRate, 0.18) * 0.55 +     // 18% captures is "sharp"
    score(totalChecks / Math.max(1, totalPlies), 0.10) * 0.20 +
    score(mateWins / Math.max(1, wins || 1), 0.30) * 0.25
  );

  // 2. Agility: share of fast (bullet/blitz) games + win-rate in fast games
  const fastShare = bulletBlitz / n;
  const fastWinRate = bulletBlitz > 0 ? bulletBlitzWins / bulletBlitz : 0;
  const agility = clamp(score(fastShare, 0.6) * 0.5 + score(fastWinRate, 0.55) * 0.5);

  // 3. Intelligence: repertoire breadth (capped at 12 distinct ECOs is "broad")
  //    + win share when playing >40 ply games (deep, controlled play)
  const longishWins = games.filter((g) => g.plies > 40 && g.perspectiveWin).length;
  const intelligence = clamp(
    score(openings.size, 10) * 0.55 +
    score(longishWins / n, 0.35) * 0.45
  );

  // 4. Vitality: long-game survival rate (didn't lose by mate after move 60)
  const longLossByMate = games.filter((g) => g.plies > 60 && g.endedInMate && g.perspectiveLoss).length;
  const longSurvival = longGames > 0 ? 1 - longLossByMate / longGames : 0.5;
  const vitality = clamp(
    score(longGames / n, 0.35) * 0.45 +
    score(longSurvival, 0.85) * 0.55
  );

  // 5. Sense: quiet-move density + draw resilience
  const quietRate = totalPlies > 0 ? totalQuiet / totalPlies : 0;
  const drawShare = games.filter((g) => g.perspectiveWin === false && g.perspectiveLoss === false).length / n;
  const sense = clamp(
    score(quietRate, 0.78) * 0.6 +
    score(drawShare, 0.18) * 0.4
  );

  // 6. Willpower: long endgame conversion + decisive deep wins
  const willpower = clamp(
    score(longEndgameGames / n, 0.30) * 0.4 +
    score(longEndgameWins / Math.max(1, longEndgameGames || 1), 0.55) * 0.4 +
    score(longWins / Math.max(1, longGames || 1), 0.50) * 0.2
  );

  return { strength, agility, intelligence, vitality, sense, willpower };
}

/** Top-level: fetch Chess.com games and produce a full Hunter profile. */
export async function profileFromChessCom(username: string, sampleSize = 50): Promise<HunterProfile> {
  // Pull from latest archive; backfill from prior month if the latest is sparse.
  let raw: ImportedGame[] = [];
  try {
    raw = await fetchLatestMonth(username);
  } catch {
    raw = [];
  }
  if (raw.length < sampleSize) {
    try {
      const archives = await fetchArchives(username);
      // walk backwards through monthly archives until we have enough or run out
      for (let i = archives.length - 2; i >= 0 && raw.length < sampleSize; i--) {
        const url = archives[i];
        // URLs look like .../games/2025/03 — extract year/month
        const m = url.match(/(\d{4})\/(\d{2})$/);
        if (!m) continue;
        const more = await fetchMonth(username, parseInt(m[1], 10), parseInt(m[2], 10));
        raw = raw.concat(more);
      }
    } catch {
      /* no-op — work with what we have */
    }
  }

  const games = raw.slice(0, sampleSize);
  const stats = games.map(analyseGame).filter((s): s is GameStats => s !== null);

  const attributes = attributesFromGames(stats);
  const hunterClass = classifyByAttributes(attributes);
  const rec = recommendedDungeon(attributes);

  const timeClassMix: Record<string, number> = {};
  for (const g of games) timeClassMix[g.timeClass] = (timeClassMix[g.timeClass] ?? 0) + 1;

  const myRatings = stats.map((s) => s.myRating).filter((r) => r > 0);

  return {
    username,
    computedAt: new Date().toISOString(),
    attributes,
    hunterClass,
    sample: {
      games: stats.length,
      medianRating: median(myRatings),
      timeClassMix,
      avgPlies: stats.length > 0 ? Math.round(stats.reduce((s, g) => s + g.plies, 0) / stats.length) : 0,
    },
    recommendation: rec,
  };
}

/** Synthetic profile (used before the user connects Chess.com). */
export function placeholderProfile(rating: number): HunterProfile {
  // Spread attributes around the player's rating tier so the radar isn't flat.
  const base = clamp(Math.round((rating - 600) / 18), 25, 78);
  const jitter = (n: number) => clamp(base + (Math.round(Math.sin(n * 13) * 8)));
  const attributes: Attributes = {
    strength: jitter(1),
    agility: jitter(2),
    intelligence: jitter(3),
    vitality: jitter(4),
    sense: jitter(5),
    willpower: jitter(6),
  };
  const hunterClass = classifyByAttributes(attributes);
  const rec = recommendedDungeon(attributes);
  return {
    username: "Hunter",
    computedAt: new Date().toISOString(),
    attributes,
    hunterClass,
    sample: { games: 0, medianRating: rating, timeClassMix: {}, avgPlies: 0 },
    recommendation: rec,
  };
}
