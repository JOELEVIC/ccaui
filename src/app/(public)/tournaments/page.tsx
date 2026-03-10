"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack, Button, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { toaster } from "@/lib/toaster";
import { useAuth } from "@/lib/auth";
import { JOIN_TOURNAMENT } from "@/graphql/mutations/tournaments";
import { TournamentGrid, type TournamentItem } from "@/components/tournaments/TournamentGrid";

const TOURNAMENTS = gql`
  query TournamentsList($status: TournamentStatus) {
    tournaments(status: $status) {
      id
      name
      status
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

export default function PublicTournamentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("ongoing");

  const { data: upcoming, refetch: refetchUpcoming } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, { variables: { status: "UPCOMING" } });
  const { data: ongoing } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, { variables: { status: "ONGOING" } });
  const { data: completed } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, { variables: { status: "COMPLETED" } });

  const [joinTournament, { loading: joining }] = useMutation<{ joinTournament: { id: string } }>(JOIN_TOURNAMENT);

  const upcomingList = upcoming?.tournaments ?? [];
  const ongoingList = ongoing?.tournaments ?? [];
  const completedList = completed?.tournaments ?? [];

  async function handleJoin(tournamentId: string) {
    try {
      const { data, error } = await joinTournament({ variables: { tournamentId } });
      if (error) {
        toaster.create({ title: error.message || "Failed to join", type: "error" });
        return;
      }
      if (data?.joinTournament) {
        toaster.create({ title: "Joined tournament", type: "success" });
        refetchUpcoming();
      }
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Failed to join", type: "error" });
    }
  }

  return (
    <VStack align="stretch" gap={8}>
      <Heading size="xl" color="gold" fontFamily="var(--font-playfair), Georgia, serif">
        Tournaments
      </Heading>

      {activeTab === "upcoming" && !user && (
        <Text color="textMuted" fontSize="sm">
          <Link href="/login">Sign in</Link> to register for upcoming tournaments, or{" "}
          <Link href="/dashboard/tournaments">open in dashboard</Link> for full features.
        </Text>
      )}

      <Box>
        <HStack gap={2} mb={6}>
          {(["ongoing", "upcoming", "completed"] as TabKey[]).map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={tab === activeTab ? "solid" : "outline"}
              bg={tab === activeTab ? "gold" : "transparent"}
              color={tab === activeTab ? "black" : "gold"}
              borderColor="gold"
              borderRadius="soft"
              onClick={() => setActiveTab(tab)}
            >
              {tab === "ongoing" ? "Live" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </HStack>
        {activeTab === "ongoing" && <TournamentGrid list={ongoingList} tournamentsBasePath="/tournaments" />}
        {activeTab === "upcoming" && (
          <TournamentGrid
            list={upcomingList}
            upcoming
            tournamentsBasePath="/tournaments"
            currentUserId={user?.id}
            onJoin={user ? handleJoin : undefined}
            joining={joining}
          />
        )}
        {activeTab === "completed" && <TournamentGrid list={completedList} tournamentsBasePath="/tournaments" />}
      </Box>
    </VStack>
  );
}
