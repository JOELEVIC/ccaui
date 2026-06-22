"use client";

import { useState } from "react";
import { Card, GoldButton, GhostButton, Eyebrow } from "./Primitives";

const PIECES: Record<string, string> = {
  "06": "♚", "15": "♟", "16": "♟", "17": "♟", "24": "♕", "70": "♖", "76": "♔",
};

/**
 * Daily puzzle card. Wire `onAttempt` into your react-chessboard onPieceDrop
 * validation; the signup hook fires only AFTER the guest engages.
 */
export function DailyPuzzleCard() {
  const [status, setStatus] = useState<"idle" | "solved" | "failed">("idle");
  const [showHook, setShowHook] = useState(false);

  const onAttempt = (correct: boolean) => {
    setStatus(correct ? "solved" : "failed");
    setShowHook(true);
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <Eyebrow>Puzzle of the Day</Eyebrow>
        <span className="rounded-full bg-gold-10 px-3 py-1 text-xs font-semibold text-[#8a6d2f]">
          Mate in 2 · ★★☆
        </span>
      </div>

      <h3 className="font-display text-2xl text-ink">White to move</h3>
      <p className="mt-1 text-sm text-ink-60">No account needed — give it a try.</p>

      {/* Placeholder board — swap for <Chessboard onPieceDrop={(s,t)=>onAttempt(validate(s,t))} /> */}
      <div className="mx-auto mt-4 grid aspect-square w-full max-w-[360px] grid-cols-8 grid-rows-8 overflow-hidden rounded-lg border border-line">
        {Array.from({ length: 64 }).map((_, n) => {
          const r = Math.floor(n / 8);
          const c = n % 8;
          const light = (r + c) % 2 === 0;
          return (
            <div
              key={n}
              className="grid place-items-center text-xl text-ink"
              style={{ background: light ? "#FDFBF7" : "#E8DEC6" }}
            >
              {PIECES[`${r}${c}`] ?? ""}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <GhostButton className="text-sm" onClick={() => onAttempt(false)}>
          Get a hint
        </GhostButton>
        <button
          className="text-sm text-ink-60 underline-offset-4 hover:underline"
          onClick={() => onAttempt(true)}
        >
          Show solution
        </button>
      </div>

      {showHook && (
        <div
          role="dialog"
          aria-modal="true"
          className="mt-5 rounded-xl2 border border-gold/30 bg-gold-10 p-5 text-center"
        >
          <p className="font-display text-xl text-ink">
            {status === "solved" ? "Nicely solved! ♟️" : "So close!"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-60">
            Create a free account to save your streak, unlock 5,000+ puzzles, and
            track your rating.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <GoldButton className="text-sm">Create free account</GoldButton>
            <GhostButton className="text-sm" onClick={() => setShowHook(false)}>
              Keep playing
            </GhostButton>
          </div>
        </div>
      )}
    </Card>
  );
}
