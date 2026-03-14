"use client";

import { Box } from "@chakra-ui/react";

/**
 * Section divider: thin chess-board stripe (alternating light/dark squares).
 * Inline SVG, no external assets.
 */
export function ChessDivider() {
  const size = 12;
  const count = 24;
  const light = "rgba(255,255,255,0.08)";
  const dark = "rgba(0,0,0,0.2)";

  return (
    <Box
      w="full"
      py={2}
      display="flex"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
      aria-hidden
    >
      <svg
        width={size * count}
        height={size}
        viewBox={`0 0 ${size * count} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: count }).map((_, i) => (
          <rect
            key={i}
            x={i * size}
            y={0}
            width={size}
            height={size}
            fill={i % 2 === 0 ? light : dark}
            opacity={0.4}
          />
        ))}
      </svg>
    </Box>
  );
}
