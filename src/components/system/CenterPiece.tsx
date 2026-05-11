"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { R2MTier } from "@/lib/r2m";

const RANK_GLYPH: Record<string, string> = {
  E: "♟",
  D: "♞",
  C: "♝",
  B: "♜",
  A: "♛",
  S: "♚",
  SS: "♚",
};

interface CenterPieceProps {
  tier: R2MTier;
}

/**
 * The central composition for the lobby — replaces the previous spinning
 * concentric rings (which read as a loading spinner) with a STATIC
 * hexagonal portal containing the player's current rank glyph plus a
 * clear identity strap underneath.
 *
 * Three static layers, no rotation:
 *   1. Outer chamfered hex frame (1px stroke + tier-coloured halo)
 *   2. Inner hex panel with the rank glyph centred
 *   3. Identity strap below — "C-RANK · TACTICIAN · LV 1" with a single
 *      pulsing dot to keep the surface alive without screaming "loading".
 */
export function CenterPiece({ tier }: CenterPieceProps) {
  const c = tier.color;
  return (
    <VStack gap={5} align="center" pointerEvents="none">
      <Box
        position="relative"
        w={{ base: "240px", md: "320px" }}
        h={{ base: "240px", md: "320px" }}
      >
        {/* Soft ambient halo behind the portal */}
        <Box
          position="absolute"
          inset="-15%"
          borderRadius="full"
          background={`radial-gradient(circle at 50% 50%, ${c}33 0%, transparent 60%)`}
          filter="blur(28px)"
        />

        {/* Outer hex — static stroke with chamfered corners */}
        <Box
          position="absolute"
          inset={0}
          className="sys-clip-hex"
          bg={c}
          style={{ filter: `drop-shadow(0 0 18px ${c}88)` }}
        />
        <Box position="absolute" inset="2px" className="sys-clip-hex" bg="var(--sys-void)" />

        {/* Inner hex — slightly smaller, gives a frame-within-frame depth */}
        <Box
          position="absolute"
          inset="14%"
          className="sys-clip-hex"
          bg={`${c}22`}
          style={{ boxShadow: `inset 0 0 36px ${c}55` }}
        />
        <Box
          position="absolute"
          inset="calc(14% + 2px)"
          className="sys-clip-hex"
          borderWidth="1px"
          borderColor={`${c}66`}
        />

        {/* Rank glyph */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize={{ base: "8rem", md: "11rem" }}
            fontWeight="700"
            color={c}
            lineHeight="1"
            style={{ filter: `drop-shadow(0 0 20px ${c}) drop-shadow(0 0 52px ${c}55)` }}
          >
            {RANK_GLYPH[tier.rank] ?? "♛"}
          </Box>
        </motion.div>

        {/* Four corner brackets on the outer hex perimeter */}
        {[
          { top: "6%", left: "50%", transform: "translateX(-50%)" },
          { bottom: "6%", left: "50%", transform: "translateX(-50%)" },
          { left: "4%", top: "50%", transform: "translateY(-50%)" },
          { right: "4%", top: "50%", transform: "translateY(-50%)" },
        ].map((pos, i) => (
          <Box
            key={i}
            position="absolute"
            w="14px"
            h="2px"
            bg={c}
            style={{
              ...pos,
              boxShadow: `0 0 6px ${c}`,
            }}
          />
        ))}
      </Box>

      {/* Identity strap — single line, gold-on-dark, with a pulsing dot. */}
      <HStack gap={3} align="center">
        <Box
          w="6px"
          h="6px"
          borderRadius="full"
          bg={c}
          style={{ boxShadow: `0 0 6px ${c}`, animation: "system-pulse 2s ease-in-out infinite" }}
        />
        <Text
          fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
          fontSize="xs"
          fontWeight="800"
          letterSpacing="0.38em"
          textTransform="uppercase"
          color={c}
          style={{ textShadow: `0 0 6px ${c}99` }}
        >
          {tier.rank}-Rank · {tier.label}
        </Text>
        <Box
          w="6px"
          h="6px"
          borderRadius="full"
          bg={c}
          style={{ boxShadow: `0 0 6px ${c}`, animation: "system-pulse 2s ease-in-out infinite" }}
        />
      </HStack>
    </VStack>
  );
}
