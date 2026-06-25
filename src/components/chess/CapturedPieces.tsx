"use client";

import { Box, HStack, Text } from "@chakra-ui/react";

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const FULL: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
// Filled glyphs for both colours; colour conveys whose piece it was.
const GLYPH: Record<string, string> = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" };
const ORDER = ["p", "n", "b", "r", "q"] as const;

function remaining(fen: string, color: "w" | "b"): Record<string, number> {
  const board = fen.split(" ")[0] ?? "";
  const c: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  for (const ch of board) {
    if (color === "w" && /[PNBRQ]/.test(ch)) c[ch.toLowerCase()]++;
    else if (color === "b" && /[pnbrq]/.test(ch)) c[ch]++;
  }
  return c;
}

function material(rem: Record<string, number>): number {
  return ORDER.reduce((s, t) => s + rem[t] * VALUE[t], 0);
}

/**
 * The pieces `side` has captured (the opponent's missing pieces), shown as glyphs
 * in the captured piece's colour, plus a "+N" material edge when `side` is ahead.
 */
export function CapturedPieces({ fen, side }: { fen: string; side: "w" | "b" }) {
  const opp = side === "w" ? "b" : "w";
  const myRem = remaining(fen, side);
  const oppRem = remaining(fen, opp);

  const taken: string[] = [];
  for (const t of ORDER) {
    const n = FULL[t] - oppRem[t];
    for (let i = 0; i < n; i++) taken.push(t);
  }
  const adv = material(myRem) - material(oppRem);
  if (taken.length === 0 && adv <= 0) return null;

  // Captured pieces are the opponent's colour: black → near-black, white → mid-grey (visible on light cards).
  const glyphColor = opp === "w" ? "#9aa0ac" : "#2b2b2b";

  return (
    <HStack gap="1px" align="center" mt={0.5} minH="14px">
      {taken.map((t, i) => (
        <Box key={i} as="span" fontSize="13px" lineHeight="1" style={{ color: glyphColor }}>
          {GLYPH[t]}
        </Box>
      ))}
      {adv > 0 && (
        <Text fontSize="2xs" fontWeight="700" color="textMuted" ml={1}>
          +{adv}
        </Text>
      )}
    </HStack>
  );
}
