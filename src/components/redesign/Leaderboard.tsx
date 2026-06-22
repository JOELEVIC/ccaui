"use client";

import { useState } from "react";
import { Card, Eyebrow } from "./Primitives";

const TABS = ["National ELO", "Academy Points", "Puzzle Kings"] as const;
type Tab = (typeof TABS)[number];

type Row = { name: string; meta: string; score: number; trend: number };

const DATA: Record<Tab, Row[]> = {
  "National ELO": [
    { name: "A. Nkeng", meta: "Douala", score: 2148, trend: 2 },
    { name: "M. Fotso", meta: "Yaoundé", score: 2090, trend: 0 },
    { name: "C. Eyong", meta: "Buea", score: 2061, trend: -1 },
    { name: "S. Mballa", meta: "Online", score: 1994, trend: 3 },
    { name: "T. Abena", meta: "Bamenda", score: 1970, trend: -2 },
  ],
  "Academy Points": [
    { name: "S. Mballa", meta: "Online", score: 980, trend: 4 },
    { name: "A. Nkeng", meta: "Douala", score: 955, trend: 1 },
    { name: "L. Tabi", meta: "Limbe", score: 902, trend: 2 },
    { name: "M. Fotso", meta: "Yaoundé", score: 880, trend: -1 },
    { name: "C. Eyong", meta: "Buea", score: 861, trend: 0 },
  ],
  "Puzzle Kings": [
    { name: "L. Tabi", meta: "Limbe", score: 1240, trend: 5 },
    { name: "C. Eyong", meta: "Buea", score: 1188, trend: 2 },
    { name: "A. Nkeng", meta: "Douala", score: 1150, trend: -1 },
    { name: "T. Abena", meta: "Bamenda", score: 1090, trend: 1 },
    { name: "M. Fotso", meta: "Yaoundé", score: 1044, trend: -2 },
  ],
};

function Trend({ t }: { t: number }) {
  if (t === 0) return <span className="text-ink-30">—</span>;
  const up = t > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-up" : "text-down"}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" className={up ? "" : "rotate-180"}>
        <path d="M5 1l4 6H1z" fill="currentColor" />
      </svg>
      {Math.abs(t)}
    </span>
  );
}

function Podium({ rows }: { rows: Row[] }) {
  const order = [rows[1], rows[0], rows[2]]; // 2 · 1 · 3
  const bar = ["h-16", "h-24", "h-12"];
  const ring = ["ring-ink/10", "ring-gold", "ring-ink/10"];
  return (
    <div className="grid grid-cols-3 items-end gap-3">
      {order.map((r, idx) => {
        const top = idx === 1;
        const rank = top ? 1 : idx === 0 ? 2 : 3;
        return (
          <div key={r.name} className="flex flex-col items-center text-center">
            <div
              className={`grid place-items-center rounded-full ${top ? "size-14" : "size-11"} bg-gold-10 font-display text-ink ring-2 ${ring[idx]}`}
            >
              {r.name[0]}
            </div>
            <p className="mt-2 truncate text-sm font-medium text-ink">{r.name}</p>
            <p className="text-xs text-ink-60">{r.score.toLocaleString()}</p>
            <div
              className={`mt-2 flex w-full justify-center rounded-t-lg pt-1.5 ${bar[idx]} ${top ? "bg-gold shadow-gold" : "bg-line"}`}
            >
              <span className={`font-display text-lg ${top ? "text-white" : "text-ink-60"}`}>
                {top ? "🏆" : rank}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Leaderboard() {
  const [tab, setTab] = useState<Tab>("National ELO");
  const rows = DATA[tab];

  return (
    <Card className="p-5 sm:p-6">
      <Eyebrow>Leaderboard</Eyebrow>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-full bg-gold-10 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`min-h-[36px] whitespace-nowrap rounded-full px-4 text-sm font-medium transition ${
              tab === t ? "bg-surface text-ink shadow-card" : "text-ink hover:bg-surface/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Podium rows={rows} />

      <ul className="mt-6">
        {rows.map((r, n) => (
          <li key={r.name} className="flex items-center gap-3 border-t border-line py-3">
            <span className="w-6 text-center font-display text-ink-60">{n + 1}</span>
            <div className="grid size-9 place-items-center rounded-full bg-gold-10 text-sm font-medium text-ink">
              {r.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{r.name}</p>
              <p className="text-xs text-ink-60">{r.meta}</p>
            </div>
            <span className="font-medium tabular-nums text-ink">{r.score.toLocaleString()}</span>
            <span className="w-8 text-right">
              <Trend t={r.trend} />
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
