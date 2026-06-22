"use client";

import Link from "next/link";
import { Card, Eyebrow } from "@/components/redesign/Primitives";

const REGIONS = [
  { code: "DLA", name: "Douala · Littoral", players: 412, points: 184320 },
  { code: "YDE", name: "Yaoundé · Centre", players: 388, points: 162900 },
  { code: "BFS", name: "Bafoussam · West", players: 221, points: 98480 },
  { code: "BAM", name: "Bamenda · North-West", players: 198, points: 87220 },
  { code: "BUE", name: "Buea · South-West", players: 162, points: 74100 },
  { code: "GAR", name: "Garoua · North", players: 142, points: 61500 },
  { code: "EBO", name: "Ebolowa · South", players: 119, points: 48820 },
  { code: "BER", name: "Bertoua · East", players: 98, points: 41040 },
];

export default function LeaderboardPage() {
  const max = REGIONS[0].points;
  return (
    <main className="min-h-screen bg-canvas font-sans text-ink">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow>Leaderboard</Eyebrow>
          <Link href="/road-to-master" className="text-sm text-ink-60 hover:text-ink">
            ← Back to training
          </Link>
        </div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Regional standings</h1>
        <p className="mt-2 text-ink-60">
          Practice points earned by players in each region. Updated daily.
        </p>

        <Card className="mt-8 overflow-hidden">
          <ul>
            {REGIONS.map((r, i) => (
              <li
                key={r.code}
                className="flex items-center gap-4 border-t border-line px-5 py-4 first:border-t-0"
              >
                <span className="w-5 text-center font-display text-ink-60">{i + 1}</span>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-10 text-xs font-semibold text-ink">
                  {r.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{r.name}</p>
                  <p className="text-xs text-ink-60">{r.players.toLocaleString()} players</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${Math.round((r.points / max) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-right text-sm font-medium tabular-nums text-ink">
                  {r.points.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}
