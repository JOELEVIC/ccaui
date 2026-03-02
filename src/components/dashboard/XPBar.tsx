"use client";

import { Box, Text } from "@chakra-ui/react";

const XP_PER_LEVEL = 100;

function xpForLevel(level: number): number {
  return level * XP_PER_LEVEL;
}

export interface XPBarProps {
  xp: number;
  level?: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function XPBar({
  xp,
  level: levelProp,
  showLabel = true,
  size = "md",
}: XPBarProps) {
  const level = levelProp ?? 1 + Math.floor(xp / XP_PER_LEVEL);
  const xpNext = xpForLevel(level);
  const xpPrev = xpForLevel(level - 1);
  const currentInLevel = xp - xpPrev;
  const neededInLevel = xpNext - xpPrev;
  const pct = Math.min(100, (currentInLevel / neededInLevel) * 100);

  const isSm = size === "sm";
  return (
    <Box w="full" minW={isSm ? "80px" : "120px"}>
      <Box
        h={isSm ? 1.5 : 2}
        borderRadius="full"
        bg="whiteAlpha.1"
        overflow="hidden"
      >
        <Box
          h="full"
          w={`${pct}%`}
          bg="gold"
          borderRadius="full"
          transition="width 0.3s ease"
        />
      </Box>
      {showLabel && (
        <Text
          fontSize={isSm ? "xs" : "sm"}
          color="textMuted"
          mt={0.5}
        >
          {currentInLevel}/{neededInLevel} XP
        </Text>
      )}
    </Box>
  );
}
