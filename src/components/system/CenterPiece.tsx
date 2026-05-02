"use client";

import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { R2MTier } from "@/lib/r2m";

const PIECE_SVG: Record<string, string> = {
  E: "♟", D: "♞", C: "♝", B: "♜", A: "♛", S: "♚", SS: "♚",
};

interface CenterPieceProps {
  tier: R2MTier;
}

/**
 * The central, slowly-floating chess piece that represents the player's rank.
 * — Two stacked rotating glow rings
 * — Floating piece with idle animation
 * — Drop-shadow that picks up the tier colour
 */
export function CenterPiece({ tier }: CenterPieceProps) {
  const c = tier.color;
  return (
    <Box
      position="relative"
      w={{ base: "260px", md: "360px" }}
      h={{ base: "260px", md: "360px" }}
      pointerEvents="none"
    >
      {/* outer rotating ring */}
      <Box
        position="absolute"
        inset="0"
        borderRadius="full"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor={c}
        opacity={0.35}
        style={{ animation: "system-spin-slow 32s linear infinite" }}
      />
      {/* inner ring */}
      <Box
        position="absolute"
        inset="14%"
        borderRadius="full"
        borderWidth="1px"
        borderColor={c}
        opacity={0.6}
        style={{ animation: "system-spin-slow 18s linear infinite reverse" }}
        boxShadow={`inset 0 0 28px ${c}55, 0 0 22px ${c}33`}
      />
      {/* glow blob */}
      <Box
        position="absolute"
        inset="20%"
        borderRadius="full"
        background={`radial-gradient(circle at 50% 50%, ${c}66 0%, transparent 70%)`}
        filter="blur(18px)"
        style={{ animation: "system-pulse 4.5s ease-in-out infinite" }}
      />

      {/* piece */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box style={{ animation: "system-float 6s ease-in-out infinite" }}>
          <Box
            as="span"
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize={{ base: "9rem", md: "13rem" }}
            fontWeight="700"
            color={c}
            lineHeight="1"
            style={{
              filter: `drop-shadow(0 0 24px ${c}) drop-shadow(0 0 60px ${c}66)`,
            }}
          >
            {PIECE_SVG[tier.rank] ?? "♛"}
          </Box>
        </Box>
      </motion.div>

      {/* rank label below */}
      <Box
        position="absolute"
        bottom="-18px"
        left={0}
        right={0}
        textAlign="center"
      >
        <Box
          as="span"
          fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
          fontSize="xs"
          fontWeight="700"
          letterSpacing="0.4em"
          textTransform="uppercase"
          color={c}
          textShadow={`0 0 8px ${c}`}
        >
          ── {tier.rank}-rank · {tier.label} ──
        </Box>
      </Box>
    </Box>
  );
}
