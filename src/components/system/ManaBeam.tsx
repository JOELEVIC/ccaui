"use client";

import { motion } from "framer-motion";

/**
 * "Path Igniting" beam — a travelling pulse of light that runs along the
 * dungeon spine from the just-cleared node to the next gate. Renders as a
 * vertical or horizontal beam depending on `axis`.
 *
 * The effect is implemented with three stacked layers:
 *   • core    — a 2px filament (cyan)
 *   • glow    — soft 12px halo
 *   • runner  — a 32px highlight that travels along the path on a loop
 */

interface ManaBeamProps {
  /** Total length in CSS pixels (or any CSS length string). */
  length: number | string;
  /** Orientation. */
  axis?: "vertical" | "horizontal";
  /** Stroke thickness of the filament (px). Default 2. */
  thickness?: number;
  /** Core colour — defaults to System Cyan. */
  color?: string;
  /** Duration of one full traverse, in seconds. Default 1.8. */
  duration?: number;
  /** When true, beam runs once then disappears (e.g. on level-clear). */
  oneShot?: boolean;
}

export function ManaBeam({
  length,
  axis = "vertical",
  thickness = 2,
  color = "var(--sys-cyan)",
  duration = 1.8,
  oneShot = false,
}: ManaBeamProps) {
  const vertical = axis === "vertical";
  const wrapStyle: React.CSSProperties = vertical
    ? { position: "relative", width: thickness, height: length, pointerEvents: "none" }
    : { position: "relative", width: length, height: thickness, pointerEvents: "none" };

  // Core filament
  const filament: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(${vertical ? "180deg" : "90deg"},
      transparent 0%,
      ${color} 15%,
      ${color} 85%,
      transparent 100%
    )`,
    opacity: 0.85,
    filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 10px ${color}66)`,
  };

  // Runner — a bright pulse that travels along the beam
  const runnerSize = 36;
  const runnerStyle: React.CSSProperties = vertical
    ? {
        position: "absolute",
        left: -((runnerSize - thickness) / 2),
        width: runnerSize,
        height: runnerSize,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        mixBlendMode: "screen",
      }
    : {
        position: "absolute",
        top: -((runnerSize - thickness) / 2),
        width: runnerSize,
        height: runnerSize,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        mixBlendMode: "screen",
      };

  const fromOffset: { top?: number | string; left?: number | string } = vertical
    ? { top: -runnerSize }
    : { left: -runnerSize };
  const toOffset: { top?: number | string; left?: number | string } = vertical
    ? { top: "100%" }
    : { left: "100%" };

  return (
    <div style={wrapStyle}>
      <div style={filament} />
      <motion.div
        style={runnerStyle}
        initial={fromOffset}
        animate={toOffset}
        transition={{
          duration,
          ease: "linear",
          repeat: oneShot ? 0 : Infinity,
          repeatDelay: oneShot ? 0 : 0.4,
        }}
      />
    </div>
  );
}

/**
 * Burst — an outward shockwave used when the beam strikes a node to "shatter
 * the lock". Three expanding rings + 8 radial shards.
 */
export function ManaBurst({
  size = 80,
  color = "var(--sys-cyan)",
  duration = 0.8,
  onDone,
}: {
  size?: number;
  color?: string;
  duration?: number;
  onDone?: () => void;
}) {
  const shards = Array.from({ length: 8 }, (_, i) => (i * Math.PI * 2) / 8);
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        left: 0,
        top: 0,
        pointerEvents: "none",
      }}
    >
      {[0, 0.12, 0.24].map((delay, i) => (
        <motion.div
          key={`ring-${i}`}
          initial={{ scale: 0.4, opacity: 0.9 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={i === 2 ? onDone : undefined}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1px solid ${color}`,
            boxShadow: `0 0 12px ${color}, inset 0 0 12px ${color}`,
          }}
        />
      ))}
      {shards.map((a, i) => (
        <motion.div
          key={`shard-${i}`}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.cos(a) * size * 0.9,
            y: Math.sin(a) * size * 0.9,
            opacity: 0,
          }}
          transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            left: size / 2 - 1,
            top: size / 2 - 6,
            width: 2,
            height: 12,
            background: color,
            boxShadow: `0 0 6px ${color}`,
            transformOrigin: "center",
            transform: `rotate(${(a * 180) / Math.PI + 90}deg)`,
          }}
        />
      ))}
    </div>
  );
}
