"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { SystemLabel, type GlowAccent } from "./SystemPrimitives";

/**
 * SystemBoardFrame — chamfered HUD chrome around a chessboard (or any
 * square element). Renders a glow ring, four corner brackets, a turn
 * indicator strip on top, and an optional evaluation/coordinate rail on
 * the right. The board itself is passed in as `children` so this is
 * decoupled from the chessboard library.
 */

interface SystemBoardFrameProps {
  accent?: GlowAccent;
  /** "White to move" / "Black to move" — shown on the top strip. */
  turn?: "white" | "black";
  /** Optional left-side eyebrow tag (e.g. "GATE · Lv 14"). */
  tag?: string;
  /** Optional right-side label inside the top strip (e.g. theme, ELO). */
  topMeta?: string;
  /** Right-side rail content (move list, evaluation, hint stack). */
  rightRail?: React.ReactNode;
  /** Children = the actual chessboard. Set to its own size. */
  children: React.ReactNode;
}

export function SystemBoardFrame({
  accent = "cyan",
  turn,
  tag,
  topMeta,
  rightRail,
  children,
}: SystemBoardFrameProps) {
  const accentVar = accentToVar(accent);
  const accentRgb = accentToRgb(accent);

  return (
    <HStack
      align="flex-start"
      gap={{ base: 3, lg: 5 }}
      flexWrap={{ base: "wrap", lg: "nowrap" }}
      justify={{ base: "center", lg: "flex-start" }}
    >
      <VStack align="stretch" gap={2} flex={{ base: "1 1 100%", lg: "0 1 auto" }}>
        {/* Top strip */}
        <Box
          position="relative"
          px={3}
          py={2}
          bg="rgba(10,11,14,0.65)"
          borderWidth="1px"
          borderColor={accentVar}
          className="sys-clip-panel-sm"
          style={{ boxShadow: `0 0 12px rgba(${accentRgb}, 0.25)` }}
        >
          <HStack justify="space-between" align="center" gap={3} flexWrap="wrap">
            <HStack gap={2.5}>
              {tag && <SystemLabel accent={accent}>{tag}</SystemLabel>}
              {turn && <TurnDot turn={turn} />}
            </HStack>
            {topMeta && (
              <Text
                fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
                fontSize="2xs"
                color="textMuted"
                letterSpacing="0.2em"
                textTransform="uppercase"
              >
                {topMeta}
              </Text>
            )}
          </HStack>
        </Box>

        {/* Board well — chamfered glass with corner brackets */}
        <Box
          position="relative"
          p={{ base: 2, md: 3 }}
          bg="rgba(10,11,14,0.55)"
          backdropFilter="blur(10px)"
          borderWidth="1px"
          borderColor={`rgba(${accentRgb}, 0.45)`}
          className="sys-clip-panel"
          style={{ boxShadow: `0 0 30px rgba(${accentRgb}, 0.18), inset 0 0 30px rgba(${accentRgb}, 0.06)` }}
        >
          <CornerBrackets accent={accent} />
          <Box position="relative" zIndex={1}>
            {children}
          </Box>
        </Box>
      </VStack>

      {rightRail && (
        <Box
          flex="1 1 280px"
          minW="260px"
          maxW={{ base: "full", lg: "380px" }}
          alignSelf="stretch"
        >
          {rightRail}
        </Box>
      )}
    </HStack>
  );
}

function TurnDot({ turn }: { turn: "white" | "black" }) {
  const isWhite = turn === "white";
  return (
    <HStack gap={1.5}>
      <Box
        w="10px"
        h="10px"
        borderRadius="full"
        bg={isWhite ? "#f0f2f8" : "#0b0d14"}
        borderWidth="1px"
        borderColor={isWhite ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.5)"}
        style={{ boxShadow: isWhite ? "0 0 6px rgba(255,255,255,0.7)" : "0 0 6px rgba(0,0,0,0.7)" }}
      />
      <Text
        fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
        fontSize="2xs"
        fontWeight="800"
        color={isWhite ? "#f0f2f8" : "var(--sys-cyan)"}
        letterSpacing="0.22em"
        textTransform="uppercase"
      >
        {turn} to move
      </Text>
    </HStack>
  );
}

function CornerBrackets({ accent }: { accent: GlowAccent }) {
  const c = accentToVar(accent);
  const corners = [
    { top: 6, left: 6, borderTopWidth: "1px", borderLeftWidth: "1px" },
    { top: 6, right: 6, borderTopWidth: "1px", borderRightWidth: "1px" },
    { bottom: 6, left: 6, borderBottomWidth: "1px", borderLeftWidth: "1px" },
    { bottom: 6, right: 6, borderBottomWidth: "1px", borderRightWidth: "1px" },
  ];
  return (
    <>
      {corners.map((s, i) => (
        <Box
          key={i}
          position="absolute"
          w="14px"
          h="14px"
          borderColor={c}
          pointerEvents="none"
          zIndex={2}
          {...s}
        />
      ))}
    </>
  );
}

function accentToVar(a: GlowAccent): string {
  switch (a) {
    case "cyan":   return "var(--sys-cyan)";
    case "purple": return "var(--sys-purple)";
    case "epic":   return "var(--sys-epic)";
    case "threat": return "var(--sys-threat)";
    case "gold":   return "var(--sys-prestige-gold)";
  }
}

function accentToRgb(a: GlowAccent): string {
  switch (a) {
    case "cyan":   return "0, 240, 255";
    case "purple": return "138, 43, 226";
    case "epic":   return "177, 151, 252";
    case "threat": return "240, 101, 149";
    case "gold":   return "245, 194, 68";
  }
}
