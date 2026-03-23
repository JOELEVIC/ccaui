"use client";

import type { ReactNode } from "react";
import { Box, Heading, Text, VStack, SimpleGrid, HStack, Button } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { PUZZLE_DASHBOARD } from "@/graphql/queries/chessPro";

const DAILY = gql`
  query PuzzlesDaily {
    dailyPuzzle {
      id
      difficulty
    }
  }
`;

type PuzzleDash = {
  puzzleDashboard: {
    periodDays: number;
    solvedCount: number;
    performanceRating: number;
    successRate: number;
    radar: {
      sacrifice: number;
      endgame: number;
      positional: number;
      matingAttack: number;
      tactics: number;
      opening: number;
    };
  } | null;
};

export default function PuzzlesDashboardPage() {
  const { data, loading } = useQuery<PuzzleDash>(PUZZLE_DASHBOARD);
  const { data: daily } = useQuery<{ dailyPuzzle: { id: string; difficulty: number } | null }>(DAILY);
  const dash = data?.puzzleDashboard;
  const radar = dash?.radar;

  const chartData = radar
    ? [
        { s: "Sacrifice", v: radar.sacrifice },
        { s: "Endgame", v: radar.endgame },
        { s: "Positional", v: radar.positional },
        { s: "Mating", v: radar.matingAttack },
        { s: "Tactics", v: radar.tactics },
        { s: "Opening", v: radar.opening },
      ]
    : [];

  return (
    <VStack align="stretch" gap={8}>
      <FlexRow>
        <Heading fontFamily="var(--font-playfair), Georgia, serif" size="xl" color="textPrimary">
          Puzzle dashboard
        </Heading>
        <Text color="textMuted" fontSize="sm">
          Last {dash?.periodDays ?? 30} days
        </Text>
      </FlexRow>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <StatCard label="Solved" value={dash ? String(dash.solvedCount) : "—"} accent="gold" />
        <StatCard label="Performance" value={dash ? String(dash.performanceRating) : "—"} accent="gold" />
        <StatCard
          label="Success rate"
          value={dash ? `${Math.round(dash.successRate * 100)}%` : "—"}
          accent="green"
          bar={dash ? dash.successRate : 0}
        />
      </SimpleGrid>

      {loading && <Text color="textMuted">Loading…</Text>}

      {!loading && !dash && (
        <Text color="textMuted">Solve puzzles to build your dashboard. Stats appear here once recorded.</Text>
      )}

      {dash && (
        <Box bg="bgCard" borderRadius="soft" p={4} borderWidth="1px" borderColor="whiteAlpha.100" h="380px">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="#ffffff22" />
              <PolarAngleAxis dataKey="s" tick={{ fill: "#a8b0c4", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6b728e", fontSize: 10 }} />
              <Radar name="Skills" dataKey="v" stroke="#e6a452" fill="#e6a452" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      )}

      {daily?.dailyPuzzle?.id && (
        <Link href={`/learning/puzzle/${daily.dailyPuzzle.id}`}>
          <Button bg="gold" color="bgDark" borderRadius="soft" size="lg" w={{ base: "full", md: "auto" }}>
            Train today&apos;s puzzle →
          </Button>
        </Link>
      )}
    </VStack>
  );
}

function FlexRow({ children }: { children: ReactNode }) {
  return (
    <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
      {children}
    </HStack>
  );
}

function StatCard({
  label,
  value,
  accent,
  bar,
}: {
  label: string;
  value: string;
  accent: "gold" | "green";
  bar?: number;
}) {
  return (
    <Box
      p={5}
      borderRadius="soft"
      bg="bgCard"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
    >
      <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="800" color={accent === "gold" ? "gold" : "accentGreen"} mt={2}>
        {value}
      </Text>
      {bar != null && (
        <Box mt={3} h="8px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
          <Box h="full" w={`${Math.min(100, bar * 100)}%`} bg="accentGreen" borderRadius="full" transition="width 0.3s" />
        </Box>
      )}
    </Box>
  );
}
