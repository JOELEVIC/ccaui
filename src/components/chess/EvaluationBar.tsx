"use client";

import { Box, Text, Spinner } from "@chakra-ui/react";

const CP_RANGE = 700; // cp at which the bar is fully one side
const BAR_WIDTH = 26;
const WHITE = "#ededed";
const DARK = "#3d3a44";

export interface EvaluationData {
  cp: number | null;
  mate: number | null;
}

interface EvaluationBarProps {
  evaluation: EvaluationData | null;
  loading?: boolean;
  orientation?: "white" | "black";
}

/** "+1.2" / "−5" / "M3" — white-positive. */
function formatEval(cp: number | null, mate: number | null): string {
  if (mate !== null) return `M${Math.abs(mate)}`;
  if (cp === null) return "";
  const p = cp / 100;
  const a = Math.abs(p);
  const num = a < 10 ? a.toFixed(1) : Math.round(a).toString();
  return `${p >= 0 ? "+" : "−"}${num}`;
}

/**
 * Vertical evaluation bar, chess.com-style: a fixed two-tone column (white's
 * share light, black's share dark) whose boundary moves with the eval — the
 * colours never swap. The numeric eval sits at the leader's end.
 */
export function EvaluationBar({ evaluation, loading = false, orientation = "white" }: EvaluationBarProps) {
  if (loading) {
    return (
      <Box w={`${BAR_WIDTH}px`} minH="200px" alignSelf="stretch" borderRadius="soft" bg={DARK}
        display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
        <Spinner size="sm" color="gold" />
      </Box>
    );
  }

  const mate = evaluation?.mate ?? null;
  const cp = evaluation?.cp ?? null;

  let whiteShare = 0.5;
  if (mate !== null) whiteShare = mate > 0 ? 1 : 0;
  else if (cp !== null) whiteShare = Math.max(0.03, Math.min(0.97, cp / (2 * CP_RANGE) + 0.5));

  const whiteLeads = mate !== null ? mate > 0 : (cp ?? 0) >= 0;
  const whiteAtBottom = orientation === "white";
  const label = formatEval(cp, mate);
  // The number sits at the leader's end of the bar.
  const leaderAtBottom = whiteLeads ? whiteAtBottom : !whiteAtBottom;

  return (
    <Box
      w={`${BAR_WIDTH}px`}
      minH="200px"
      alignSelf="stretch"
      borderRadius="soft"
      position="relative"
      overflow="hidden"
      bg={DARK}
      borderWidth="1px"
      borderColor="blackAlpha.300"
      flexShrink={0}
    >
      {/* White's share (light); the rest of the column stays dark. */}
      <Box
        position="absolute"
        left={0}
        right={0}
        h={`${whiteShare * 100}%`}
        bg={WHITE}
        transition="height 0.25s ease"
        {...(whiteAtBottom ? { bottom: 0 } : { top: 0 })}
      />
      {/* Even midline */}
      <Box position="absolute" left={0} right={0} top="50%" h="1px" bg="blackAlpha.300" />
      {label && (
        <Text
          position="absolute"
          left={0}
          right={0}
          textAlign="center"
          fontSize="9px"
          fontWeight="800"
          lineHeight="1"
          fontFamily="mono"
          color={whiteLeads ? "#1a1a1a" : WHITE}
          {...(leaderAtBottom ? { bottom: "3px" } : { top: "3px" })}
        >
          {label}
        </Text>
      )}
    </Box>
  );
}
