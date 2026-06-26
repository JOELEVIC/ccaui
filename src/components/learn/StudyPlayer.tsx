"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, HStack, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import Link from "next/link";
import { Chess } from "chess.js";
import { LessonBoard } from "./LessonBoard";

export interface StudyChip {
  label: string;
  tone?: "light" | "dark" | "muted";
}

export interface StudyLine {
  id: string;
  name: string;
  blurb: string;
  moves: { san: string; note?: string }[];
}

export interface StudyPlayerProps {
  glyph: string;
  title: string;
  chips: StudyChip[];
  idea: string;
  /** Position to start from; defaults to the standard initial position. */
  startFen?: string;
  orientation: "white" | "black";
  lines: StudyLine[];
  backHref?: string;
  backLabel?: string;
}

function positionAt(startFen: string | undefined, sans: string[], ply: number) {
  const c = new Chess();
  if (startFen) {
    try {
      c.load(startFen);
    } catch {
      /* fall back to start */
    }
  }
  let last: { from: string; to: string } | null = null;
  for (let i = 0; i < ply && i < sans.length; i++) {
    const mv = c.move(sans[i]);
    if (mv && i === ply - 1) last = { from: mv.from, to: mv.to };
  }
  return { fen: c.fen(), last };
}

/** Side to move + fullmove number from a FEN (defaults: white, move 1). */
function fenStart(startFen?: string): { whiteFirst: boolean; firstMoveNo: number } {
  if (!startFen) return { whiteFirst: true, firstMoveNo: 1 };
  const parts = startFen.split(/\s+/);
  return { whiteFirst: parts[1] !== "b", firstMoveNo: parseInt(parts[5] ?? "1", 10) || 1 };
}

function CtrlButton({ onClick, disabled, children, title }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; title?: string }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      title={title}
      size="sm"
      variant="outline"
      borderColor="blackAlpha.300"
      color="textPrimary"
      borderRadius="soft"
      minW="44px"
      _hover={{ borderColor: "gold", color: "gold" }}
      _disabled={{ opacity: 0.35, cursor: "not-allowed" }}
    >
      {children}
    </Button>
  );
}

export function StudyPlayer({ glyph, title, chips, idea, startFen, orientation, lines, backHref = "/learning", backLabel = "← Learn" }: StudyPlayerProps) {
  const [lineIdx, setLineIdx] = useState(0);
  const [ply, setPly] = useState(0);
  const [auto, setAuto] = useState(false);

  const line = lines[lineIdx];
  const sans = useMemo(() => line.moves.map((m) => m.san), [line]);
  const { fen, last } = useMemo(() => positionAt(startFen, sans, ply), [startFen, sans, ply]);
  const atEnd = ply >= sans.length;
  const currentNote = ply > 0 ? line.moves[ply - 1].note : undefined;
  const { whiteFirst, firstMoveNo } = useMemo(() => fenStart(startFen), [startFen]);

  // Move number + dot for the i-th half-move (0-based), honouring the start side.
  const moveLabel = (i: number) => {
    const isWhiteMove = whiteFirst ? i % 2 === 0 : i % 2 === 1;
    const completedPairs = whiteFirst ? Math.floor(i / 2) : Math.floor((i + 1) / 2);
    const no = firstMoveNo + completedPairs;
    return { no, isWhiteMove };
  };

  useEffect(() => {
    if (!auto) return;
    if (ply >= sans.length) {
      setAuto(false);
      return;
    }
    const t = window.setTimeout(() => setPly((p) => Math.min(p + 1, sans.length)), 2100);
    return () => window.clearTimeout(t);
  }, [auto, ply, sans.length]);

  const goLine = (i: number) => {
    setAuto(false);
    setLineIdx(i);
    setPly((p) => Math.min(p, lines[i].moves.length));
  };

  const cur = ply > 0 ? moveLabel(ply - 1) : null;

  return (
    <VStack align="stretch" gap={5} maxW="1040px" mx="auto">
      <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
        <HStack gap={3} align="center" minW={0}>
          <Link href={backHref}>
            <Button size="sm" variant="outline" borderColor="blackAlpha.300" color="textPrimary" borderRadius="soft" _hover={{ borderColor: "gold", color: "gold" }}>
              {backLabel}
            </Button>
          </Link>
          <Box w="44px" h="44px" borderRadius="12px" flexShrink={0} display="flex" alignItems="center" justifyContent="center" fontSize="24px" color="white" bg="gold">
            {glyph}
          </Box>
          <Box minW={0}>
            <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="xl" color="textPrimary" lineHeight="1.1" lineClamp={1}>
              {title}
            </Text>
            <HStack gap={2} mt={0.5} flexWrap="wrap">
              {chips.map((c, i) => (
                <Text
                  key={i}
                  fontSize="2xs"
                  fontWeight="700"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  bg={c.tone === "dark" ? "blackAlpha.800" : c.tone === "light" ? "blackAlpha.100" : "transparent"}
                  color={c.tone === "dark" ? "white" : c.tone === "muted" ? "textMuted" : "textPrimary"}
                >
                  {c.label}
                </Text>
              ))}
            </HStack>
          </Box>
        </HStack>
      </HStack>

      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "minmax(0, 1fr) minmax(0, 380px)" }} gap={6} alignItems="start">
        <VStack align="stretch" gap={3}>
          <LessonBoard fen={fen} orientation={orientation} interactive={false} onMove={() => false} lastMove={last} />
          <HStack justify="center" gap={2}>
            <CtrlButton onClick={() => { setAuto(false); setPly(0); }} disabled={ply === 0} title="Start">⏮</CtrlButton>
            <CtrlButton onClick={() => { setAuto(false); setPly((p) => Math.max(0, p - 1)); }} disabled={ply === 0} title="Previous">◀</CtrlButton>
            <Button
              onClick={() => { if (atEnd) { setPly(0); setAuto(true); } else setAuto((a) => !a); }}
              size="sm" bg="gold" color="white" borderRadius="soft" px={5} _hover={{ bg: "goldLight" }}
              title={auto ? "Pause" : "Auto-play"}
            >
              {auto ? "❚❚ Pause" : atEnd ? "↻ Replay" : "▶ Play"}
            </Button>
            <CtrlButton onClick={() => { setAuto(false); setPly((p) => Math.min(sans.length, p + 1)); }} disabled={atEnd} title="Next">▶</CtrlButton>
            <CtrlButton onClick={() => { setAuto(false); setPly(sans.length); }} disabled={atEnd} title="End">⏭</CtrlButton>
          </HStack>
          <Text textAlign="center" fontSize="2xs" color="textMuted" letterSpacing="0.08em">
            {ply}/{sans.length} moves shown
          </Text>
        </VStack>

        <VStack align="stretch" gap={4}>
          <Box p={4} borderRadius="soft" bg="bgWarm" borderWidth="1px" borderColor="blackAlpha.200">
            <Text fontSize="2xs" color="gold" letterSpacing="0.14em" textTransform="uppercase" mb={1}>The idea</Text>
            <Text fontSize="sm" color="textPrimary" lineHeight="1.6">{idea}</Text>
          </Box>

          {lines.length > 1 && (
            <Box>
              <Text fontSize="2xs" color="textMuted" letterSpacing="0.12em" textTransform="uppercase" mb={2}>Lines</Text>
              <VStack align="stretch" gap={1.5}>
                {lines.map((l, i) => (
                  <Box
                    key={l.id}
                    as="button"
                    onClick={() => goLine(i)}
                    textAlign="left"
                    p={2.5}
                    borderRadius="md"
                    borderWidth="1px"
                    cursor="pointer"
                    bg={i === lineIdx ? "rgba(212,175,55,0.12)" : "bgCard"}
                    borderColor={i === lineIdx ? "gold" : "blackAlpha.200"}
                    _hover={{ borderColor: "goldDark" }}
                  >
                    <Text fontSize="sm" fontWeight="700" color={i === lineIdx ? "gold" : "textPrimary"}>
                      {i === 0 ? "★ " : ""}{l.name}
                    </Text>
                    <Text fontSize="2xs" color="textSecondary" lineHeight="1.4" mt={0.5}>{l.blurb}</Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          <Box p={4} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="blackAlpha.200" minH="96px">
            {ply === 0 ? (
              <Text fontSize="sm" color="textSecondary" lineHeight="1.6">
                Press <Box as="span" color="gold" fontWeight="700">▶ Play</Box> to walk through it, or step with the arrows. Each move is explained as you go.
              </Text>
            ) : (
              <>
                <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="md" color="gold" mb={1}>
                  {cur ? `${cur.no}${cur.isWhiteMove ? "." : "…"} ${sans[ply - 1]}` : sans[ply - 1]}
                </Text>
                <Text fontSize="sm" color="textPrimary" lineHeight="1.6">
                  {currentNote ?? "A natural move in this line."}
                </Text>
              </>
            )}
          </Box>

          <Box>
            <Text fontSize="2xs" color="textMuted" letterSpacing="0.12em" textTransform="uppercase" mb={2}>Moves</Text>
            <Wrap gap={1}>
              {sans.map((san, i) => {
                const { no, isWhiteMove } = moveLabel(i);
                const active = i === ply - 1;
                return (
                  <WrapItem key={i}>
                    <HStack gap={1}>
                      {isWhiteMove && (
                        <Text fontSize="2xs" color="textMuted" fontFamily="var(--font-inter), sans-serif">{no}.</Text>
                      )}
                      <Box
                        as="button"
                        onClick={() => { setAuto(false); setPly(i + 1); }}
                        px={1.5} py={0.5} borderRadius="sm" cursor="pointer"
                        fontSize="sm" fontFamily="var(--font-inter), sans-serif"
                        fontWeight={active ? "700" : "500"}
                        bg={active ? "gold" : "transparent"}
                        color={active ? "white" : "textPrimary"}
                        _hover={active ? {} : { bg: "blackAlpha.100" }}
                      >
                        {san}
                      </Box>
                    </HStack>
                  </WrapItem>
                );
              })}
            </Wrap>
          </Box>
        </VStack>
      </Box>
    </VStack>
  );
}
