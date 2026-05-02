"use client";

import { Box, Heading, Text, VStack, HStack, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { StreakCounter } from "@/components/dashboard";
import { defaultViewport, staggerContainer, staggerChild } from "@/lib/animations";

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

function DifficultyBars({ difficulty }: { difficulty: number }) {
  const level = Math.min(3, Math.max(1, Math.ceil(difficulty / 400)));
  return (
    <HStack gap={1}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          w="6px"
          h="10px"
          borderRadius="2px"
          bg={i <= level ? "gold" : "goldDark"}
          opacity={i <= level ? 1 : 0.4}
        />
      ))}
    </HStack>
  );
}

function PuzzleCard({
  href,
  title,
  difficulty,
  theme,
  leftAccent = true,
}: {
  href: string;
  title: string;
  difficulty: number;
  theme?: string[];
  leftAccent?: boolean;
}) {
  return (
    <Link href={href}>
      <Box
        display="flex"
        alignItems="center"
        gap={4}
        py={3}
        px={4}
        borderRadius="soft"
        bg="bgCard"
        borderWidth="1px"
        borderColor="goldDark"
        _hover={{ borderColor: "gold", boxShadow: "0 0 16px rgba(198, 167, 94, 0.06)" }}
        transition="all 0.2s"
        borderLeftWidth={leftAccent ? "3px" : undefined}
        borderLeftColor={leftAccent ? "gold" : undefined}
      >
        <DifficultyBars difficulty={difficulty} />
        <VStack align="flex-start" gap={0} flex={1} minW={0}>
          <Text color="gold" fontWeight="600" fontSize="sm">
            {title}
          </Text>
          {theme?.length ? (
            <Text color="textMuted" fontSize="xs" lineClamp={1}>
              {theme.join(", ")}
            </Text>
          ) : null}
        </VStack>
      </Box>
    </Link>
  );
}

export default function LearningPage() {
  const { user } = useAuth();
  const { data: dailyData } = useQuery<{ dailyPuzzle: { id: string; difficulty: number; theme: string[] } | null }>(DAILY_PUZZLE);
  const { data: puzzlesData } = useQuery<{ puzzles: Array<{ id: string; difficulty: number; theme: string[] }> }>(PUZZLES);

  const dailyPuzzle = dailyData?.dailyPuzzle;
  const puzzles = puzzlesData?.puzzles ?? [];
  const streak = user?.profile?.puzzleStreakCount ?? 0;

  return (
    <VStack align="stretch" gap={10}>
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Heading
          size="xl"
          color="gold"
          fontFamily="var(--font-playfair), Georgia, serif"
        >
          Strategy Hall
        </Heading>
        <StreakCounter count={streak} size="md" />
      </HStack>
      <Text color="textMuted" fontSize="sm">
        Solve puzzles to earn XP and build your streak.
      </Text>

      {/* Tactical Puzzles */}
      <Box>
        <Heading size="md" color="gold" mb={4}>
          Tactical Puzzles
        </Heading>
        <VStack align="stretch" gap={3}>
          {dailyPuzzle && (
            <PuzzleCard
              href={`/learning/puzzle/${dailyPuzzle.id}`}
              title="Daily puzzle"
              difficulty={dailyPuzzle.difficulty}
              theme={dailyPuzzle.theme}
            />
          )}
          {puzzles.slice(0, 20).map((p) => (
            <PuzzleCard
              key={p.id}
              href={`/learning/puzzle/${p.id}`}
              title={`Puzzle #${p.id.slice(-4)}`}
              difficulty={p.difficulty}
              theme={p.theme}
            />
          ))}
          {!dailyPuzzle && puzzles.length === 0 && (
            <Text color="textMuted">No puzzles available.</Text>
          )}
        </VStack>
      </Box>

      {/* Opening Mastery */}
      <Box>
        <Heading size="md" color="gold" mb={4}>
          Opening Mastery
        </Heading>
        <Text color="textMuted" fontSize="sm" mb={4} maxW="2xl">
          Drill principle-driven openings against the engine. Every line you click opens a starting position you can play
          out at any strength.
        </Text>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={defaultViewport}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
            {OPENINGS.map((o) => (
              <motion.div key={o.title} variants={staggerChild}>
                <Link href={o.href}>
                  <Box
                    p={4}
                    bg="bgCard"
                    borderRadius="soft"
                    borderWidth="1px"
                    borderColor="whiteAlpha.080"
                    h="full"
                    transition="border-color 0.2s, transform 0.2s"
                    _hover={{ borderColor: "gold", transform: "translateY(-1px)" }}
                  >
                    <HStack justify="space-between">
                      <Text color="gold" fontWeight="700" fontSize="sm">
                        {o.title}
                      </Text>
                      <Text fontSize="xs" color="textMuted">
                        {o.color}
                      </Text>
                    </HStack>
                    <Text color="textSecondary" fontSize="sm" mt={1.5} lineHeight="1.55">
                      {o.summary}
                    </Text>
                    <Text color="textMuted" fontSize="xs" mt={2}>
                      Hallmark: {o.idea}
                    </Text>
                  </Box>
                </Link>
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </Box>

      {/* Endgame Theory */}
      <Box>
        <Heading size="md" color="gold" mb={4}>
          Endgame Theory
        </Heading>
        <Text color="textMuted" fontSize="sm" mb={4} maxW="2xl">
          Each module sets a critical position. Win it against the engine, then learn the technique.
        </Text>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={defaultViewport}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
            {ENDGAMES.map((e) => (
              <motion.div key={e.title} variants={staggerChild}>
                <Link href={e.href}>
                  <Box
                    p={4}
                    bg="bgCard"
                    borderRadius="soft"
                    borderWidth="1px"
                    borderColor="whiteAlpha.080"
                    h="full"
                    transition="border-color 0.2s, transform 0.2s"
                    _hover={{ borderColor: "gold", transform: "translateY(-1px)" }}
                  >
                    <HStack justify="space-between">
                      <Text color="gold" fontWeight="700" fontSize="sm">
                        {e.title}
                      </Text>
                      <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wider">
                        {e.tier}
                      </Text>
                    </HStack>
                    <Text color="textSecondary" fontSize="sm" mt={1.5} lineHeight="1.55">
                      {e.summary}
                    </Text>
                  </Box>
                </Link>
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </Box>
    </VStack>
  );
}

const OPENINGS = [
  {
    title: "Italian Game",
    color: "White",
    summary: "1.e4 e5 2.Nf3 Nc6 3.Bc4 — fast development, classical centre, attack the f7 square.",
    idea: "Bishop on c4, knight to g5, mating ideas.",
    href: "/play/bot?elo=1600&fen=" + encodeURIComponent("r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3"),
  },
  {
    title: "London System",
    color: "White",
    summary: "1.d4 d5 2.Nf3 Nf6 3.Bf4 — solid, repeatable, low-theory weapon.",
    idea: "Pyramid pawns, bishop active outside the chain.",
    href: "/play/bot?elo=1400&fen=" + encodeURIComponent("rnbqkb1r/pppppppp/5n2/3P4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3"),
  },
  {
    title: "Sicilian Defence",
    color: "Black",
    summary: "1.e4 c5 — fight for the centre asymmetrically. Sharpest reply to 1.e4.",
    idea: "Counter-attack on the queenside.",
    href: "/play/bot?elo=1800&fen=" + encodeURIComponent("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"),
  },
  {
    title: "Caro-Kann",
    color: "Black",
    summary: "1.e4 c6 — solid, principled defence with a pawn-chain-friendly structure.",
    idea: "Light-square dominance, slow positional grind.",
    href: "/play/bot?elo=1600&fen=" + encodeURIComponent("rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"),
  },
  {
    title: "Queen's Gambit",
    color: "White",
    summary: "1.d4 d5 2.c4 — fight for d5 with a temporary pawn sacrifice.",
    idea: "Open the c-file, push the centre.",
    href: "/play/bot?elo=1700&fen=" + encodeURIComponent("rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2"),
  },
  {
    title: "King's Indian Defence",
    color: "Black",
    summary: "1.d4 Nf6 2.c4 g6 — give white the centre, then break it down with …e5 or …c5.",
    idea: "Kingside attack with …f5 and the knight to f4.",
    href: "/play/bot?elo=1900&fen=" + encodeURIComponent("rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3"),
  },
];

const ENDGAMES = [
  {
    title: "K + P vs K (Opposition)",
    tier: "E",
    summary: "Reach the key squares ahead of your pawn — black to move loses.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/4k3/8/4K3/4P3/8 w - - 0 1"),
  },
  {
    title: "Lucena Position",
    tier: "C",
    summary: "Build a bridge with the rook to push the king out and queen the pawn.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1"),
  },
  {
    title: "Philidor Position (Defence)",
    tier: "C",
    summary: "Hold the third rank as black, then check from behind. The classical drawing technique.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("3k4/8/3K4/3P4/8/8/r7/4R3 w - - 0 1"),
  },
  {
    title: "Rook + Pawn (a-pawn)",
    tier: "B",
    summary: "Cut off the defending king on the b-file and bring the rook behind the passer.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/8/k7/P7/K7/R7 w - - 0 1"),
  },
  {
    title: "Bishop + Knight Mate",
    tier: "B",
    summary: "Drive the king to the corner of the bishop's colour. The hardest basic mate.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/8/8/2k5/8/4K1NB w - - 0 1"),
  },
  {
    title: "Queen vs Rook",
    tier: "A",
    summary: "Force zugzwang — the rook can't stay near the king and defend at once.",
    href: "/play/bot?elo=2200&fen=" + encodeURIComponent("8/8/8/8/8/3k4/4r3/3K3Q w - - 0 1"),
  },
];
