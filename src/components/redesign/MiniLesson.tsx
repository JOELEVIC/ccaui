"use client";

import { useState } from "react";
import { Card, GoldButton, Eyebrow } from "./Primitives";

const STEPS = [
  { title: "Why the center matters", body: "The four central squares control mobility for every piece." },
  { title: "Pawns first", body: "1.e4 or 1.d4 stake an immediate claim on the center." },
  { title: "Knights before bishops", body: "Develop toward the center: Nf3, Nc3." },
  { title: "Castle early", body: "Connect rooks and tuck the king to safety.", locked: true },
];

export function MiniLesson() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const atLock = !!step.locked;

  return (
    <Card className="p-5 sm:p-6">
      <Eyebrow>Free Mini-Lesson</Eyebrow>
      <h3 className="font-display text-2xl text-ink">Controlling the Center</h3>

      <div className="mt-4 flex gap-1.5" aria-hidden>
        {STEPS.map((_, n) => (
          <span
            key={n}
            className={`h-1.5 flex-1 rounded-full transition ${n <= i ? "bg-gold" : "bg-line"}`}
          />
        ))}
      </div>

      <div className="relative mt-4 min-h-[160px] rounded-lg border border-line bg-gold-10/40 p-5">
        <p className="text-xs font-semibold text-ink-60">
          Step {i + 1} of {STEPS.length}
        </p>
        <p className="mt-1 font-display text-xl text-ink">{step.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-60">{step.body}</p>

        {atLock && (
          <div className="absolute inset-0 grid place-items-center rounded-lg bg-surface/80 backdrop-blur-sm">
            <div className="text-center">
              <span className="text-2xl">🔒</span>
              <p className="mt-1 font-medium text-ink">Finish this lesson free</p>
              <GoldButton className="mt-3 px-5 text-sm">
                Unlock with a free account
              </GoldButton>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          disabled={i === 0}
          onClick={() => setI(i - 1)}
          className="min-h-[44px] px-3 text-sm text-ink-60 disabled:opacity-40"
        >
          ← Back
        </button>
        {!atLock ? (
          <GoldButton className="px-5 text-sm" onClick={() => setI(i + 1)}>
            Next step →
          </GoldButton>
        ) : (
          <span className="text-sm text-ink-60">1 step left</span>
        )}
      </div>
    </Card>
  );
}
