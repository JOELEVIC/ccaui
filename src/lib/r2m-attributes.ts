/**
 * Road to Master — six-attribute RPG profile.
 *
 * Maps a chess player's behaviour onto a Solo-Leveling-style stat block.
 * Each attribute is scored 0–100; the radar chart in StatusWindow visualises them.
 *
 * The mapping is intentionally lossy and *evocative*, not a forensic engine
 * report. We avoid Stockfish here so the profile can be computed client-side
 * from PGN headers + move counts alone.
 */

export type AttrKey =
  | "strength"     // Tactical aggression: captures, sacrifices, attacking themes
  | "agility"      // Speed under pressure: bullet/blitz rating, fast wins
  | "intelligence" // Opening theory & repertoire: known lines, accuracy in opening
  | "vitality"     // Defensive endurance: long games saved, comebacks
  | "sense"        // Prophylaxis: quiet moves, threat prevention, low-blunder games
  | "willpower";   // Endgame conversion: technical wins from small advantages

export interface Attributes {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  sense: number;
  willpower: number;
}

export const ATTR_META: Record<AttrKey, { label: string; flavour: string; chess: string; accent: string }> = {
  strength:     { label: "Strength",     flavour: "Tactics",      chess: "Captures, sacrifices, mating attacks",          accent: "var(--sys-threat)" },
  agility:      { label: "Agility",      flavour: "Speed",        chess: "Bullet & blitz performance, fast conversion",   accent: "var(--sys-cyan)" },
  intelligence: { label: "Intelligence", flavour: "Theory",       chess: "Opening repertoire breadth and accuracy",       accent: "var(--sys-epic)" },
  vitality:     { label: "Vitality",     flavour: "Defense",      chess: "Long-game endurance, defensive saves",          accent: "#a3e635" },
  sense:        { label: "Sense",        flavour: "Prophylaxis",  chess: "Reading opponent intent before they act",       accent: "var(--sys-purple)" },
  willpower:    { label: "Willpower",    flavour: "Endgame",      chess: "Converting small advantages without error",     accent: "var(--sys-prestige-gold)" },
};

export const ATTR_ORDER: AttrKey[] = ["strength", "agility", "intelligence", "vitality", "sense", "willpower"];

/* ────────────────────────────────────────────────────────────────────
 * Hunter Class — auto-assigned from the attribute profile.
 *
 * Each class has two "primary" attributes. The classifier picks the class
 * whose primaries best match the player's two strongest stats.
 * ─────────────────────────────────────────────────────────────────── */

export type HunterClass =
  | "assassin"
  | "architect"
  | "guardian"
  | "tactician"
  | "predator"
  | "sage";

export interface HunterClassDef {
  id: HunterClass;
  name: string;
  /** One-line identity. */
  tagline: string;
  /** Two driving attributes. */
  primary: [AttrKey, AttrKey];
  /** Recommended grandmaster mentor (Legendary Recommendation). */
  mentor: { name: string; era: string; quote: string };
  /** Accent colour for badges and the licence card. */
  accent: string;
  /** Glyph (single character / emoji). */
  glyph: string;
}

export const HUNTER_CLASSES: HunterClassDef[] = [
  {
    id: "assassin",
    name: "The Assassin",
    tagline: "Strike fast. Strike once.",
    primary: ["strength", "agility"],
    mentor: { name: "Mikhail Tal", era: "8th World Champion", quote: "You must take the reader into a deep, dark forest." },
    accent: "var(--sys-threat)",
    glyph: "✦",
  },
  {
    id: "architect",
    name: "The Architect",
    tagline: "Every square has a plan.",
    primary: ["intelligence", "sense"],
    mentor: { name: "Anatoly Karpov", era: "12th World Champion", quote: "Style? I have no style." },
    accent: "var(--sys-epic)",
    glyph: "◇",
  },
  {
    id: "guardian",
    name: "The Guardian",
    tagline: "Their attack will break before you do.",
    primary: ["vitality", "willpower"],
    mentor: { name: "Tigran Petrosian", era: "9th World Champion", quote: "Defence is the soul of chess." },
    accent: "#a3e635",
    glyph: "◈",
  },
  {
    id: "tactician",
    name: "The Tactician",
    tagline: "Calculation as a weapon.",
    primary: ["strength", "intelligence"],
    mentor: { name: "Garry Kasparov", era: "13th World Champion", quote: "Tactics flow from a superior position." },
    accent: "var(--sys-cyan)",
    glyph: "◆",
  },
  {
    id: "predator",
    name: "The Predator",
    tagline: "Patient. Inevitable.",
    primary: ["sense", "strength"],
    mentor: { name: "Magnus Carlsen", era: "16th World Champion", quote: "I let my opponents do the dreaming." },
    accent: "var(--sys-purple)",
    glyph: "✶",
  },
  {
    id: "sage",
    name: "The Sage",
    tagline: "The endgame begins on move one.",
    primary: ["intelligence", "willpower"],
    mentor: { name: "José Raúl Capablanca", era: "3rd World Champion", quote: "A good player is always lucky." },
    accent: "var(--sys-prestige-gold)",
    glyph: "✧",
  },
];

export function classDefById(id: HunterClass): HunterClassDef {
  return HUNTER_CLASSES.find((c) => c.id === id) ?? HUNTER_CLASSES[3];
}

/* ────────────────────────────────────────────────────────────────────
 * Attribute helpers
 * ─────────────────────────────────────────────────────────────────── */

export function attrAverage(a: Attributes): number {
  return Math.round(
    (a.strength + a.agility + a.intelligence + a.vitality + a.sense + a.willpower) / 6
  );
}

export function rankAttributes(a: Attributes): { key: AttrKey; value: number }[] {
  return ATTR_ORDER.map((k) => ({ key: k, value: a[k] })).sort((x, y) => y.value - x.value);
}

/** Weakest attribute — used to recommend a "Dungeon" (course). */
export function weakestAttribute(a: Attributes): AttrKey {
  return rankAttributes(a)[ATTR_ORDER.length - 1].key;
}

/** Pick the Hunter Class whose two primaries best fit the player. */
export function classifyByAttributes(a: Attributes): HunterClassDef {
  const ranked = rankAttributes(a);
  const top1 = ranked[0].key;
  const top2 = ranked[1].key;

  let best = HUNTER_CLASSES[0];
  let bestScore = -1;
  for (const c of HUNTER_CLASSES) {
    let score = 0;
    if (c.primary.includes(top1)) score += 2;
    if (c.primary.includes(top2)) score += 1;
    // Bonus when the class's two primaries are *both* in the player's top three
    const top3 = new Set([ranked[0].key, ranked[1].key, ranked[2].key]);
    if (top3.has(c.primary[0]) && top3.has(c.primary[1])) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

/** "Dungeon" recommendation — the weakest stat decides which course to push. */
export function recommendedDungeon(a: Attributes): {
  attribute: AttrKey;
  title: string;
  href: string;
} {
  const weak = weakestAttribute(a);
  const map: Record<AttrKey, { title: string; href: string }> = {
    strength:     { title: "Mating-Attack Dojo",     href: "/learning?focus=tactics" },
    agility:      { title: "Blitz Arena: 60 games",  href: "/play/bot?elo=1500" },
    intelligence: { title: "Repertoire Forge",       href: "/learning?focus=openings" },
    vitality:     { title: "Endurance Trials",       href: "/play/bot?elo=1800" },
    sense:        { title: "Prophylaxis Drills",     href: "/learning?focus=strategy" },
    willpower:    { title: "Endgame Conservatory",   href: "/learning?focus=endgame" },
  };
  const entry = map[weak];
  return { attribute: weak, title: entry.title, href: entry.href };
}
