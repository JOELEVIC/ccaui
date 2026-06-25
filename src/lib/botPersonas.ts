/**
 * Bot personas + event-keyed chat lines.
 *
 * Zero server cost, no LLM: each persona carries a small bank of in-character
 * lines keyed to deterministic game events (greeting, a capture, a check, the
 * result). The play page picks a line when the matching event fires, so the
 * opponent feels alive without any network round-trip.
 *
 * To keep a big roster maintainable, bots share a handful of "voice" archetypes
 * (gentle / playful / cheeky / aggressive / stoic / precise) rather than each
 * carrying a hand-written bank.
 */

export type ChatEvent =
  | "greeting"
  | "banter"
  | "userCapture"
  | "botCapture"
  | "userCheck"
  | "botCheck"
  | "win"
  | "lose"
  | "draw";

export interface BotPersona {
  id: string;
  name: string;
  avatar: string;
  level: string;
  elo: number;
  tagline: string;
  /** Probability (0–1) of playing a random legal move instead of the engine's
   *  choice — this is what makes weaker bots genuinely beatable (Stockfish can't
   *  play below ~1320 Elo on its own). */
  mistakeChance: number;
  lines: Record<ChatEvent, string[]>;
}

type Voice = Record<ChatEvent, string[]>;

const VOICES: Record<string, Voice> = {
  gentle: {
    greeting: ["Hi! Let's enjoy a friendly game. 😊", "Take your time — we play to learn here.", "Welcome! Show me what you've got."],
    banter: ["Solid move.", "Okay, let's see where this goes.", "Good — keep developing your pieces."],
    userCapture: ["Nice capture — well spotted!", "Good eye, that piece was loose.", "That's the idea. 👍"],
    botCapture: ["I'll take that — plenty of game left.", "Oops, that was hanging. Guard your pieces!", "Try to keep everything protected."],
    userCheck: ["Ooh, check! Bold.", "You've got me on the run — nice.", "Check! I'd better be careful."],
    botCheck: ["Check! Find a safe square for your king.", "Watch your king — stay calm.", "Check — no panic, just careful defence."],
    win: ["Good effort! You'll get me next time. 👏", "I edged that one — fancy a rematch?", "Well played overall."],
    lose: ["You got me — beautifully done! 🎉", "Wonderful play, you earned that.", "I'm impressed!"],
    draw: ["A fair draw — nicely held.", "Even game, well balanced.", "Honours shared. 🤝"],
  },
  playful: {
    greeting: ["Heyyy, let's have some fun! 🎈", "I promise to make this silly.", "Game on! No pressure, just vibes."],
    banter: ["Ooooh interesting.", "Wheee, pieces everywhere.", "Let's gooo."],
    userCapture: ["Yoink! Nice one.", "Aw, you took my buddy. 😭", "Okay that was cool."],
    botCapture: ["Nom nom 🍪", "Mine now, hehe.", "Free piece? Don't mind if I do."],
    userCheck: ["Eep! Check!", "You're chasing my king around 😅", "Okok I'll move!"],
    botCheck: ["Check-a-roo!", "Boop — your king!", "Tag, you're it. Check!"],
    win: ["Yay I won! 🎉 Rematch?", "Teehee, gg!", "That was a blast!"],
    lose: ["Awww you win! 🥳", "GG, you're too good!", "Noooo my pieces. Well played!"],
    draw: ["A draw! High five 🙌", "Tie game, fun though!", "Even-steven 🤝"],
  },
  cheeky: {
    greeting: ["Let's make this sharp. 😏", "I like tactics — hope you do too.", "Board's set. Try to keep up."],
    banter: ["Bold.", "Predictable… or is it?", "Let's complicate things."],
    userCapture: ["Ha! Didn't see that coming.", "Okay okay, nice shot.", "Cheeky. I respect it."],
    botCapture: ["Mine now. 😎", "Snagged it!", "You left that hanging — rude not to take it."],
    userCheck: ["A check? Spicy.", "Alright, you've got my attention.", "Cute. I'll wriggle out."],
    botCheck: ["Check! Dance, king, dance.", "Feel the pressure?", "Tick tock — check."],
    win: ["Too easy 😜 — rematch?", "GG! Tactics win games.", "I did warn you I was sharp."],
    lose: ["Okay, that was slick. Respect. 🙌", "You outplayed me, fair and square.", "Ugh, brilliant. Again?"],
    draw: ["A draw?! I'll take it… this time.", "Tense one, nicely done.", "Split point — rematch to settle it?"],
  },
  aggressive: {
    greeting: ["I'm coming straight for your king. ⚔️", "No quiet games here. Brace yourself.", "Attack is the only defence. Begin."],
    banter: ["Too slow.", "I smell blood.", "Open the lines — I want chaos."],
    userCapture: ["A scratch. I'll have it back.", "Take it. I'm taking your king.", "Trades won't save you."],
    botCapture: ["Crushed. 💥", "Your wall is cracking.", "One down. More to come."],
    userCheck: ["A check? Adorable.", "You poke, I storm.", "Won't slow me down."],
    botCheck: ["Check! And it gets worse.", "Your king is mine — check.", "Run. It won't help. Check."],
    win: ["Checkmate. As promised. 🔥", "The attack always lands.", "Told you. Rematch?"],
    lose: ["You weathered the storm. Respect. 💪", "Beaten at my own game — well done.", "Fine. You earned it."],
    draw: ["A draw?! I wanted blood.", "You survived. Barely.", "Next time I finish it."],
  },
  stoic: {
    greeting: ["Let's play.", "I do not talk much. I calculate.", "Begin."],
    banter: ["…", "Noted.", "Continue."],
    userCapture: ["Fine.", "Material taken. The position remains.", "Acceptable."],
    botCapture: ["Mine.", "An error, punished.", "Material is material."],
    userCheck: ["Check seen.", "Irrelevant.", "Calculated."],
    botCheck: ["Check.", "Your king is exposed.", "Defend, or lose."],
    win: ["It is finished.", "The position decided it.", "As expected."],
    lose: ["You played well. I concede.", "Correct play. Yours.", "A clean defeat."],
    draw: ["Balanced. A draw.", "Equality, held.", "Correct."],
  },
  precise: {
    greeting: ["Precision wins games. Shall we?", "Concentrate. Then play.", "Let us begin. 🎩"],
    banter: ["Reasonable.", "There were better squares.", "Hmm. Continue."],
    userCapture: ["Acceptable — you saw the tactic.", "Correct. That was the move.", "You are paying attention."],
    botCapture: ["A small inaccuracy, duly punished.", "That piece was undefended. Observe.", "Material is material."],
    userCheck: ["A check. I have calculated further.", "Predictable, but adequate.", "I am not concerned."],
    botCheck: ["Check. Calculate before you move.", "Your king is exposed — think.", "Precision now, or it ends."],
    win: ["The position demanded it. Study and return.", "A lesson, not a defeat. Review it.", "Checkmate. Now you know."],
    lose: ["Excellent — you calculated well. 🎓", "I concede. Instructive play.", "Impressive. You have earned this."],
    draw: ["A balanced struggle, well defended.", "Equality, correctly held.", "Respectable chess."],
  },
};

interface BotDef {
  id: string;
  name: string;
  avatar: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Master";
  elo: number;
  tagline: string;
  mistakeChance: number;
  voice: keyof typeof VOICES;
}

const BOT_DEFS: BotDef[] = [
  { id: "pip", name: "Pip", avatar: "🐣", level: "Beginner", elo: 300, tagline: "Just learned the moves — very forgiving.", mistakeChance: 0.55, voice: "gentle" },
  { id: "kofi", name: "Coach Kofi", avatar: "🧑🏾‍🏫", level: "Beginner", elo: 600, tagline: "Patient and encouraging — perfect for learning.", mistakeChance: 0.34, voice: "gentle" },
  { id: "bouba", name: "Bouba", avatar: "🧸", level: "Beginner", elo: 800, tagline: "Loves to trade and keep it simple.", mistakeChance: 0.26, voice: "playful" },
  { id: "zara", name: "Zara", avatar: "⚡", level: "Intermediate", elo: 1000, tagline: "Fast and fearless — rushes the attack.", mistakeChance: 0.18, voice: "aggressive" },
  { id: "amina", name: "Amina", avatar: "😎", level: "Intermediate", elo: 1200, tagline: "Quick, witty, and loves a good tactic.", mistakeChance: 0.13, voice: "cheeky" },
  { id: "tunde", name: "Tunde", avatar: "🛡️", level: "Intermediate", elo: 1400, tagline: "Solid as a wall — grinds you down.", mistakeChance: 0.09, voice: "stoic" },
  { id: "nadia", name: "Nadia", avatar: "🎯", level: "Advanced", elo: 1600, tagline: "A sniper for tactics — punishes loose pieces.", mistakeChance: 0.06, voice: "cheeky" },
  { id: "professor", name: "The Professor", avatar: "🦉", level: "Advanced", elo: 1800, tagline: "Calm, precise, and quietly intimidating.", mistakeChance: 0.04, voice: "precise" },
  { id: "kwame", name: "Kwame", avatar: "🔥", level: "Advanced", elo: 2000, tagline: "A relentless attacker — hunts the king.", mistakeChance: 0.03, voice: "aggressive" },
  { id: "mei", name: "Mei", avatar: "🧊", level: "Advanced", elo: 2150, tagline: "Cold positional grind — no weaknesses.", mistakeChance: 0.02, voice: "stoic" },
  { id: "sofia", name: "Sofia", avatar: "👑", level: "Master", elo: 2300, tagline: "Elegant and deep — calculates the long game.", mistakeChance: 0.015, voice: "precise" },
  { id: "viktor", name: "Viktor", avatar: "⚔️", level: "Master", elo: 2500, tagline: "A tournament killer — sharp and unforgiving.", mistakeChance: 0.01, voice: "aggressive" },
  { id: "akin", name: "Akingbade", avatar: "🧠", level: "Master", elo: 2650, tagline: "Calculates everything — near flawless.", mistakeChance: 0.005, voice: "precise" },
  { id: "titan", name: "Titan", avatar: "🤖", level: "Master", elo: 2850, tagline: "Full-strength engine — almost perfect play.", mistakeChance: 0, voice: "stoic" },
];

export const BOT_PERSONAS: BotPersona[] = BOT_DEFS.map((d) => ({
  id: d.id,
  name: d.name,
  avatar: d.avatar,
  level: d.level,
  elo: d.elo,
  tagline: d.tagline,
  mistakeChance: d.mistakeChance,
  lines: VOICES[d.voice],
}));

export const BOT_LEVELS = ["Beginner", "Intermediate", "Advanced", "Master"] as const;

export function getPersona(id: string): BotPersona {
  return BOT_PERSONAS.find((p) => p.id === id) ?? BOT_PERSONAS[4];
}

/** The persona whose Elo is closest to the given strength (so a bot card and the
 *  Elo-driven engine share one personality). */
export function personaForElo(elo: number): BotPersona {
  return BOT_PERSONAS.reduce((best, p) =>
    Math.abs(p.elo - elo) < Math.abs(best.elo - elo) ? p : best
  );
}

/** Pick a random in-character line for an event (varies by seed). */
export function pickLine(persona: BotPersona, event: ChatEvent, seed: number): string {
  const bank = persona.lines[event];
  if (!bank || bank.length === 0) return "";
  return bank[Math.abs(seed) % bank.length];
}
