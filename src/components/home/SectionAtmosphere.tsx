"use client";

import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

type Drift = {
  glyph: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: string;
  duration: number;
  delay?: number;
  /** Horizontal drift amplitude in px. */
  amp?: number;
};

const PRESETS: Record<"left" | "right" | "split" | "scatter", Drift[]> = {
  left: [
    { glyph: "♞", top: "10%", left: "-4%", size: "180px", duration: 22, amp: 14 },
    { glyph: "♟", bottom: "12%", left: "12%", size: "90px", duration: 28, delay: 4, amp: 10 },
  ],
  right: [
    { glyph: "♛", top: "8%", right: "-2%", size: "220px", duration: 24, amp: 16 },
    { glyph: "♝", bottom: "8%", right: "18%", size: "110px", duration: 30, delay: 3, amp: 12 },
  ],
  split: [
    { glyph: "♜", top: "12%", left: "-2%", size: "160px", duration: 26, amp: 12 },
    { glyph: "♚", bottom: "10%", right: "-3%", size: "200px", duration: 24, delay: 2, amp: 14 },
  ],
  scatter: [
    { glyph: "♞", top: "8%", left: "8%", size: "120px", duration: 22, amp: 10 },
    { glyph: "♛", top: "20%", right: "10%", size: "140px", duration: 26, delay: 2, amp: 12 },
    { glyph: "♟", bottom: "12%", left: "30%", size: "80px", duration: 30, delay: 4, amp: 8 },
  ],
};

interface Props {
  variant?: keyof typeof PRESETS;
  /** Lower for very faint, higher for more visible. Default 0.04 reads as ambient. */
  opacity?: number;
}

/**
 * Slow-drifting chess silhouettes used as a section backdrop. Replaces the
 * sense that each section is a stacked solid-coloured box with something
 * alive but quiet. Respects prefers-reduced-motion via globals.css.
 */
export function SectionAtmosphere({ variant = "scatter", opacity = 0.04 }: Props) {
  const drifts = PRESETS[variant];
  return (
    <Box position="absolute" inset={0} overflow="hidden" pointerEvents="none" zIndex={0}>
      {drifts.map((d, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, x: 0 }}
          animate={{ y: [0, -12, 0, 10, 0], x: [0, d.amp ?? 10, 0, -(d.amp ?? 10), 0] }}
          transition={{
            duration: d.duration,
            delay: d.delay ?? 0,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: d.top,
            bottom: d.bottom,
            left: d.left,
            right: d.right,
            fontSize: d.size,
            lineHeight: 1,
            color: "var(--chakra-colors-gold)",
            opacity,
            fontFamily: "serif",
            filter: "drop-shadow(0 0 12px rgba(230,164,82,0.18))",
            userSelect: "none",
          }}
        >
          {d.glyph}
        </motion.div>
      ))}
    </Box>
  );
}
