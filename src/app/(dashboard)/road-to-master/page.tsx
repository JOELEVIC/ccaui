"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Card, Eyebrow, GoldButton } from "@/components/redesign/Primitives";

const SECTIONS = [
  {
    href: "/road-to-master/gate",
    title: "Lessons",
    desc: "A structured path through tactics, strategy, and endgames — one step at a time.",
    progress: "Step 2 of 30",
  },
  {
    href: "/road-to-master/status",
    title: "Your progress",
    desc: "See your strongest and weakest areas and what to focus on next.",
  },
  {
    href: "/road-to-master/shadow",
    title: "Game review",
    desc: "Find the best move from famous master games and your own.",
  },
  {
    href: "/road-to-master/memory",
    title: "Visualization",
    desc: "Train board memory and calculation with timed recall drills.",
  },
  {
    href: "/road-to-master/guild",
    title: "Leaderboard",
    desc: "See how players across regions are progressing.",
  },
  {
    href: "/play/bot",
    title: "Practice vs computer",
    desc: "Play training games tuned to your level.",
  },
  {
    href: "/learning",
    title: "Tactics trainer",
    desc: "Solve puzzles matched to your rating.",
  },
  {
    href: "/road-to-master/pass",
    title: "Membership",
    desc: "Unlock unlimited game reviews and the full lesson library.",
  },
];

export default function TrainingPage() {
  const { user } = useAuth();
  const name = user?.username ?? "there";
  const lessonsDone = 1;
  const lessonsTotal = 30;
  const pct = Math.round((lessonsDone / lessonsTotal) * 100);

  return (
    <main className="min-h-screen bg-canvas font-sans text-ink">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <Eyebrow>Training</Eyebrow>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          Keep improving, {name}.
        </h1>
        <p className="mt-2 max-w-lg text-ink-60">
          A simple, structured way to get better — lessons, practice, and review.
        </p>

        {/* Today's task + overall progress */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card className="p-5 sm:p-6 lg:col-span-2">
            <Eyebrow>Today&apos;s task</Eyebrow>
            <h2 className="font-display text-2xl text-ink">Solve 10 tactics puzzles in a row</h2>
            <p className="mt-1 text-sm text-ink-60">
              A quick daily session keeps your pattern recognition sharp.
            </p>
            <Link href="/learning">
              <GoldButton className="mt-4 text-sm">Start session</GoldButton>
            </Link>
          </Card>

          <Card className="p-5 sm:p-6">
            <Eyebrow>Lesson progress</Eyebrow>
            <p className="font-display text-3xl text-ink">{pct}%</p>
            <p className="mt-1 text-sm text-ink-60">
              {lessonsDone} of {lessonsTotal} lessons complete
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
            </div>
            <Link
              href="/road-to-master/gate"
              className="mt-4 inline-block text-sm font-medium text-gold underline-offset-4 hover:underline"
            >
              Continue lessons →
            </Link>
          </Card>
        </div>

        {/* Sections */}
        <h2 className="mt-10 font-display text-xl text-ink">Everything in your training</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="group">
              <Card className="flex h-full flex-col p-5 transition hover:shadow-gold">
                <h3 className="font-display text-lg text-ink">{s.title}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-60">{s.desc}</p>
                {s.progress && (
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-60">
                    {s.progress}
                  </p>
                )}
                <span className="mt-3 text-sm font-medium text-gold">Open →</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
