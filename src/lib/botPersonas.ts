/**
 * Bot personas + event-keyed chat lines.
 *
 * Zero server cost, no LLM: each persona carries a small bank of in-character
 * lines keyed to deterministic game events (greeting, a capture, a check, the
 * result). The play page picks a line when the matching event fires, so the
 * opponent feels alive without any network round-trip.
 */

export type ChatEvent =
  | "greeting"
  | "banter"
  | "userCapture" // the player captured one of the bot's pieces
  | "botCapture" // the bot captured one of the player's pieces
  | "userCheck" // the player put the bot in check
  | "botCheck" // the bot put the player in check
  | "win" // bot won
  | "lose" // bot lost
  | "draw";

export interface BotPersona {
  id: string;
  name: string;
  avatar: string;
  level: string;
  elo: number;
  tagline: string;
  /**
   * Probability (0–1) that the bot plays a random legal move instead of the
   * engine's choice. Stockfish can't actually play below ~1320 Elo (its
   * UCI_Elo floor), so without this every "weaker" persona feels identical;
   * this is what makes Gentle genuinely beatable and Sharp genuinely tough.
   */
  mistakeChance: number;
  lines: Record<ChatEvent, string[]>;
}

export const BOT_PERSONAS: BotPersona[] = [
  {
    id: "kofi",
    name: "Coach Kofi",
    avatar: "🧑🏾‍🏫",
    level: "Gentle",
    elo: 600,
    tagline: "Patient and encouraging — perfect for learning.",
    mistakeChance: 0.34,
    lines: {
      greeting: [
        "Hi, I'm Kofi! Let's enjoy a friendly game. 😊",
        "Take your time — we play to learn here.",
        "Welcome! Show me what you've got.",
      ],
      banter: ["Solid move.", "Okay, let's see where this goes.", "Good, keep developing your pieces."],
      userCapture: [
        "Nice capture — you spotted that well!",
        "Good eye, that piece was loose.",
        "See how you did that? That's the idea.",
      ],
      botCapture: [
        "I'll take that one — plenty of game left though.",
        "Oops, that was hanging. Guard your pieces!",
        "Gotcha — try to keep everything protected.",
      ],
      userCheck: ["Ooh, check! Bold.", "You've got me on the run — nice.", "Check! I'd better be careful."],
      botCheck: ["Check! Find a safe square for your king.", "Watch your king now — stay calm.", "Check — no panic, just careful defence."],
      win: ["Good effort! You'll get me next time. 👏", "I edged that one — fancy a rematch?", "Well played overall."],
      lose: ["You got me — beautifully done! 🎉", "Wonderful play, you earned that.", "I'm impressed. On to the Road to Master!"],
      draw: ["A fair draw — nicely held.", "Even game, well balanced.", "Honours shared. 🤝"],
    },
  },
  {
    id: "amina",
    name: "Amina",
    avatar: "😎",
    level: "Club",
    elo: 1200,
    tagline: "Quick, witty, and loves a good tactic.",
    mistakeChance: 0.13,
    lines: {
      greeting: ["Amina here. Let's make this sharp. 😏", "I like tactics — hope you do too.", "Board's set. Try to keep up."],
      banter: ["Bold.", "Predictable… or is it?", "Let's complicate things."],
      userCapture: ["Ha! Didn't see that coming.", "Okay okay, nice shot.", "Cheeky. I respect it."],
      botCapture: ["Mine now. 😎", "Snagged it!", "You left that hanging — rude not to take it."],
      userCheck: ["A check? Spicy.", "Alright, you've got my attention.", "Cute. I'll wriggle out."],
      botCheck: ["Check! Dance, king, dance.", "Feel the pressure?", "Tick tock — check."],
      win: ["Too easy 😜 — rematch?", "GG! Tactics win games.", "I did warn you I was sharp."],
      lose: ["Okay, that was slick. Respect. 🙌", "You outplayed me, fair and square.", "Ugh, brilliant. Again?"],
      draw: ["A draw?! I'll take it… this time.", "Tense one, nicely done.", "Split point — rematch to settle it?"],
    },
  },
  {
    id: "professor",
    name: "The Professor",
    avatar: "🦉",
    level: "Sharp",
    elo: 1800,
    tagline: "Calm, precise, and quietly intimidating.",
    mistakeChance: 0.04,
    lines: {
      greeting: ["I am the Professor. Let us begin. 🎩", "Precision wins games. Shall we?", "Concentrate. Then play."],
      banter: ["Reasonable.", "There were better squares.", "Hmm. Continue."],
      userCapture: ["Acceptable — you saw the tactic.", "Correct. That was the move.", "Noted. You are paying attention."],
      botCapture: ["A small inaccuracy, duly punished.", "That piece was undefended. Observe.", "Material is material."],
      userCheck: ["A check. I have calculated further.", "Predictable, but adequate.", "I see it. I am not concerned."],
      botCheck: ["Check. Calculate before you move.", "Your king is exposed — think.", "Check. Precision now, or it ends."],
      win: ["The position demanded it. Study and return.", "A lesson, not a defeat. Review it.", "Checkmate. Now you know."],
      lose: ["Excellent — you calculated well. 🎓", "I concede. That was instructive play.", "Impressive. You have earned this."],
      draw: ["A balanced struggle, well defended.", "Equality, correctly held.", "A draw. Respectable chess."],
    },
  },
];

export function getPersona(id: string): BotPersona {
  return BOT_PERSONAS.find((p) => p.id === id) ?? BOT_PERSONAS[1];
}

/** Pick the persona whose voice best fits an arbitrary engine Elo — lets the
 *  Elo-preset bot screen borrow a personality without changing its rating model. */
export function personaForElo(elo: number): BotPersona {
  if (elo <= 900) return BOT_PERSONAS[0]; // Kofi
  if (elo <= 1700) return BOT_PERSONAS[1]; // Amina
  return BOT_PERSONAS[2]; // The Professor
}

/** Pick a random in-character line for an event (varies by call index so the
 *  same event doesn't always repeat the same words). */
export function pickLine(persona: BotPersona, event: ChatEvent, seed: number): string {
  const bank = persona.lines[event];
  if (!bank || bank.length === 0) return "";
  return bank[Math.abs(seed) % bank.length];
}
