"use client";

import { Box, Image } from "@chakra-ui/react";

const COLORS = ["#c0563f", "#3f7bc0", "#3fb27f", "#a86fc0", "#c0a23f", "#4f9ea0", "#cf6f9a", "#7f8cc0", "#c07f4f"];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

/** Player avatar: the real image when available, else a deterministic coloured
 *  initial (a stable "random" avatar per user). */
export function PlayerAvatar({
  name,
  avatarUrl,
  size = 36,
}: {
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;
}) {
  if (avatarUrl) {
    return <Image src={avatarUrl} alt="" boxSize={`${size}px`} borderRadius="full" objectFit="cover" flexShrink={0} />;
  }
  const initial = (name?.charAt(0) ?? "?").toUpperCase();
  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="full"
      flexShrink={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight="800"
      style={{ background: colorFor(name ?? "?"), fontSize: `${Math.round(size * 0.42)}px` }}
    >
      {initial}
    </Box>
  );
}

/** Small chip showing which colour a player has (a white/black disc + label). */
export function ColorChip({ color }: { color: "w" | "b" }) {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="4px"
      px="6px"
      py="1px"
      borderRadius="full"
      bg="blackAlpha.200"
    >
      <Box
        w="9px"
        h="9px"
        borderRadius="full"
        bg={color === "w" ? "#f0f0f0" : "#1a1a1a"}
        borderWidth="1px"
        borderColor="blackAlpha.400"
      />
      <Box as="span" fontSize="9px" fontWeight="700" letterSpacing="0.08em" color="textMuted" textTransform="uppercase">
        {color === "w" ? "White" : "Black"}
      </Box>
    </Box>
  );
}
