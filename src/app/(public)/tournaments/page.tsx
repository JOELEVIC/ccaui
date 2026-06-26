"use client";

import { useState } from "react";
import { Box, VStack, Button, HStack } from "@chakra-ui/react";
import { PageHeader } from "@/components/common/PageHeader";
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

export default function PublicTournamentsPage() {
  const { user } = useAuth();
  // Default to Upcoming — for an academy the "Live" tab is usually empty, so
  // leading with it made the page look dead on arrival.
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  // cache-and-network: instant from cache on revisit, refreshed in the background.
  const { data: upcoming, loading: upLoading, refetch: refetchUpcoming } = useQuery<{ tournaments: TournamentItem[] }>(
    TOURNAMENTS,
    { variables: { status: "UPCOMING" }, fetchPolicy: "cache-and-network" }
  );
  const { data: ongoing, loading: onLoading } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, {
    variables: { status: "ONGOING" },
    fetchPolicy: "cache-and-network",
  });
  const { data: completed, loading: compLoading } = useQuery<{ tournaments: TournamentItem[] }>(TOURNAMENTS, {
    variables: { status: "COMPLETED" },
    fetchPolicy: "cache-and-network",
  });

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
      <PageHeader title="Tournaments" subtitle="Live, upcoming & completed events." />

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
        {activeTab === "ongoing" && (
          <TournamentGrid list={ongoingList} loading={onLoading} tournamentsBasePath="/tournaments" />
        )}
        {activeTab === "upcoming" && (
          <TournamentGrid
            list={upcomingList}
            loading={upLoading}
            upcoming
            tournamentsBasePath="/tournaments"
            currentUserId={user?.id}
            onJoin={user ? handleJoin : undefined}
            joining={joining}
          />
        )}
        {activeTab === "completed" && (
          <TournamentGrid list={completedList} loading={compLoading} tournamentsBasePath="/tournaments" />
        )}
      </Box>
    </VStack>
  );
}
