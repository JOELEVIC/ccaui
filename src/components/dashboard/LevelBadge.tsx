"use client";

import { Box, Text } from "@chakra-ui/react";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md";
}

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const isSm = size === "sm";
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap={1}
      px={isSm ? 2 : 3}
      py={isSm ? 1 : 1.5}
      borderRadius="full"
      bg="goldDark"
      color="gold"
      borderWidth="1px"
      borderColor="gold"
    >
      <Text
        fontSize={isSm ? "xs" : "sm"}
        fontWeight="700"
        fontFamily="var(--font-playfair), Georgia, serif"
      >
        Lv {level}
      </Text>
    </Box>
  );
}
