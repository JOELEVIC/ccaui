"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { ATTR_META, ATTR_ORDER, type Attributes } from "@/lib/r2m-attributes";

/**
 * Hexagonal radar (6 attributes) — pure SVG. The chart breathes:
 *   • Hex rings at 25/50/75/100 mark the threshold tiers.
 *   • The player polygon is filled with a radial gradient + neon stroke.
 *   • Each vertex pulses when its value crosses 70.
 *
 * Sized via the `size` prop (defaults to 320px). The component is
 * resolution-independent — render at any size on any background.
 */

interface HexRadarProps {
  attributes: Attributes;
  /** Width and height in pixels. */
  size?: number;
  /** Accent colour for the polygon stroke / fill (CSS colour or var). */
  accent?: string;
  /** When false, vertices are unlabelled (use for compact previews). */
  showLabels?: boolean;
  /** Animate the polygon in from zero. */
  animate?: boolean;
}

const RINGS = [25, 50, 75, 100];

export function HexRadar({
  attributes,
  size = 320,
  accent = "var(--sys-cyan)",
  showLabels = true,
  animate = true,
}: HexRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  // Leave room for axis labels around the hexagon.
  const radius = (size / 2) * (showLabels ? 0.72 : 0.86);
  const gradId = useId();
  const glowId = useId();

  // 6 axes, evenly spaced. Angle 0 = top (north).
  const axes = useMemo(() => {
    return ATTR_ORDER.map((key, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 6;
      return {
        key,
        angle,
        ux: Math.cos(angle),
        uy: Math.sin(angle),
      };
    });
  }, []);

  function ringPoints(scale: number): string {
    return axes
      .map((a) => {
        const x = cx + a.ux * radius * scale;
        const y = cy + a.uy * radius * scale;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  const playerPoints = axes
    .map((a) => {
      const v = attributes[a.key] / 100;
      const x = cx + a.ux * radius * v;
      const y = cy + a.uy * radius * v;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  // For Framer Motion path animation we use a polygon with animated `points`.
  const zeroPoints = axes.map(() => `${cx},${cy}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Hunter attribute radar">
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Threshold rings */}
      {RINGS.map((r) => (
        <polygon
          key={r}
          points={ringPoints(r / 100)}
          fill="none"
          stroke="rgba(0,240,255,0.16)"
          strokeWidth={r === 100 ? 1.2 : 0.6}
          strokeDasharray={r === 100 ? "0" : "3 4"}
        />
      ))}

      {/* Axis lines */}
      {axes.map((a, i) => {
        const ex = cx + a.ux * radius;
        const ey = cy + a.uy * radius;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={ex}
            y2={ey}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.8}
          />
        );
      })}

      {/* Player polygon — animated in */}
      <motion.polygon
        initial={animate ? { points: zeroPoints, opacity: 0 } : false}
        animate={{ points: playerPoints, opacity: 1 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        fill={`url(#${gradId})`}
        stroke={accent}
        strokeWidth={1.5}
        filter={`url(#${glowId})`}
      />

      {/* Vertices */}
      {axes.map((a, i) => {
        const v = attributes[a.key] / 100;
        const x = cx + a.ux * radius * v;
        const y = cy + a.uy * radius * v;
        const elite = attributes[a.key] >= 70;
        return (
          <g key={`v-${i}`}>
            <circle
              cx={x}
              cy={y}
              r={elite ? 4 : 2.6}
              fill={accent}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={0.8}
              filter={elite ? `url(#${glowId})` : undefined}
            />
            {elite && (
              <circle cx={x} cy={y} r={9} fill="none" stroke={accent} strokeWidth={0.8} opacity={0.45}>
                <animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.05;0.5" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}

      {/* Axis labels */}
      {showLabels &&
        axes.map((a, i) => {
          const lx = cx + a.ux * radius * 1.18;
          const ly = cy + a.uy * radius * 1.18;
          const meta = ATTR_META[a.key];
          const value = attributes[a.key];
          // Anchor smartly so labels don't overflow on the sides.
          const anchor = Math.abs(a.ux) < 0.1 ? "middle" : a.ux > 0 ? "start" : "end";
          return (
            <g key={`l-${i}`}>
              <text
                x={lx}
                y={ly - 6}
                textAnchor={anchor}
                fontFamily="var(--font-oswald), system-ui, sans-serif"
                fontSize={11}
                fontWeight={700}
                letterSpacing={1.5}
                fill="rgba(240,242,248,0.85)"
                style={{ textTransform: "uppercase" }}
              >
                {meta.label}
              </text>
              <text
                x={lx}
                y={ly + 8}
                textAnchor={anchor}
                fontFamily="var(--font-oswald), system-ui, sans-serif"
                fontSize={13}
                fontWeight={800}
                fill={accent}
                style={{ filter: value >= 70 ? `drop-shadow(0 0 4px ${accent})` : undefined }}
              >
                {value}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
