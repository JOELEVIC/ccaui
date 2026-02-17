"use client";

import { Box, Heading, Text, VStack, SimpleGrid, Card, HStack, Button } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "@/lib/auth";

const ME_FULL = gql`
  query MeDashboard {
    me {
      id
      username
      email
      role
      rating
      profile {
        firstName
        lastName
        badges {
          id
          name
          description
        }
      }
      school {
        id
        name
        region
      }
    }
  }
`;

const LIVE_GAMES = gql`
  query LiveGames {
    liveGames {
      id
      status
      timeControl
      white {
        id
        username
        rating
      }
      black {
        id
        username
        rating
      }
    }
  }
`;

const UPCOMING_TOURNAMENTS = gql`
  query DashboardUpcoming {
    tournaments(status: UPCOMING) {
      id
      name
      startDate
      school {
        name
      }
    }
  }
`;

const DAILY_PUZZLE = gql`
  query DailyPuzzle {
    dailyPuzzle {
      id
      fen
      difficulty
      theme
    }
  }
`;

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: meData } = useQuery<{
    me: {
      id: string;
      username: string;
      role: string;
      rating: number;
      profile?: { firstName: string; lastName: string };
      school?: { name: string; region: string };
    };
  }>(ME_FULL);
  const { data: gamesData } = useQuery<{
    liveGames: Array<{ id: string; white: { username: string }; black: { username: string } }>;
  }>(LIVE_GAMES);
  const { data: tournamentsData } = useQuery<{
    tournaments: Array<{ id: string; name: string; startDate: string; school: { name: string } }>;
  }>(UPCOMING_TOURNAMENTS);
  const { data: puzzleData } = useQuery<{
    dailyPuzzle: { id: string; difficulty: number; theme: string[] } | null;
  }>(DAILY_PUZZLE);

  const me = meData?.me ?? user;
  const liveGames = gamesData?.liveGames ?? [];
  const upcomingTournaments = tournamentsData?.tournaments ?? [];
  const dailyPuzzle = puzzleData?.dailyPuzzle;

  return (
    <VStack align="stretch" gap={8}>
      <Heading
        size="xl"
        color="gold"
        fontFamily="var(--font-playfair), Georgia, serif"
      >
        Dashboard
      </Heading>

      {/* Profile card */}
      {me && (
        <Card.Root
          bg="bgCard"
          borderWidth="1px"
          borderColor="goldDark"
          borderRadius="cca"
        >
          <Card.Body p={6}>
            <HStack gap={4} flexWrap="wrap">
              <Box
                w="56px"
                h="56px"
                borderRadius="full"
                bg="goldDark"
                color="gold"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                fontSize="xl"
              >
                {(me.profile?.firstName?.charAt(0) ?? me.username?.charAt(0))?.toUpperCase() ?? "?"}
              </Box>
              <VStack align="flex-start" gap={0}>
                <Text color="textPrimary" fontWeight="600" fontSize="lg">
                  {me.profile?.firstName} {me.profile?.lastName} ({me.username})
                </Text>
                <Text color="textSecondary" fontSize="sm">
                  {me.school ? `${me.school.name} · ${me.school.region}` : "—"}
                </Text>
                <HStack gap={4} mt={2}>
                  <Text color="gold" fontWeight="700" fontSize="2xl">
                    {me.rating}
                  </Text>
                  <Text color="textMuted" fontSize="sm">
                    National rank: —
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Continue Match / Start a Match - prominent */}
      <Card.Root
        bg="bgCard"
        borderWidth="1px"
        borderColor="gold"
        borderRadius="cca"
        _hover={{ boxShadow: "0 0 20px rgba(198, 167, 94, 0.1)" }}
        transition="all 0.2s"
      >
        <Card.Body p={6}>
          {liveGames.length > 0 ? (
            <VStack align="stretch" gap={4}>
              <Heading size="md" color="gold">
                Continue Match
              </Heading>
              <VStack align="stretch" gap={2}>
                {liveGames.slice(0, 3).map((g: { id: string; white: { username: string }; black: { username: string } }) => (
                  <Link key={g.id} href={`/game/${g.id}`}>
                    <Box
                      py={3}
                      px={4}
                      borderRadius="cca"
                      bg="whiteAlpha.05"
                      _hover={{ bg: "whiteAlpha.08" }}
                      color="gold"
                    >
                      {g.white?.username} vs {g.black?.username}
                    </Box>
                  </Link>
                ))}
              </VStack>
              <Link href="/games">
                <Button size="sm" variant="outline" borderColor="gold" color="gold" borderRadius="cca">
                  All games
                </Button>
              </Link>
            </VStack>
          ) : (
            <VStack align="stretch" gap={4}>
              <Heading size="md" color="gold">
                Start a Match
              </Heading>
              <Text color="textSecondary" fontSize="sm">
                Create a new game and compete in the arena.
              </Text>
              <Link href="/games">
                <Button size="md" bg="gold" color="black" borderRadius="cca" _hover={{ bg: "goldLight" }}>
                  Start a Match
                </Button>
              </Link>
            </VStack>
          )}
        </Card.Body>
      </Card.Root>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} w="full">
        <Card.Root bg="bgCard" borderWidth="1px" borderColor="goldDark" borderRadius="cca">
          <Card.Header>
            <Heading size="sm" color="gold">
              Upcoming Tournaments
            </Heading>
          </Card.Header>
          <Card.Body pt={0}>
            {upcomingTournaments.length === 0 ? (
              <Text color="textMuted" fontSize="sm">
                No upcoming tournaments.
              </Text>
            ) : (
              <VStack align="stretch" gap={2}>
                {upcomingTournaments.slice(0, 5).map((t) => (
                  <Link key={t.id} href={`/tournaments/${t.id}`}>
                    <Box
                      py={2}
                      px={3}
                      borderRadius="cca"
                      bg="whiteAlpha.05"
                      _hover={{ bg: "whiteAlpha.08" }}
                      color="textPrimary"
                      fontSize="sm"
                    >
                      {t.name} · {t.school?.name} · {new Date(t.startDate).toLocaleDateString()}
                    </Box>
                  </Link>
                ))}
              </VStack>
            )}
          </Card.Body>
        </Card.Root>

        <Card.Root bg="bgCard" borderWidth="1px" borderColor="goldDark" borderRadius="cca">
          <Card.Header>
            <Heading size="sm" color="gold">
              Recent rating changes
            </Heading>
          </Card.Header>
          <Card.Body pt={0}>
            <Text color="textMuted" fontSize="sm">
              —
            </Text>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {dailyPuzzle && (
        <Card.Root bg="bgCard" borderWidth="1px" borderColor="goldDark" borderRadius="cca">
          <Card.Body py={4}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Text color="textSecondary" fontSize="sm">
                Daily puzzle · Difficulty {dailyPuzzle.difficulty}
              </Text>
              <Link href="/learning">
                <Button size="sm" variant="ghost" color="gold" borderRadius="cca">
                  Solve →
                </Button>
              </Link>
            </HStack>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  );
}
