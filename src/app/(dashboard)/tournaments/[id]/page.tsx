"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { toaster } from "@/lib/toaster";
import { useAuth } from "@/lib/auth";
import {
  JOIN_TOURNAMENT,
  START_TOURNAMENT,
  COMPLETE_TOURNAMENT,
} from "@/graphql/mutations/tournaments";

const TOURNAMENT = gql`
  query TournamentDetail($id: ID!) {
    tournament(id: $id) {
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
      games {
        id
        status
        result
      }
    }
  }
`;

export default function TournamentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, isAdmin } = useAuth();
  const { data, loading, refetch } = useQuery<{
    tournament: {
      id: string;
      name: string;
      status: string;
      startDate: string;
      endDate?: string | null;
      school: { id: string; name: string; region: string };
      participants: Array<{ id: string; score: number; user: { id: string; username: string; rating: number } }>;
      games: Array<{ id: string; status: string; result?: string | null }>;
    };
  }>(TOURNAMENT, { variables: { id } });

  const [joinTournament, { loading: joining }] = useMutation(JOIN_TOURNAMENT);
  const [startTournament, { loading: starting }] = useMutation(START_TOURNAMENT);
  const [completeTournament, { loading: completing }] = useMutation(COMPLETE_TOURNAMENT);

  const t = data?.tournament;

  const isParticipant = user?.id && t?.participants?.some((p) => p.user?.id === user.id);

  async function handleJoin() {
    try {
      const { error } = await joinTournament({ variables: { tournamentId: id } });
      if (error) {
        toaster.create({ title: error.message || "Failed to join", type: "error" });
        return;
      }
      toaster.create({ title: "Joined tournament", type: "success" });
      refetch();
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Failed to join", type: "error" });
    }
  }

  async function handleStart() {
    try {
      const { error } = await startTournament({ variables: { tournamentId: id } });
      if (error) {
        toaster.create({ title: error.message || "Failed to start", type: "error" });
        return;
      }
      toaster.create({ title: "Tournament started", type: "success" });
      refetch();
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Failed to start", type: "error" });
    }
  }

  async function handleComplete() {
    try {
      const { error } = await completeTournament({ variables: { tournamentId: id } });
      if (error) {
        toaster.create({ title: error.message || "Failed to complete", type: "error" });
        return;
      }
      toaster.create({ title: "Tournament completed", type: "success" });
      refetch();
    } catch (err) {
      toaster.create({ title: err instanceof Error ? err.message : "Failed to complete", type: "error" });
    }
  }

  if (loading || !t) {
    return (
      <Box>
        <Text color="gold">Loading...</Text>
      </Box>
    );
  }

  const sorted = [...(t.participants ?? [])].sort((a, b) => b.score - a.score);

  return (
    <VStack align="stretch" gap={6}>
      <Link href="/tournaments">
        <Button size="sm" variant="outline" color="gold" borderColor="gold">
          Back to tournaments
        </Button>
      </Link>
      <Heading size="xl" color="gold" fontFamily="serif">
        {t.name}
      </Heading>
      <Text color="whiteAlpha.800">
        {t.school.name} · {t.school.region}
      </Text>
      <Text color="gold">
        {new Date(t.startDate).toLocaleDateString()}
        {t.endDate && ` – ${new Date(t.endDate).toLocaleDateString()}`} · {t.status}
      </Text>

      <Box display="flex" gap={2} flexWrap="wrap">
        {t.status === "UPCOMING" && user?.id && !isParticipant && (
          <Button size="sm" bg="gold" color="black" loading={joining} onClick={handleJoin} _hover={{ bg: "goldLight" }}>
            Join tournament
          </Button>
        )}
        {isAdmin && t.status === "UPCOMING" && (
          <Button size="sm" variant="outline" color="gold" borderColor="gold" loading={starting} onClick={handleStart}>
            Start tournament
          </Button>
        )}
        {isAdmin && t.status === "ONGOING" && (
          <Button size="sm" variant="outline" color="gold" borderColor="gold" loading={completing} onClick={handleComplete}>
            Complete tournament
          </Button>
        )}
      </Box>

      <Box>
        <Heading size="md" color="goldLight" mb={3}>
          Standings
        </Heading>
        <VStack align="stretch" gap={2}>
          {sorted.map((p, i) => (
            <Box
              key={p.id}
              p={3}
              borderRadius="md"
              bg="bgCard"
              borderWidth="1px"
              borderColor="goldDark"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text color="white">
                #{i + 1} {p.user.username} ({p.user.rating})
              </Text>
              <Text color="gold">{p.score} pts</Text>
            </Box>
          ))}
        </VStack>
      </Box>
      <Text color="whiteAlpha.600" fontSize="sm">
        {t.games?.length ?? 0} games
      </Text>
    </VStack>
  );
}
