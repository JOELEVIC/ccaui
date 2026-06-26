"use client";

import { useState } from "react";
import { Box, Button, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "@/lib/auth";
import { toaster } from "@/lib/toaster";
import { JOIN_TOURNAMENT } from "@/graphql/mutations/tournaments";
import { PLAYERS_LEADERBOARD, ME_TOURNAMENT_STATS } from "@/graphql/queries/chessPro";
import { TournamentGrid, type TournamentItem } from "@/components/tournaments/TournamentGrid";

const TOURNAMENTS = gql`
  query DashboardTournaments($status: TournamentStatus) {
    tournaments(status: $status) {
      id
      name
      status
      format
      startDate
      endDate
      school {
        id
        name
        region
      }
      participants {
        id
        score
        user {
          id
          username
          rating
        }
      }
    }
  }
`;

type TabKey = "ongoing" | "upcoming" | "completed";
const TABS: { key: TabKey; label: string }[] = [
  { key: "ongoing", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

type LeaderboardRow = {
  rank: number;
  rating: number;
  user: { username: string; profile?: { chessTitle?: string | null; avatarUrl?: string | null } };
};

export default function DashboardTournamentsPage() {
  const { user } = useAuth();
  // Default to Upcoming — Live is usually empty, so leading with it looked dead.
  const [tab, setTab] = useState<TabKey>("upcoming");

  const { data: upcoming, refetch: refetchUpcoming } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, {
    variables: { status: "UPCOMING" },
  });
  const { data: ongoing } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, { variables: { status: "ONGOING" } });
  const { data: completed } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, { variables: { status: "COMPLETED" } });

  const { data: lbData } = useQuery<{ playersLeaderboard: LeaderboardRow[] }>(PLAYERS_LEADERBOARD, {
    variables: { limit: 10 },
  });
  const { data: statsData } = useQuery<{
    meTournamentStats: { totalJoined: number; breakdown: { variant: string; count: number }[] };
  }>(ME_TOURNAMENT_STATS);

  const [joinTournament, { loading: joining }] = useMutation<{ joinTournament: { id: string } }>(JOIN_TOURNAMENT);

  const lists: Record<TabKey, TournamentItem[]> = {
    ongoing: ongoing?.tournaments ?? [],
    upcoming: upcoming?.tournaments ?? [],
    completed: completed?.tournaments ?? [],
  };
  const leaderboard = lbData?.playersLeaderboard ?? [];
  const stats = statsData?.meTournamentStats;

  async function handleJoin(tournamentId: string) {
    try {
      const { data, error } = await joinTournament({ variables: { tournamentId } });
      if (error) return toaster.create({ title: error.message || "Failed to join", type: "error" });
      if (data?.joinTournament) {
        toaster.create({ title: "Joined — your board appears once the round starts", type: "success" });
        refetchUpcoming();
      }
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Failed to join", type: "error" });
    }
  }

  return (
    <VStack align="stretch" gap={8}>
      <Box>
        <Heading fontFamily="var(--font-playfair), Georgia, serif" size="xl" color="textPrimary">
          Tournaments
        </Heading>
        <Text color="textSecondary" mt={1}>
          Join an event — when a round starts you&apos;ll get a board to play right here on the site.
        </Text>
      </Box>

      {/* Status tabs */}
      <HStack gap={2} flexWrap="wrap">
        {TABS.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={tab === t.key ? "solid" : "outline"}
            bg={tab === t.key ? "gold" : "transparent"}
            color={tab === t.key ? "black" : "gold"}
            borderColor="gold"
            borderRadius="soft"
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {lists[t.key].length ? ` · ${lists[t.key].length}` : ""}
          </Button>
        ))}
      </HStack>

      <TournamentGrid
        list={lists[tab]}
        upcoming={tab === "upcoming"}
        tournamentsBasePath="/dashboard/tournaments"
        currentUserId={user?.id}
        onJoin={tab === "upcoming" ? handleJoin : undefined}
        joining={joining}
      />

      {/* Leaderboard + personal stats */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} pt={4}>
        <Box>
          <Heading size="md" color="gold" mb={4} fontFamily="var(--font-playfair), Georgia, serif">
            Top 10 players
          </Heading>
          <VStack align="stretch" gap={2}>
            {leaderboard.map((row) => (
              <HStack
                key={row.user.username}
                justify="space-between"
                py={2}
                px={3}
                borderRadius="soft"
                bg="bgCard"
                borderWidth="1px"
                borderColor="blackAlpha.100"
              >
                <HStack gap={3}>
                  <Text color="textMuted" w="24px">
                    {row.rank}
                  </Text>
                  <Text color="gold" fontWeight="600">
                    {row.user.profile?.chessTitle ? `${row.user.profile.chessTitle} ` : ""}
                    {row.user.username}
                  </Text>
                </HStack>
                <Text fontWeight="700">{row.rating}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>
        <Box>
          <Heading size="md" color="gold" mb={4} fontFamily="var(--font-playfair), Georgia, serif">
            My tournament stats
          </Heading>
          <Text fontSize="lg" fontWeight="700" color="textPrimary" mb={2}>
            Total joined: {stats?.totalJoined ?? 0}
          </Text>
          <VStack align="stretch" gap={1}>
            {stats?.breakdown?.map((b) => (
              <HStack key={b.variant} justify="space-between">
                <Text color="textSecondary">{b.variant}</Text>
                <Text color="gold">{b.count}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
}
