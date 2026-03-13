"use client";

import { Box, Text, Spinner } from "@chakra-ui/react";

const CP_RANGE = 600;
const BAR_WIDTH = 28;

export interface EvaluationData {
  cp: number | null;
  mate: number | null;
}

interface EvaluationBarProps {
  evaluation: EvaluationData | null;
  loading?: boolean;
  orientation?: "white" | "black";
}

export function EvaluationBar({
  evaluation,
  loading = false,
  orientation = "white",
}: EvaluationBarProps) {
  if (loading) {
    return (
      <Box
        w={`${BAR_WIDTH}px`}
        minH="200px"
        borderRadius="soft"
        bg="bgCard"
        borderWidth="1px"
        borderColor="goldDark"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="sm" color="gold" />
      </Box>
    );
  }

  const mate = evaluation?.mate ?? null;
  const cp = evaluation?.cp ?? null;

  if (mate !== null) {
    const isWhiteMate = mate > 0;
    const display = `M${Math.abs(mate)}`;
    return (
      <Box
        w={`${BAR_WIDTH}px`}
        minH="200px"
        borderRadius="soft"
        bg="bgCard"
        borderWidth="1px"
        borderColor="goldDark"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={2}
      >
        <Text
          color={isWhiteMate ? "white" : "statusWarning"}
          fontWeight="700"
          fontSize="xs"
        >
          {display}
        </Text>
      </Box>
    );
  }

  if (cp === null) {
    return (
      <Box
        w={`${BAR_WIDTH}px`}
        minH="200px"
        borderRadius="soft"
        bg="bgCard"
        borderWidth="1px"
        borderColor="goldDark"
      />
    );
  }

  const clamped = Math.max(-CP_RANGE, Math.min(CP_RANGE, cp));
  const pct = (clamped + CP_RANGE) / (2 * CP_RANGE);
  const fillPct = orientation === "white" ? pct : 1 - pct;
  const whiteAdvantage = cp > 0;

  return (
    <Box
      w={`${BAR_WIDTH}px`}
      minH="200px"
      borderRadius="soft"
      bg="bgCard"
      borderWidth="1px"
      borderColor="goldDark"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h={`${fillPct * 100}%`}
        bg={whiteAdvantage ? "whiteAlpha.4" : "statusWarning"}
        opacity={whiteAdvantage ? 1 : 0.6}
        transition="height 0.2s"
      />
      <Box
        position="absolute"
        left={0}
        right={0}
        top="50%"
        h="1px"
        bg="gold"
        opacity={0.5}
      />
    </Box>
  );
}
