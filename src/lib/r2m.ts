/**
 * Road to Master (R2M) — gamification system, derived purely from
 * the user's existing rating, XP, and puzzle stats. No backend changes.
 *
 * Ranks loosely mirror the "Solo Leveling" hunter ranks, mapped to chess strength:
 *   E < D < C < B < A < S < SS
 */

export type R2MRank = "E" | "D" | "C" | "B" | "A" | "S" | "SS";

export interface R2MTier {
  rank: R2MRank;
  label: string;
  /** Lower bound of the rank (rating). */
  ratingMin: number;
  /** Upper bound (exclusive) of the rank, or null for top rank. */
  ratingMax: number | null;
  /** Hex colour used for accents. */
  color: string;
  description: string;
}

export const R2M_TIERS: R2MTier[] = [
  { rank: "E", label: "Awakened",    ratingMin: 0,    ratingMax: 1000, color: "#9ca3af", description: "Hunter awakens. Master piece safety, pins, forks, and basic mate." },
  { rank: "D", label: "Apprentice",  ratingMin: 1000, ratingMax: 1200, color: "#a3e635", description: "Open with principles, see two-move tactics, finish K+P endgames." },
  { rank: "C", label: "Tactician",   ratingMin: 1200, ratingMax: 1500, color: "#22d3ee", description: "Combinations 3–5 plies deep, opening repertoire, basic strategy." },
  { rank: "B", label: "Strategist",  ratingMin: 1500, ratingMax: 1800, color: "#a78bfa", description: "Pawn structures, prophylaxis, accurate rook endgames." },
  { rank: "A", label: "Hunter",      ratingMin: 1800, ratingMax: 2100, color: "#fb923c", description: "Deep prep, dynamic sacrifices, theoretical endgames (Lucena, Philidor)." },
  { rank: "S", label: "Shadow",      ratingMin: 2100, ratingMax: 2400, color: "#f472b6", description: "Master-candidate work: critical lines, calculation under pressure." },
  { rank: "SS",label: "Monarch",     ratingMin: 2400, ratingMax: null, color: "#e6a452", description: "Top of the academy. Theory, novelty, and complete chess understanding." },
];

export function tierForRating(rating: number): R2MTier {
  return R2M_TIERS.find(
    (t) => rating >= t.ratingMin && (t.ratingMax === null || rating < t.ratingMax)
  ) ?? R2M_TIERS[0];
}

export function nextTier(current: R2MTier): R2MTier | null {
  const idx = R2M_TIERS.findIndex((t) => t.rank === current.rank);
  return idx >= 0 && idx < R2M_TIERS.length - 1 ? R2M_TIERS[idx + 1] : null;
}

export function progressInTier(rating: number): { pct: number; pointsRemaining: number | null } {
  const t = tierForRating(rating);
  if (t.ratingMax === null) return { pct: 100, pointsRemaining: null };
  const span = t.ratingMax - t.ratingMin;
  const pct = Math.max(0, Math.min(100, ((rating - t.ratingMin) / span) * 100));
  return { pct, pointsRemaining: Math.max(0, t.ratingMax - rating) };
}

/* -------- Skill tree -------- */

export type SkillCategory = "openings" | "tactics" | "strategy" | "endgame" | "calculation";

export interface SkillNode {
  id: string;
  name: string;
  category: SkillCategory;
  /** Minimum tier rank required to unlock. */
  unlockAt: R2MRank;
  description: string;
  /** Optional legend / inspiration. */
  legend?: string;
}

export const SKILL_TREE: SkillNode[] = [
  // Openings
  { id: "op-principles",  name: "Opening Principles",       category: "openings",  unlockAt: "E", description: "Centre, develop, castle. Avoid early queen sorties.", legend: "Paul Morphy" },
  { id: "op-italian",     name: "Italian Game",             category: "openings",  unlockAt: "D", description: "Classical attacking setup with bishop on c4." },
  { id: "op-london",      name: "London System",            category: "openings",  unlockAt: "D", description: "Solid, repeatable system for white. Low theory." },
  { id: "op-sicilian",    name: "Sicilian Defence",         category: "openings",  unlockAt: "C", description: "Fight for the centre asymmetrically as black." },
  { id: "op-prep",        name: "Repertoire Building",      category: "openings",  unlockAt: "B", description: "Curate lines that fit your style; learn typical middlegames." },
  { id: "op-novelty",     name: "Theoretical Novelties",    category: "openings",  unlockAt: "A", description: "Find improvements in critical lines using the engine." },

  // Tactics
  { id: "tx-pin",         name: "Pins, Forks, Skewers",     category: "tactics",   unlockAt: "E", description: "The atomic patterns. Drill until automatic." },
  { id: "tx-discovery",   name: "Discovered Attacks",       category: "tactics",   unlockAt: "D", description: "Battery and reveal. The most dangerous family." },
  { id: "tx-sacrifice",   name: "Mating Attack",            category: "tactics",   unlockAt: "C", description: "Greek gift, h-file, smothered mate.", legend: "Mikhail Tal" },
  { id: "tx-defence",     name: "Defensive Resources",      category: "tactics",   unlockAt: "B", description: "Counter-attack, perpetuals, fortress.", legend: "Tigran Petrosian" },

  // Strategy
  { id: "st-pawn",        name: "Pawn Structures",          category: "strategy",  unlockAt: "C", description: "Carlsbad, IQP, hanging pawns." },
  { id: "st-prophylaxis", name: "Prophylaxis",              category: "strategy",  unlockAt: "B", description: "What does my opponent want? Stop it first.", legend: "Anatoly Karpov" },
  { id: "st-imbalance",   name: "Imbalances",               category: "strategy",  unlockAt: "B", description: "Bishop pair, weak squares, space, time." },
  { id: "st-positional",  name: "Positional Sacrifice",     category: "strategy",  unlockAt: "A", description: "Long-term compensation for material." },

  // Endgame
  { id: "eg-kp",          name: "King + Pawn",              category: "endgame",   unlockAt: "E", description: "Opposition, key squares, the rule of the square." },
  { id: "eg-rooks",       name: "Rook Endgames",            category: "endgame",   unlockAt: "C", description: "Lucena, Philidor, Vancura. Most common endgame.", legend: "José Raúl Capablanca" },
  { id: "eg-minor",       name: "Minor-Piece Endings",      category: "endgame",   unlockAt: "B", description: "Bishop vs knight, opposite-coloured bishops, fortresses." },
  { id: "eg-technique",   name: "Conversion Technique",     category: "endgame",   unlockAt: "A", description: "Convert small advantages with no margin for error." },

  // Calculation
  { id: "ca-visual",      name: "Visualization",            category: "calculation", unlockAt: "D", description: "Hold the board in your head. Blindfold drills." },
  { id: "ca-candidates",  name: "Candidate Moves",          category: "calculation", unlockAt: "C", description: "List, prune, calculate. Don't miss replies." },
  { id: "ca-deep",        name: "Long Calculation",         category: "calculation", unlockAt: "A", description: "8+ ply with branching, accurately." },
];

/* -------- Daily quests -------- */

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xp: number;
  /** Unlock rank — players below see it greyed-out as a future quest. */
  minRank: R2MRank;
}

export const DAILY_QUESTS: DailyQuest[] = [
  { id: "q-puzzles",  title: "The Daily Grind",     description: "Solve 10 tactics puzzles in a row.",                xp: 50,  minRank: "E" },
  { id: "q-game",     title: "Live Battle",         description: "Play one rated game, win or lose.",                 xp: 30,  minRank: "E" },
  { id: "q-shadow",   title: "Shadow Extract",      description: "Analyze one lost game; mark the turning point.",    xp: 60,  minRank: "D" },
  { id: "q-opening",  title: "Theory Session",      description: "Drill 15 minutes of an opening you play.",          xp: 40,  minRank: "C" },
  { id: "q-endgame",  title: "Endgame Drill",       description: "Convert a winning K+P or R+P endgame.",             xp: 50,  minRank: "C" },
  { id: "q-deep",     title: "Deep Dive",           description: "Find a master-game novelty and explain it.",        xp: 80,  minRank: "B" },
];

/* -------- XP curve -------- */

const XP_PER_LEVEL = 100;

export function levelFromXp(xp: number): number {
  return 1 + Math.floor(xp / XP_PER_LEVEL);
}

export function xpProgress(xp: number): { pct: number; current: number; needed: number; level: number } {
  const level = levelFromXp(xp);
  const baseline = (level - 1) * XP_PER_LEVEL;
  const current = xp - baseline;
  return { pct: Math.min(100, (current / XP_PER_LEVEL) * 100), current, needed: XP_PER_LEVEL, level };
}

export function rankAtLeast(actual: R2MRank, required: R2MRank): boolean {
  const order: R2MRank[] = ["E", "D", "C", "B", "A", "S", "SS"];
  return order.indexOf(actual) >= order.indexOf(required);
}
