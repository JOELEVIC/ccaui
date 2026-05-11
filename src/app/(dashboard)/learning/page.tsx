"use client";

import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "@/lib/auth";
import { StreakCounter } from "@/components/dashboard";
import { defaultViewport, staggerContainer, staggerChild } from "@/lib/animations";
import { CourseCard } from "@/components/system/CourseCard";
import {
  SystemLabel,
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
  const { user } = useAuth();
  const { data: dailyData } = useQuery<{ dailyPuzzle: { id: string; difficulty: number; theme: string[] } | null }>(DAILY_PUZZLE);
  const { data: puzzlesData } = useQuery<{ puzzles: Array<{ id: string; difficulty: number; theme: string[] }> }>(PUZZLES);

  const dailyPuzzle = dailyData?.dailyPuzzle;
  const puzzles = puzzlesData?.puzzles ?? [];
  const streak = user?.profile?.puzzleStreakCount ?? 0;

  return (
    <Box position="relative" minH="100vh" bg="sys.void" mx={{ base: -3, md: -6 }} px={{ base: 3, md: 6 }} pt={{ base: 2, md: 4 }} pb={10}>
      <style dangerouslySetInnerHTML={{ __html: SYSTEM_KEYFRAMES }} />
      <Backdrop />

      <VStack align="stretch" gap={{ base: 8, md: 10 }} position="relative" zIndex={1} maxW="1180px" mx="auto">
        {/* Header */}
        <HStack justify="space-between" align="flex-end" flexWrap="wrap" gap={4}>
          <Box>
            <SystemLabel accent="cyan">[ The Curriculum ]</SystemLabel>
            <Text
              fontFamily="var(--font-playfair), Georgia, serif"
              fontSize={{ base: "3xl", md: "5xl" }}
              color="textPrimary"
              fontWeight="700"
              lineHeight="1.0"
              mt={1}
              letterSpacing="-0.01em"
            >
              Strategy Hall
            </Text>
            <Text mt={2} fontSize="sm" color="textSecondary" maxW="2xl">
              Three halls. Hundreds of gates. Every drill cleared puts XP on the spine of your
              Road to Master and sharpens an attribute on your radar.
            </Text>
          </Box>
          <StreakCounter count={streak} size="md" />
        </HStack>

        {/* Daily Gate */}
        {dailyPuzzle && (
          <Section title="Daily Gate" tag="DAILY DIRECTIVE" accent="cyan" subtitle="Refreshes at 00:00 UTC.">
            <CourseCard
              variant="feature"
              accent="cyan"
              href={`/learning/puzzle/${dailyPuzzle.id}`}
              tag={`Difficulty · ${dailyPuzzle.difficulty}`}
              title={`Today's puzzle — find the only move`}
              subtitle={dailyPuzzle.theme?.length ? dailyPuzzle.theme.join(" · ") : "Tactical · One solution"}
              description="A single critical position. Solve it cleanly to extend your streak; miss it and the streak resets."
              glyph="◆"
            />
          </Section>
        )}

        {/* Tactical Trials */}
        <Section title="Tactical Trials" tag="HALL OF SHARP MOVES" accent="cyan" subtitle="Puzzles auto-graded by difficulty. Clear streaks to earn XP multipliers.">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <VStack align="stretch" gap={3}>
              {puzzles.slice(0, 20).map((p, i) => (
                <motion.div key={p.id} variants={staggerChild}>
                  <CourseCard
                    href={`/learning/puzzle/${p.id}`}
                    variant="module"
                    accent={i % 5 === 0 ? "threat" : "cyan"}
                    tag={`Trial · #${p.id.slice(-4)}`}
                    title={p.theme?.length ? toTitle(p.theme[0] ?? "Tactical motif") : "Tactical motif"}
                    description={
                      p.theme?.length
                        ? `Themes: ${p.theme.map(toTitle).join(", ")}.`
                        : "A standalone tactical position. Find the only move."
                    }
                    meta={`Elo ${p.difficulty}`}
                    difficulty={Math.min(3, Math.max(1, Math.ceil((p.difficulty ?? 1000) / 600)))}
                    glyph={i % 5 === 0 ? "✦" : "◇"}
                  />
                </motion.div>
              ))}
              {puzzles.length === 0 && !dailyPuzzle && (
                <Box
                  p={5}
                  bg="rgba(10,11,14,0.55)"
                  borderWidth="1px"
                  borderColor="rgba(255,255,255,0.1)"
                  className="sys-clip-panel"
                >
                  <Text color="textMuted">No puzzles available right now.</Text>
                </Box>
              )}
            </VStack>
          </motion.div>
        </Section>

        {/* Opening Archives */}
        <Section title="Opening Archives" tag="HALL OF FIRST MOVES" accent="purple" subtitle="Each archive is a starting position — spar the engine to learn the typical middlegame.">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
              {OPENINGS.map((o) => (
                <motion.div key={o.title} variants={staggerChild}>
                  <CourseCard
                    href={o.href}
                    variant="tile"
                    accent="purple"
                    tag={`Archive · ${o.color}`}
                    title={o.title}
                    description={o.summary}
                    meta={o.idea}
                    glyph={o.glyph}
                  />
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        </Section>

        {/* Endgame Conservatory */}
        <Section title="Endgame Conservatory" tag="HALL OF FINAL MOVES" accent="gold" subtitle="Hold the position. Convert it. The engine plays the defence at master level.">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
              {ENDGAMES.map((e) => (
                <motion.div key={e.title} variants={staggerChild}>
                  <CourseCard
                    href={e.href}
                    variant="tile"
                    accent="gold"
                    tag={`Endgame · ${e.tier}-Rank`}
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
  tag,
  subtitle,
  accent,
  children,
}: {
  title: string;
  tag: string;
  subtitle?: string;
  accent: GlowAccent;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <HStack mb={4} align="flex-end" gap={3} flexWrap="wrap">
        <Box>
          <SystemLabel accent={accent}>[ {tag} ]</SystemLabel>
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize={{ base: "xl", md: "2xl" }}
            color="textPrimary"
            fontWeight="700"
            mt={0.5}
          >
            {title}
          </Text>
          {subtitle && (
            <Text fontSize="sm" color="textMuted" mt={1} maxW="2xl">
              {subtitle}
            </Text>
          )}
        </Box>
        {/* Glowing separator line */}
        <Box
          flex={1}
          h="1px"
          minW="80px"
          mb={1.5}
          style={{
            background:
              accent === "cyan"
                ? "linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.4) 50%, transparent 100%)"
                : accent === "purple"
                  ? "linear-gradient(90deg, transparent 0%, rgba(138,43,226,0.4) 50%, transparent 100%)"
                  : accent === "gold"
                    ? "linear-gradient(90deg, transparent 0%, rgba(245,194,68,0.4) 50%, transparent 100%)"
                    : "linear-gradient(90deg, transparent 0%, rgba(240,101,149,0.4) 50%, transparent 100%)",
          }}
        />
      </HStack>
      {children}
    </Box>
  );
}

function Backdrop() {
  return (
    <>
      <Box
        position="absolute"
        inset={0}
        background="radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.07) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(138,43,226,0.10) 0%, transparent 50%)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        inset={0}
        opacity={0.04}
        backgroundImage="linear-gradient(rgba(0,240,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.6) 1px, transparent 1px)"
        backgroundSize="64px 64px"
        pointerEvents="none"
      />
    </>
  );
}

function toTitle(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─────────── Static content ─────────── */

const OPENINGS = [
  {
    title: "Italian Game",
    color: "White",
    glyph: "♔",
    summary: "1.e4 e5 2.Nf3 Nc6 3.Bc4 — fast development, classical centre, attack the f7 square.",
    idea: "Bishop on c4, knight to g5, mating ideas.",
    href: "/play/bot?elo=1600&fen=" + encodeURIComponent("r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3"),
  },
  {
    title: "London System",
    color: "White",
    glyph: "♗",
    summary: "1.d4 d5 2.Nf3 Nf6 3.Bf4 — solid, repeatable, low-theory weapon.",
    idea: "Pyramid pawns, bishop active outside the chain.",
    href: "/play/bot?elo=1400&fen=" + encodeURIComponent("rnbqkb1r/pppppppp/5n2/3P4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3"),
  },
  {
    title: "Sicilian Defence",
    color: "Black",
    glyph: "♛",
    summary: "1.e4 c5 — fight for the centre asymmetrically. Sharpest reply to 1.e4.",
    idea: "Counter-attack on the queenside.",
    href: "/play/bot?elo=1800&fen=" + encodeURIComponent("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"),
  },
  {
    title: "Caro-Kann",
    color: "Black",
    glyph: "♚",
    summary: "1.e4 c6 — solid, principled defence with a pawn-chain-friendly structure.",
    idea: "Light-square dominance, slow positional grind.",
    href: "/play/bot?elo=1600&fen=" + encodeURIComponent("rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"),
  },
  {
    title: "Queen's Gambit",
    color: "White",
    glyph: "♕",
    summary: "1.d4 d5 2.c4 — fight for d5 with a temporary pawn sacrifice.",
    idea: "Open the c-file, push the centre.",
    href: "/play/bot?elo=1700&fen=" + encodeURIComponent("rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2"),
  },
  {
    title: "King's Indian Defence",
    color: "Black",
    glyph: "♞",
    summary: "1.d4 Nf6 2.c4 g6 — give white the centre, then break it down with …e5 or …c5.",
    idea: "Kingside attack with …f5 and the knight to f4.",
    href: "/play/bot?elo=1900&fen=" + encodeURIComponent("rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3"),
  },
];

const ENDGAMES = [
  {
    title: "K + P vs K (Opposition)",
    tier: "E",
    glyph: "♔",
    summary: "Reach the key squares ahead of your pawn — black to move loses.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/4k3/8/4K3/4P3/8 w - - 0 1"),
  },
  {
    title: "Lucena Position",
    tier: "C",
    glyph: "♖",
    summary: "Build a bridge with the rook to push the king out and queen the pawn.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1"),
  },
  {
    title: "Philidor Position (Defence)",
    tier: "C",
    glyph: "♜",
    summary: "Hold the third rank as black, then check from behind. The classical drawing technique.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("3k4/8/3K4/3P4/8/8/r7/4R3 w - - 0 1"),
  },
  {
    title: "Rook + Pawn (a-pawn)",
    tier: "B",
    glyph: "♖",
    summary: "Cut off the defending king on the b-file and bring the rook behind the passer.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/8/k7/P7/K7/R7 w - - 0 1"),
  },
  {
    title: "Bishop + Knight Mate",
    tier: "B",
    glyph: "♘",
    summary: "Drive the king to the corner of the bishop's colour. The hardest basic mate.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/8/8/2k5/8/4K1NB w - - 0 1"),
  },
  {
    title: "Queen vs Rook",
    tier: "A",
    glyph: "♕",
    summary: "Force zugzwang — the rook can't stay near the king and defend at once.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/8/8/3k4/4r3/3K3Q w - - 0 1"),
  },
];
