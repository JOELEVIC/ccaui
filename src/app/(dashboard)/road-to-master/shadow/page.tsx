"use client";

import Link from "next/link";
import { Card, Eyebrow, GoldButton } from "@/components/redesign/Primitives";

const CHALLENGES = [
  {
    label: "The Game of the Century — Byrne vs Fischer",
    note: "Fischer, age 13, offered his queen for an immortal combination. Find the move.",
  },
  {
    label: "Philidor's Legacy — Smothered Mate",
    note: "Knight on h6, king in the corner. End it in one.",
  },
  {
    label: "Greek Gift — Classical Sacrifice",
    note: "The king has just castled. Open the attack on h7.",
  },
];

export default function GameReviewPage() {
  return (
    <main className="min-h-screen bg-canvas font-sans text-ink">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow>Game review</Eyebrow>
          <Link href="/road-to-master" className="text-sm text-ink-60 hover:text-ink">
            ← Back to training
          </Link>
        </div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Find the best move</h1>
        <p className="mt-2 max-w-lg text-ink-60">
          Step into famous positions from master games and your own, and try to find the strongest
          move before you see the answer.
        </p>

        <div className="mt-8 space-y-3">
          {CHALLENGES.map((c) => (
            <Card key={c.label} className="flex items-center gap-4 p-5 transition hover:shadow-gold">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{c.label}</p>
                <p className="mt-0.5 text-sm text-ink-60">{c.note}</p>
              </div>
              <Link href="/learning">
                <GoldButton className="text-sm">Start</GoldButton>
              </Link>
            </Card>
          ))}
        </div>

        <Card className="mt-6 p-5 sm:p-6">
          <Eyebrow>Review your own games</Eyebrow>
          <p className="text-sm text-ink-60">
            Import your recent games to find the moments where a stronger move was available.
          </p>
          <Link
            href="/analysis/import"
            className="mt-3 inline-block text-sm font-medium text-gold underline-offset-4 hover:underline"
          >
            Import games →
          </Link>
        </Card>
      </div>
    </main>
  );
}
