"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

const SCHOOL = gql`
  query SchoolDetail($id: ID!) {
    school(id: $id) {
      id
      name
      region
    }
    schoolLeaderboard(schoolId: $id) {
      user {
        id
        username
        rating
      }
      gamesPlayed
    }
    schoolStats(schoolId: $id) {
      totalStudents
      averageRating
      totalGames
      activeTournaments
    }
  }
`;

export default function SchoolDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, loading } = useQuery<{
    school: { id: string; name: string; region: string };
    schoolLeaderboard: Array<{ user: { id: string; username: string; rating: number }; gamesPlayed: number }>;
    schoolStats: { totalStudents: number; averageRating: number; totalGames: number; activeTournaments: number };
  }>(SCHOOL, { variables: { id } });

  const school = data?.school;
  const leaderboard = data?.schoolLeaderboard ?? [];
  const stats = data?.schoolStats;

  if (loading || !school) {
    return (
      <Box>
        <Text color="gold">Loading...</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <Link href="/schools">
        <Button size="sm" variant="outline" color="gold" borderColor="gold">
          Back to schools
        </Button>
      </Link>
      <Heading size="xl" color="gold" fontFamily="serif">
        {school.name}
      </Heading>
      <Text color="whiteAlpha.800">{school.region}</Text>
      {stats && (
        <Box display="flex" gap={6} flexWrap="wrap">
          <Text color="gold">Students: {stats.totalStudents}</Text>
          <Text color="gold">Avg rating: {stats.averageRating.toFixed(0)}</Text>
          <Text color="gold">Total games: {stats.totalGames}</Text>
          <Text color="gold">Active tournaments: {stats.activeTournaments}</Text>
        </Box>
      )}
      <Box>
        <Heading size="md" color="goldLight" mb={3}>
          Leaderboard
        </Heading>
        {leaderboard.length === 0 ? (
          <Text color="whiteAlpha.700">No players yet.</Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {leaderboard.map((entry, i) => (
              <Box
                key={entry.user.id}
                p={3}
                borderRadius="md"
                bg="bgCard"
                borderWidth="1px"
                borderColor="goldDark"
                display="flex"
                justifyContent="space-between"
              >
                <Text color="white">
                  #{i + 1} {entry.user.username}
                </Text>
                <Text color="gold">
                  {entry.user.rating} ELO · {entry.gamesPlayed} games
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
