"use client";

import { useMemo } from "react";
import { Text, Box } from "@chakra-ui/react";
import { Chess } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  q: 9,
  r: 5,
  b: 3,
  n: 3,
  p: 1,
  k: 0,
};

function computeMaterial(fen: string): number {
  const chess = new Chess(fen);
  let white = 0;
  let black = 0;
  const board = chess.board();
  for (const row of board) {
    for (const sq of row) {
      if (!sq) continue;
      const type = sq.type;
      const val = PIECE_VALUES[type] ?? 0;
      if (sq.color === "w") white += val;
      else black += val;
    }
  }
  return white - black; // positive = white ahead
}

interface MaterialDisplayProps {
  fen: string;
}

export function MaterialDisplay({ fen }: MaterialDisplayProps) {
  const advantage = useMemo(() => computeMaterial(fen), [fen]);

  const label =
    advantage > 0 ? `+${advantage}` : advantage < 0 ? `${advantage}` : "0";

  return (
    <Box
      py={1}
      px={2}
      borderRadius="soft"
      bg="bgCard"
      borderWidth="1px"
      borderColor="goldDark"
      textAlign="center"
    >
      <Text color="textMuted" fontSize="xs" mb={0.5}>
        Material
      </Text>
      <Text
        color={
          advantage > 0
            ? "white"
            : advantage < 0
              ? "statusWarning"
              : "textSecondary"
        }
        fontWeight="600"
        fontSize="sm"
      >
        {label}
      </Text>
    </Box>
  );
}
