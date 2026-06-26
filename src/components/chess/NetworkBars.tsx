"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import type { NetQuality } from "@/lib/useNetworkQuality";

const HEIGHTS = [5, 8, 11, 14];

/** chess.com-style signal bars for live-game connection quality. */
export function NetworkBars({ quality, showMs = false }: { quality: NetQuality; showMs?: boolean }) {
  const { bars, latencyMs, online } = quality;
  const color = !online ? "#E0655C" : bars >= 3 ? "#3DBA6E" : bars === 2 ? "#E5B45B" : "#E0655C";
  const title = !online ? "Offline" : latencyMs != null ? `${latencyMs} ms` : "Measuring…";

  return (
    <HStack gap={1} align="center" title={title} aria-label={`Connection quality: ${title}`}>
      <HStack gap="2px" align="flex-end" h="14px">
        {HEIGHTS.map((h, i) => (
          <Box
            key={i}
            w="3px"
            h={`${h}px`}
            borderRadius="1px"
            bg={i < bars ? color : "whiteAlpha.300"}
            transition="background 0.3s"
          />
        ))}
      </HStack>
      {showMs && online && latencyMs != null ? (
        <Text fontSize="10px" color="whiteAlpha.600" lineHeight="1">
          {latencyMs}ms
        </Text>
      ) : null}
    </HStack>
  );
}
