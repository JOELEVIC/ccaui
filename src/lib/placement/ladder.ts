/**
 * Adaptive calibration ladder for placement. We don't need a full estimate
 * client-side — the server does the authoritative fusion. The ladder's only job
 * is to put the player against *informative* opponents: start mid, then binary-
 * search toward their level so most games are near their true strength.
 */

import { personaForElo, type BotPersona } from "@/lib/botPersonas";

/** How many calibration games a placement runs. */
export const PLACEMENT_GAMES = 5;

const SEED_ELO = 1000;
/** Step sizes shrink each game so the ladder converges. */
const STEPS = [450, 350, 260, 190, 150, 120];
const MIN_ELO = 250;
const MAX_ELO = 2850;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/** Optional one-tap self-report to seed the first opponent (faster convergence). */
export const SEED_CHOICES: { key: string; label: string; elo: number }[] = [
  { key: "new", label: "New to chess", elo: 500 },
  { key: "casual", label: "Casual player", elo: 900 },
  { key: "club", label: "Club level", elo: 1400 },
  { key: "strong", label: "Strong / tournament", elo: 1900 },
];

export function seedElo(choiceKey?: string): number {
  const c = SEED_CHOICES.find((x) => x.key === choiceKey);
  return c ? c.elo : SEED_ELO;
}

/** Next target Elo given the just-finished game's user score (1 / 0.5 / 0). */
export function nextElo(currentElo: number, score: number, gameIndex: number): number {
  const step = STEPS[Math.min(gameIndex, STEPS.length - 1)];
  let delta: number;
  if (score >= 1) delta = step; // won → opponent too weak, climb
  else if (score <= 0) delta = -step; // lost → too strong, drop
  else delta = step * 0.15; // draw → well-matched, small nudge up
  return Math.round(clamp(currentElo + delta, MIN_ELO, MAX_ELO));
}

/** The persona (and its real Elo + mistakeChance) closest to a target. */
export function pickBot(targetElo: number): BotPersona {
  return personaForElo(targetElo);
}
