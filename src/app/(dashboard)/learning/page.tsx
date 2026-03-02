"use client";

import { Box, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "@/lib/auth";
import { StreakCounter } from "@/components/dashboard";

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

      {/* Opening Mastery - placeholder */}
      <Box>
        <Heading size="md" color="gold" mb={4}>
          Opening Mastery
        </Heading>
        <Box
          py={6}
          px={4}
          borderRadius="soft"
          bg="bgCard"
          borderWidth="1px"
          borderColor="goldDark"
          borderLeftWidth="3px"
          borderLeftColor="gold"
        >
          <Text color="textMuted" fontSize="sm">
            Structured opening training coming soon.
          </Text>
        </Box>
      </Box>

      {/* Endgame Theory - placeholder */}
      <Box>
        <Heading size="md" color="gold" mb={4}>
          Endgame Theory
        </Heading>
        <Box
          py={6}
          px={4}
          borderRadius="soft"
          bg="bgCard"
          borderWidth="1px"
          borderColor="goldDark"
          borderLeftWidth="3px"
          borderLeftColor="gold"
        >
          <Text color="textMuted" fontSize="sm">
            Endgame modules coming soon.
          </Text>
        </Box>
      </Box>
    </VStack>
  );
}
