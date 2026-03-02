"use client";

import { Box, HStack, Text } from "@chakra-ui/react";

interface StreakCounterProps {
  count: number;
  size?: "sm" | "md";
}

export function StreakCounter({ count, size = "md" }: StreakCounterProps) {
  if (count < 1) return null;

  const isSm = size === "sm";
  return (
    <HStack gap={1} alignItems="center">
      <Text
        aria-hidden
        fontSize={isSm ? "sm" : "md"}
        lineHeight={1}
      >
        🔥
      </Text>
      <Text
        color="gold"
        fontSize={isSm ? "xs" : "sm"}
        fontWeight="600"
      >
        {count} day streak
      </Text>
    </HStack>
  );
}
