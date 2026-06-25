"use client";

import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { winPercent } from "@/lib/gameAnalysisReview";

interface EvalGraphProps {
  /** Per-position evals (white-POV centipawns; mate already clamped). */
  series: { ply: number; cp: number }[];
  /** The ply currently shown on the board (highlighted). */
  currentPly?: number | null;
  /** Click a column to jump the board to that ply. */
  onJump?: (ply: number) => void;
  height?: number;
}

/**
 * chess.com-style evaluation graph: a diverging area around an "even" midline —
 * white advantage rises as a light hump above the line, black advantage drops as
 * a dark hump below it. The colours never swap; height shows who's winning.
 */
export function EvalGraph({ series, currentPly, onJump, height = 96 }: EvalGraphProps) {
  if (!series || series.length < 2) return null;
  // Advantage in win-% terms, centered on 0 (even). Bounded, so big swings read clearly.
  const data = series.map((e) => ({ ply: e.ply, adv: winPercent(e.cp, null) - 50 }));

  return (
    <div style={{ width: "100%", height, background: "#262430", borderRadius: 8, overflow: "hidden" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          onClick={(s: { activeLabel?: string | number }) => {
            if (onJump && s && s.activeLabel != null) onJump(Number(s.activeLabel));
          }}
          style={{ cursor: onJump ? "pointer" : "default" }}
        >
          <defs>
            <linearGradient id="evalDiverge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ededed" />
              <stop offset="49.9%" stopColor="#ededed" />
              <stop offset="50%" stopColor="#4a4754" />
              <stop offset="100%" stopColor="#4a4754" />
            </linearGradient>
          </defs>
          <XAxis dataKey="ply" hide />
          <YAxis domain={[-50, 50]} hide />
          <ReferenceLine y={0} stroke="#ffffff44" strokeWidth={1} />
          {currentPly != null && (
            <ReferenceLine x={currentPly} stroke="#d4af37" strokeWidth={1.5} />
          )}
          <Area
            type="monotone"
            dataKey="adv"
            baseValue={0}
            stroke="#cfcfd6"
            strokeWidth={1}
            fill="url(#evalDiverge)"
            fillOpacity={1}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
