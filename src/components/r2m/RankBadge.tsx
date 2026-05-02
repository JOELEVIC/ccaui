"use client";

import { Box, Text } from "@chakra-ui/react";
import type { R2MTier } from "@/lib/r2m";

interface RankBadgeProps {
  tier: R2MTier;
  size?: "sm" | "md" | "lg";
}

export function RankBadge({ tier, size = "md" }: RankBadgeProps) {
  const dim = size === "sm" ? "32px" : size === "md" ? "44px" : "72px";
  const fs = size === "sm" ? "sm" : size === "md" ? "md" : "2xl";

  return (
    <Box
      w={dim}
      h={dim}
      borderRadius="soft"
      bg="bgCard"
      borderWidth="2px"
      borderColor={tier.color}
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxShadow={`0 0 14px ${tier.color}33`}
    >
      <Text
        fontSize={fs}
        fontWeight="700"
        fontFamily="var(--font-playfair), Georgia, serif"
        color={tier.color}
        letterSpacing="wider"
      >
        {tier.rank}
      </Text>
    </Box>
  );
}
