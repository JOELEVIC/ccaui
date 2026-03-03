"use client";

import { Box, Center, Text, VStack } from "@chakra-ui/react";

/** Animated knight piece (Unicode ♞) for loader */
function KnightIcon({ size = 48 }: { size?: number }) {
  return (
    <Text
      as="span"
      display="block"
      color="gold"
      fontSize={`${size}px`}
      lineHeight={1}
      fontFamily="var(--font-playfair), Georgia, serif"
      style={{ animation: "chessLoaderFloat 2s ease-in-out infinite" }}
      aria-hidden
    >
      ♞
    </Text>
  );
}

/** 4x4 mini board with staggered pulse */
function MiniBoard() {
  const size = 4;
  const cells: { row: number; col: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) cells.push({ row: r, col: c });
  }
  return (
    <Box
      display="grid"
      gridTemplateColumns={`repeat(${size}, 12px)`}
      gridTemplateRows={`repeat(${size}, 12px)`}
      gap="1px"
    >
      {cells.map(({ row, col }) => {
        const isLight = (row + col) % 2 === 0;
        return (
          <Box
            key={`${row}-${col}`}
            bg={isLight ? "gold" : "goldDark"}
            borderRadius="2px"
            opacity={isLight ? 0.9 : 0.5}
            style={{
              animation: "chessLoaderPulse 1.8s ease-in-out infinite",
              animationDelay: `${(row * size + col) * 0.06}s`,
            }}
          />
        );
      })}
    </Box>
  );
}

export interface ChessLoaderProps {
  /** Optional message below the animation */
  message?: string;
}

/**
 * Full-height chess-themed loader. Use for auth gate or route loading.
 * Background is at least 100vh so it fills the screen.
 */
export function ChessLoader({ message = "Loading..." }: ChessLoaderProps) {
  return (
    <Center
      w="full"
      bg="bgDark"
      position="fixed"
      inset={0}
      zIndex={10}
      style={{ minHeight: "100vh" }}
    >
      <style>{`
        @keyframes chessLoaderFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-6px) scale(1.02); opacity: 0.92; }
        }
        @keyframes chessLoaderPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
      <VStack gap={6}>
        <Box position="relative" display="flex" alignItems="center" justifyContent="center">
          <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
            <MiniBoard />
          </Box>
          <KnightIcon size={56} />
        </Box>
        {message && (
          <Text color="gold" fontSize="sm" fontWeight="500" letterSpacing="0.02em">
            {message}
          </Text>
        )}
      </VStack>
    </Center>
  );
}
