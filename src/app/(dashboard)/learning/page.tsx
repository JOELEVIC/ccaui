"use client";

import { useEffect, useRef, useState } from "react";
import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { staggerContainer, staggerChild } from "@/lib/animations";
import { CourseCard } from "@/components/system/CourseCard";
import { OPENINGS as OPENING_LIBRARY } from "@/lib/learn/openings";
import { ENDGAME_TECHNIQUES as ENDGAME_LIBRARY } from "@/lib/learn/endgames";
import {
  SYSTEM_KEYFRAMES,
  type GlowAccent,
} from "@/components/system/SystemPrimitives";

/**
 * The Curriculum — System-themed catalogue for /learning.
 *
 * Three "halls" map to the chess curriculum:
 *   • Tactical Trials      (puzzles, cyan)
 *   • Opening Archives     (named openings, purple)
 *   • Endgame Conservatory (key positions, gold)
 *
 * Above them sits the Daily Gate — a featured card for the daily puzzle.
 * Every card is a CourseCard so the click target is obvious (chamfered
 * panel + glow + ENTER pill on the right).
 */

const DAILY_PUZZLE = gql`
  query LearningDailyPuzzle {
    dailyPuzzle {
      id
      fen
      difficulty
      theme
    }
  }
`;

const PUZZLES = gql`
  query LearningPuzzles($difficulty: Int) {
    puzzles(difficulty: $difficulty) {
      id
      fen
      difficulty
      theme
    }
  }
`;

export default function LearningPage() {
  const { data: dailyData } = useQuery<{ dailyPuzzle: { id: string; difficulty: number; theme: string[] } | null }>(DAILY_PUZZLE);
  const { data: puzzlesData } = useQuery<{ puzzles: Array<{ id: string; difficulty: number; theme: string[] }> }>(PUZZLES);

  const dailyPuzzle = dailyData?.dailyPuzzle;
  const puzzles = puzzlesData?.puzzles ?? [];

  return (
    <Box position="relative" minH="100vh" bg="sys.void" mx={{ base: -3, md: -6 }} px={{ base: 3, md: 6 }} pt={{ base: 2, md: 4 }} pb={10}>
      <style dangerouslySetInnerHTML={{ __html: SYSTEM_KEYFRAMES }} />
      <Backdrop />

      <VStack align="stretch" gap={{ base: 8, md: 10 }} position="relative" zIndex={1} maxW="1180px" mx="auto">
        {/* Header */}
        <HStack justify="space-between" align="flex-end" flexWrap="wrap" gap={4}>
          <Box>
            <Text
              fontFamily="var(--font-playfair), Georgia, serif"
              fontSize={{ base: "3xl", md: "5xl" }}
              color="textPrimary"
              fontWeight="700"
              lineHeight="1.0"
              letterSpacing="-0.01em"
            >
              Learn
            </Text>
          </Box>
        </HStack>

        {/* Daily puzzle */}
        {dailyPuzzle && (
          <Section title="Today's puzzle" accent="cyan">
            <CourseCard
              variant="feature"
              accent="cyan"
              href={`/learning/puzzle/${dailyPuzzle.id}`}
              tag={`Elo · ${dailyPuzzle.difficulty}`}
              title="Today's puzzle"
              subtitle={dailyPuzzle.theme?.length ? dailyPuzzle.theme.join(" · ") : ""}
              glyph="◆"
            />
          </Section>
        )}

        {/* Puzzles — fixed-height scroll, fade top/bottom, ~3 visible */}
        <Section title="Puzzles" accent="cyan">
          {puzzles.length === 0 ? (
            <Box p={5} bg="bgCard" borderWidth="1px" borderColor="blackAlpha.200" borderRadius="soft">
              <Text color="textMuted">No puzzles available right now.</Text>
            </Box>
          ) : (
            <PuzzleScroller puzzles={puzzles.slice(0, 20)} />
          )}
        </Section>

        {/* Openings */}
        <Section title="Openings" accent="purple">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
              {OPENING_LIBRARY.map((o) => (
                <motion.div key={o.slug} variants={staggerChild}>
                  <CourseCard
                    href={`/learning/opening/${o.slug}`}
                    variant="tile"
                    accent="purple"
                    tag={o.color}
                    title={o.name}
                    description={o.summary}
                    glyph={o.glyph}
                  />
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        </Section>

        {/* Checkmate techniques — guided, interactive walkthroughs */}
        <Section title="Checkmate techniques" accent="gold">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
              {ENDGAME_LIBRARY.map((e) => (
                <motion.div key={e.slug} variants={staggerChild}>
                  <CourseCard
                    href={`/learning/endgame/${e.slug}`}
                    variant="tile"
                    accent="gold"
                    tag={e.result}
                    title={e.name}
                    description={e.summary}
                    glyph={e.glyph}
                  />
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        </Section>

        {/* Endgames — practise the classic positions against the engine */}
        <Section title="Endgames" accent="gold">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
              {ENDGAMES.map((e) => (
                <motion.div key={e.title} variants={staggerChild}>
                  <CourseCard
                    href={e.href}
                    variant="tile"
                    accent="gold"
                    tag="Practise"
                    title={e.title}
                    description={e.summary}
                    glyph={e.glyph}
                  />
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        </Section>
      </VStack>
    </Box>
  );
}

/* ─────────── Section header ─────────── */

function Section({
  title,
  children,
}: {
  title: string;
  accent?: GlowAccent;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <HStack mb={4} align="center" gap={3}>
        <Text
          fontFamily="var(--font-playfair), Georgia, serif"
          fontSize={{ base: "xl", md: "2xl" }}
          color="textPrimary"
          fontWeight="700"
          letterSpacing="0.02em"
        >
          {title}
        </Text>
        <Box
          flex={1}
          h="1px"
          minW="80px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(197,160,89,0.35) 50%, transparent 100%)",
          }}
        />
      </HStack>
      {children}
    </Box>
  );
}

function Backdrop() {
  return (
    <Box
      position="absolute"
      inset={0}
      background="radial-gradient(ellipse at 50% 0%, rgba(197,160,89,0.06) 0%, transparent 55%)"
      pointerEvents="none"
    />
  );
}

function toTitle(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─────────── PuzzleScroller (fixed-height, fade, center-zoom) ─────────── */

const PUZZLE_CARD_PX = 92; // approximate row height incl. gap
const VISIBLE_CARDS = 3;

function PuzzleScroller({
  puzzles,
}: {
  puzzles: Array<{ id: string; difficulty: number; theme: string[] }>;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [centerKey, setCenterKey] = useState<string | null>(puzzles[0]?.id ?? null);

  // Recompute which card is the visual centre as the user scrolls.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      const containerRect = el.getBoundingClientRect();
      const mid = containerRect.top + containerRect.height / 2;
      let closestKey: string | null = null;
      let closestDist = Infinity;
      el.querySelectorAll<HTMLDivElement>("[data-puzzle-id]").forEach((child) => {
        const r = child.getBoundingClientRect();
        const c = r.top + r.height / 2;
        const d = Math.abs(c - mid);
        if (d < closestDist) {
          closestDist = d;
          closestKey = child.dataset.puzzleId ?? null;
        }
      });
      if (closestKey) setCenterKey(closestKey);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, [puzzles]);

  return (
    <Box
      position="relative"
      h={`${PUZZLE_CARD_PX * VISIBLE_CARDS}px`}
      overflow="hidden"
      style={{
        // Soft fade at top + bottom of the scroller — the center reads stronger.
        maskImage:
          "linear-gradient(180deg, transparent 0%, black 14%, black 86%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(180deg, transparent 0%, black 14%, black 86%, transparent 100%)",
      }}
    >
      <Box
        ref={scrollerRef}
        h="full"
        overflowY="auto"
        px={1}
        py={`${PUZZLE_CARD_PX}px`}
        style={{ scrollSnapType: "y proximity" }}
      >
        <VStack align="stretch" gap={3}>
          {puzzles.map((p, i) => {
            const isCenter = centerKey === p.id;
            return (
              <Box
                key={p.id}
                data-puzzle-id={p.id}
                style={{
                  scrollSnapAlign: "center",
                  transform: isCenter ? "scale(1.02)" : "scale(0.96)",
                  opacity: isCenter ? 1 : 0.65,
                  transition: "transform 0.25s ease, opacity 0.25s ease",
                }}
              >
                <CourseCard
                  href={`/learning/puzzle/${p.id}`}
                  variant="module"
                  accent={i % 5 === 0 ? "threat" : "cyan"}
                  tag={`#${p.id.slice(-4)}`}
                  title={p.theme?.length ? toTitle(p.theme[0] ?? "Tactical motif") : "Tactical motif"}
                  description={
                    p.theme?.length
                      ? p.theme.slice(0, 3).map(toTitle).join(" · ")
                      : "Find the only move."
                  }
                  meta={`Elo ${p.difficulty}`}
                  difficulty={Math.min(3, Math.max(1, Math.ceil((p.difficulty ?? 1000) / 600)))}
                  glyph={i % 5 === 0 ? "✦" : "◇"}
                />
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}

/* ─────────── Static content ─────────── */

const ENDGAMES = [
  {
    title: "K + P vs K (Opposition)",
    tier: "E",
    glyph: "♔",
    summary: "Reach the key squares ahead of the pawn.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/4k3/8/4K3/4P3/8 w - - 0 1"),
  },
  {
    title: "Lucena Position",
    tier: "C",
    glyph: "♖",
    summary: "Build the bridge. Queen the pawn.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1"),
  },
  {
    title: "Philidor Position (Defence)",
    tier: "C",
    glyph: "♜",
    summary: "Hold the third rank, check from behind.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("3k4/8/3K4/3P4/8/8/r7/4R3 w - - 0 1"),
  },
  {
    title: "Rook + Pawn (a-pawn)",
    tier: "B",
    glyph: "♖",
    summary: "Cut off the king. Rook behind the passer.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/8/k7/P7/K7/R7 w - - 0 1"),
  },
  {
    title: "Bishop + Knight Mate",
    tier: "B",
    glyph: "♘",
    summary: "Drive the king to the bishop's corner.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/8/8/2k5/8/4K1NB w - - 0 1"),
  },
  {
    title: "Queen vs Rook",
    tier: "A",
    glyph: "♕",
    summary: "Force zugzwang. Win the rook.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/8/8/3k4/4r3/3K3Q w - - 0 1"),
  },
];
