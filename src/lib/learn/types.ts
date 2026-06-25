/**
 * Data model for the Entry curriculum — deliberately small and declarative so
 * adding content later is just data, no code. A World is a list of Stages
 * ("villages" on the Candy-Crush map); each Stage holds ordered Lessons; each
 * Lesson is a short sequence of Steps the learner walks through on a board.
 */

/** What completes an interactive "do" step. */
export type Goal =
  /** Play exactly one of these UCI moves (e.g. "e7e8q", "e5d6"). */
  | { type: "move"; uci: string[] }
  /** Any pawn reaches the last rank (promotion). */
  | { type: "promote" }
  /** A piece lands on this square. */
  | { type: "reach"; square: string }
  /** Capture this many enemy pieces (default 1). */
  | { type: "capture"; count?: number };

export type StepBase = {
  /** Spoken narration; falls back to `text` when omitted. */
  say?: string;
  /**
   * If set, the board first shows this position, then animates to `board` —
   * replaying a move so the learner sees what just happened (e.g. the two-square
   * pawn dash that makes en passant possible).
   */
  animateFrom?: string;
};

export type SayStep = StepBase & {
  kind: "say";
  text: string;
  /** Optional static position to show alongside the narration. */
  board?: string;
  orientation?: "white" | "black";
  /** Squares to gently highlight while talking. */
  spotlight?: string[];
};

export type DoStep = StepBase & {
  kind: "do";
  text: string;
  board: string;
  orientation?: "white" | "black";
  goal: Goal;
  /** Shown if the learner plays a wrong/blocked move. */
  hint?: string;
  /** Squares to nudge toward (drawn as soft hints). */
  spotlight?: string[];
  /** Warn when the move leaves one of their pieces hanging. */
  hangingHints?: boolean;
};

export type LessonStep = SayStep | DoStep;

export type Lesson = {
  /** Globally unique, kebab-case (e.g. "pawn-march"). */
  id: string;
  title: string;
  blurb: string;
  icon: string;
  steps: LessonStep[];
  /** One simple takeaway shown on completion. */
  tip?: string;
};

export type Stage = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  /** Accent colour for this village on the map. */
  accent: string;
  lessons: Lesson[];
};

export type World = Stage[];

/** Flatten a world to its lessons in unlock order. */
export function flattenLessons(world: World): { lesson: Lesson; stage: Stage }[] {
  return world.flatMap((stage) => stage.lessons.map((lesson) => ({ lesson, stage })));
}
