"use client";

import Link from "next/link";
import { Card, Eyebrow } from "@/components/redesign/Primitives";

type Status = "done" | "current" | "locked";

const LESSONS: { n: number; title: string; kind: string; status: Status }[] = [
  { n: 1, title: "Pins & skewers", kind: "Tactics", status: "done" },
  { n: 2, title: "Forks", kind: "Tactics", status: "current" },
  { n: 3, title: "Pawn structure basics", kind: "Strategy", status: "locked" },
  { n: 4, title: "King & pawn opposition", kind: "Endgame", status: "locked" },
  { n: 5, title: "Discovered attacks", kind: "Tactics", status: "locked" },
  { n: 6, title: "Open files & rooks", kind: "Strategy", status: "locked" },
  { n: 7, title: "Back-rank mates", kind: "Tactics", status: "locked" },
  { n: 8, title: "Rook endgames", kind: "Endgame", status: "locked" },
];

const BADGE: Record<Status, { label: string; cls: string }> = {
  done: { label: "Completed", cls: "bg-up/10 text-up" },
  current: { label: "In progress", cls: "bg-gold-10 text-[#8a6d2f]" },
  locked: { label: "Locked", cls: "bg-ink/5 text-ink-60" },
};

export default function LessonsPage() {
  const done = LESSONS.filter((l) => l.status === "done").length;
  const pct = Math.round((done / LESSONS.length) * 100);

  return (
    <main className="min-h-screen bg-canvas font-sans text-ink">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow>Lessons</Eyebrow>
          <Link href="/road-to-master" className="text-sm text-ink-60 hover:text-ink">
            ← Back to training
          </Link>
        </div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Your lesson path</h1>
        <p className="mt-2 text-ink-60">
          Complete each lesson to unlock the next. {done} of {LESSONS.length} done ({pct}%).
        </p>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
        </div>

        <ul className="mt-6 space-y-3">
          {LESSONS.map((l) => {
            const b = BADGE[l.status];
            const interactive = l.status !== "locked";
            const inner = (
              <Card
                className={`flex items-center gap-4 p-4 ${
                  interactive ? "transition hover:shadow-gold" : "opacity-70"
                }`}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-10 font-display text-ink">
                  {l.n}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{l.title}</p>
                  <p className="text-xs uppercase tracking-wide text-ink-60">{l.kind}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${b.cls}`}>
                  {b.label}
                </span>
              </Card>
            );
            return (
              <li key={l.n}>
                {interactive ? (
                  <Link href="/learning" className="block">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
