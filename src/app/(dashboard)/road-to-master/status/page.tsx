"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Card, Eyebrow, GoldButton } from "@/components/redesign/Primitives";

const SKILLS = [
  { name: "Tactics", value: 60 },
  { name: "Speed", value: 65 },
  { name: "Opening theory", value: 68 },
  { name: "Defense", value: 68 },
  { name: "Prophylaxis", value: 66 },
  { name: "Endgames", value: 62 },
];

export default function ProgressPage() {
  const { user } = useAuth();
  const name = user?.username ?? "there";
  const weakest = [...SKILLS].sort((a, b) => a.value - b.value)[0];

  return (
    <main className="min-h-screen bg-canvas font-sans text-ink">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow>Your progress</Eyebrow>
          <Link href="/road-to-master" className="text-sm text-ink-60 hover:text-ink">
            ← Back to training
          </Link>
        </div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{name}&apos;s skills</h1>
        <p className="mt-2 text-ink-60">
          Playing style: <span className="font-medium text-ink">The Architect</span> — patient,
          plan-driven chess.
        </p>

        <Card className="mt-8 p-5 sm:p-6">
          <Eyebrow>Skill breakdown</Eyebrow>
          <div className="mt-2 space-y-4">
            {SKILLS.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{s.name}</span>
                  <span className="tabular-nums text-ink-60">{s.value}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full rounded-full ${s.name === weakest.name ? "bg-down" : "bg-gold"}`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-5 p-5 sm:p-6">
          <Eyebrow>Focus area</Eyebrow>
          <h2 className="font-display text-2xl text-ink">Work on {weakest.name.toLowerCase()}</h2>
          <p className="mt-1 text-sm text-ink-60">
            This is your lowest area right now. A few focused sessions will move it the fastest.
          </p>
          <Link href="/learning">
            <GoldButton className="mt-4 text-sm">
              Start a {weakest.name.toLowerCase()} session
            </GoldButton>
          </Link>
        </Card>

        <Card className="mt-5 p-5 sm:p-6">
          <Eyebrow>Import your games</Eyebrow>
          <p className="text-sm text-ink-60">
            Connect your Chess.com username to recalculate these skills from your last 50 games. We
            never store your password.
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
