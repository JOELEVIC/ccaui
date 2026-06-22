"use client";

import Link from "next/link";
import { Card, Eyebrow, GoldButton } from "@/components/redesign/Primitives";

const LEVELS = [
  { name: "Beginner", detail: "8 pieces · 8 seconds to study" },
  { name: "Intermediate", detail: "16 pieces · 6 seconds" },
  { name: "Advanced", detail: "Full position · 5 seconds" },
];

export default function VisualizationPage() {
  return (
    <main className="min-h-screen bg-canvas font-sans text-ink">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow>Visualization</Eyebrow>
          <Link href="/road-to-master" className="text-sm text-ink-60 hover:text-ink">
            ← Back to training
          </Link>
        </div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Visualization trainer</h1>
        <p className="mt-2 max-w-lg text-ink-60">
          Study a position, watch it disappear, then rebuild it from memory. Strong visualization is
          the foundation of accurate calculation.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <Card key={l.name} className="flex flex-col p-5 transition hover:shadow-gold">
              <h2 className="font-display text-lg text-ink">{l.name}</h2>
              <p className="mt-1 flex-1 text-sm text-ink-60">{l.detail}</p>
              <GoldButton className="mt-4 w-full text-sm">Start</GoldButton>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-sm text-ink-60">
          Aim for 70% accuracy to move up a level.
        </p>
      </div>
    </main>
  );
}
