"use client";

import { Box, Text } from "@chakra-ui/react";

const TIERS = [
  { min: 0, max: 1199, label: "Starter", color: "gray" },
  { min: 1200, max: 1399, label: "Bronze", color: "#cd7f32" },
  { min: 1400, max: 1599, label: "Silver", color: "#c0c0c0" },
  { min: 1600, max: 1799, label: "Gold", color: "gold" },
  { min: 1800, max: 1999, label: "Platinum", color: "#e5e4e2" },
  { min: 2000, max: 9999, label: "Master", color: "gold" },
];

function getTier(rating: number): { label: string; color: string } {
  const t = TIERS.find((tier) => rating >= tier.min && rating <= tier.max);
  return t
    ? { label: t.label, color: t.color }
    : { label: "Starter", color: "gray" };
}

interface TierLabelProps {
  rating: number;
  size?: "sm" | "md";
}

export function TierLabel({ rating, size = "md" }: TierLabelProps) {
  const { label, color } = getTier(rating);
  const isSm = size === "sm";
  return (
    <Box
      display="inline-flex"
      px={isSm ? 2 : 2.5}
      py={isSm ? 0.5 : 1}
      borderRadius="soft"
      bg="whiteAlpha.08"
      borderWidth="1px"
      borderColor="whiteAlpha.2"
    >
      <Text
        fontSize={isSm ? "xs" : "sm"}
        fontWeight="600"
        color={color}
      >
        {label}
      </Text>
    </Box>
  );
}
