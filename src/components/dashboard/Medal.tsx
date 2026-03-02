"use client";

import { Box, Text } from "@chakra-ui/react";

interface MedalProps {
  rank: 1 | 2 | 3;
  size?: "sm" | "md";
}

const MEDALS: Record<1 | 2 | 3, { char: string; color: string }> = {
  1: { char: "🥇", color: "gold" },
  2: { char: "🥈", color: "gray.400" },
  3: { char: "🥉", color: "orange.600" },
};

export function Medal({ rank, size = "md" }: MedalProps) {
  const { char, color } = MEDALS[rank];
  const isSm = size === "sm";
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w={isSm ? 6 : 8}
      h={isSm ? 6 : 8}
      flexShrink={0}
      aria-label={`Rank ${rank}`}
    >
      <Text fontSize={isSm ? "sm" : "md"} lineHeight={1}>
        {char}
      </Text>
    </Box>
  );
}
