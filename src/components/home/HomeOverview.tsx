"use client";

import { Box, Container, Heading, Text, VStack, SimpleGrid, Card, Button, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "@/lib/auth";
import { LandingNav } from "./LandingNav";
import { LandingHeroMinimal } from "./LandingHeroMinimal";
import { LandingRankingsPreview } from "./LandingRankingsPreview";
import { LandingIconFeatures } from "./LandingIconFeatures";
import { LandingCameroonChess } from "./LandingCameroonChess";
import { LandingStats } from "./LandingStats";
import { LandingPlayCompete } from "./LandingPlayCompete";
import { LandingEventsPreview } from "./LandingEventsPreview";
import { LandingCoursesPreview } from "./LandingCoursesPreview";
import { LandingTestimonialsCarousel } from "./LandingTestimonialsCarousel";
import { LandingGallery } from "./LandingGallery";
import { ChessDivider } from "./ChessDivider";
import { LandingAcademy } from "./LandingAcademy";
import { LandingCta } from "./LandingCta";
import { LandingFooter } from "./LandingFooter";
import { LandingRoadToMaster } from "./LandingRoadToMaster";
import { ChessLoader } from "@/components/common/ChessLoader";

const ME_FULL = gql`
  query HomeMe {
    me {
      id
      username
      role
      rating
      profile {
        firstName
        lastName
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
  query HomeLiveGames {
    liveGames {
      id
      timeControl
      white {
        username
        rating
      }
      black {
        username
        rating
      }
    }
  }
`;

const UPCOMING_TOURNAMENTS = gql`
  query HomeUpcomingTournaments {
    tournaments(status: UPCOMING) {
      id
      name
      startDate
      school {
        name
      }
      participants {
        user {
          id
        }
      }
    }
  }
`;

const DAILY_PUZZLE = gql`
  query HomeDailyPuzzle {
    dailyPuzzle {
      id
      difficulty
      theme
    }
  }
`;

const MY_GAMES = gql`
  query HomeMyGames {
    myGames(status: null) {
      id
      status
      result
      white {
        username
      }
      black {
        username
      }
    }
  }
`;

export function HomeOverview() {
  const { user, loading: authLoading, token, isAdmin } = useAuth();
  const { data: meData } = useQuery<{
    me: {
      id: string;
      username: string;
      role: string;
      rating: number;
      profile?: { firstName: string; lastName: string };
      school?: { id: string; name: string; region: string };
    };
  }>(ME_FULL, { skip: !user });
  const { data: gamesData } = useQuery<{
    liveGames: Array<{
      id: string;
      white: { username: string };
      black: { username: string };
    }>;
  }>(LIVE_GAMES, { skip: !user });
  const { data: tournamentsData } = useQuery<{
    tournaments: Array<{
      id: string;
      name: string;
      startDate: string;
      school: { name: string };
      participants: Array<{ user: { id: string } }>;
    }>;
  }>(UPCOMING_TOURNAMENTS, { skip: !user });
  const { data: puzzleData } = useQuery<{
    dailyPuzzle: { id: string; difficulty: number; theme: string[] } | null;
  }>(DAILY_PUZZLE, { skip: !user });
  const { data: myGamesData } = useQuery<{
    myGames: Array<{
      id: string;
      status: string;
      result?: string | null;
      white: { username: string };
      black: { username: string };
    }>;
  }>(MY_GAMES, { skip: !user });

  // For visitors without a token (anonymous), render the landing immediately
  // — no flash of loading state. Only show the loader when we know we're
  // actively fetching the user (token present but user not yet resolved).
  if (authLoading && token) {
    return <ChessLoader message="Loading..." />;
  }

  if (!user) {
    return (
      <Box minH="100vh" bg="bgDark" color="white">
        <LandingNav />
        <LandingHeroMinimal />
        <LandingIconFeatures />
        <LandingPlayCompete />
        <LandingRoadToMaster />
        <LandingRankingsPreview />
        <LandingCameroonChess />
        <LandingStats />
        <LandingEventsPreview />
        <LandingCoursesPreview />
        <ChessDivider />
        <LandingTestimonialsCarousel />
        <LandingGallery />
        <LandingAcademy />
        <ChessDivider />
        <LandingCta />
        <LandingFooter />
      </Box>
    );
  }

  const me = meData?.me ?? user;
  const liveGames = gamesData?.liveGames ?? [];
  const upcomingTournaments = tournamentsData?.tournaments ?? [];
  const dailyPuzzle = puzzleData?.dailyPuzzle;
  const myGames = myGamesData?.myGames ?? [];

  return (
    <Box minH="100vh" bg="bgDark" color="white">
      <Container maxW="6xl" py={{ base: 8, md: 12 }}>
        <VStack align="stretch" gap={8}>
          {/* Welcome header */}
          <Box
            pb={8}
            borderBottomWidth="1px"
            borderColor="whiteAlpha.06"
          >
            <Heading size="2xl" fontFamily="serif" color="white" mb={1}>
              Welcome back, {me?.profile?.firstName || me?.username}
            </Heading>
            <Text color="gold" fontSize="md" fontWeight="500" mb={4}>
              {me?.rating} rating · {me?.role}
            </Text>
            <HStack gap={2} flexWrap="wrap">
              <Link href="/dashboard">
                <Button size="sm" bg="gold" color="black" _hover={{ bg: "goldLight" }}>
                  Dashboard
                </Button>
              </Link>
              <Link href="/games">
                <Button size="sm" variant="outline" borderColor="gold" color="gold" _hover={{ bg: "whiteAlpha.08" }}>
                  Games
                </Button>
              </Link>
              <Link href="/tournaments">
                <Button size="sm" variant="outline" borderColor="gold" color="gold" _hover={{ bg: "whiteAlpha.08" }}>
                  Tournaments
                </Button>
              </Link>
              <Link href="/learning">
                <Button size="sm" variant="outline" borderColor="gold" color="gold" _hover={{ bg: "whiteAlpha.08" }}>
                  Learning
                </Button>
              </Link>
              <Link href="/schools">
                <Button size="sm" variant="outline" borderColor="gold" color="gold" _hover={{ bg: "whiteAlpha.08" }}>
                  Schools
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button size="sm" variant="outline" borderColor="gold" color="gold" _hover={{ bg: "whiteAlpha.08" }}>
                    Admin
                  </Button>
                </Link>
              )}
            </HStack>
          </Box>

          {me?.school && (
            <Card.Root bg="bgCard" borderWidth="1px" borderColor="whiteAlpha.06">
              <Card.Body py={4} px={5}>
                <Text color="whiteAlpha.800" fontSize="sm">
                  Your school:{" "}
                  <Link href={`/schools/${me.school.id}`}>
                    <Box as="span" color="gold" fontWeight="600" _hover={{ textDecoration: "underline" }}>
                      {me.school.name}
                    </Box>
                  </Link>
                  {" · "}
                  {me.school.region}
                </Text>
              </Card.Body>
            </Card.Root>
          )}

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} w="full">
            <Card.Root bg="bgCard" borderWidth="1px" borderColor="whiteAlpha.06">
              <Card.Header pb={2}>
                <Heading size="md" color="gold" fontWeight="600">
                  Active games
                </Heading>
              </Card.Header>
              <Card.Body pt={0}>
                {liveGames.length === 0 ? (
                  <Text color="whiteAlpha.600" fontSize="sm">
                    No active games. Start one from Games.
                  </Text>
                ) : (
                  <VStack align="stretch" gap={1}>
                    {liveGames.slice(0, 5).map((g) => (
                      <Link key={g.id} href={`/game/${g.id}`}>
                        <Box
                          py={2}
                          px={3}
                          borderRadius="md"
                          bg="whiteAlpha.05"
                          _hover={{ bg: "whiteAlpha.10" }}
                          color="gold"
                          fontSize="sm"
                        >
                          {g.white?.username} vs {g.black?.username}
                        </Box>
                      </Link>
                    ))}
                  </VStack>
                )}
                <Link href="/games">
                  <Button size="sm" mt={3} variant="ghost" color="gold" fontSize="sm">
                    All games →
                  </Button>
                </Link>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="bgCard" borderWidth="1px" borderColor="whiteAlpha.06">
              <Card.Header pb={2}>
                <Heading size="md" color="gold" fontWeight="600">
                  Upcoming tournaments
                </Heading>
              </Card.Header>
              <Card.Body pt={0}>
                {upcomingTournaments.length === 0 ? (
                  <Text color="whiteAlpha.600" fontSize="sm">
                    No upcoming tournaments.
                  </Text>
                ) : (
                  <VStack align="stretch" gap={1}>
                    {upcomingTournaments.slice(0, 5).map((t) => (
                      <Box
                        key={t.id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        py={2}
                        px={3}
                        borderRadius="md"
                        bg="whiteAlpha.05"
                      >
                        <Link href={`/tournaments/${t.id}`}>
                          <Box as="span" color="gold" fontSize="sm" _hover={{ textDecoration: "underline" }}>
                            {t.name}
                          </Box>
                        </Link>
                        <Text color="whiteAlpha.500" fontSize="xs">
                          {new Date(t.startDate).toLocaleDateString()}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                )}
                <Link href="/tournaments">
                  <Button size="sm" mt={3} variant="ghost" color="gold" fontSize="sm">
                    All tournaments →
                  </Button>
                </Link>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="bgCard" borderWidth="1px" borderColor="whiteAlpha.06">
              <Card.Header pb={2}>
                <Heading size="md" color="gold" fontWeight="600">
                  Daily puzzle
                </Heading>
              </Card.Header>
              <Card.Body pt={0}>
                {dailyPuzzle ? (
                  <>
                    <Text color="whiteAlpha.700" fontSize="sm" mb={2}>
                      Difficulty {dailyPuzzle.difficulty}
                    </Text>
                    <Link href={dailyPuzzle.id ? `/learning/puzzle/${dailyPuzzle.id}` : "/learning"}>
                      <Button size="sm" bg="gold" color="black" _hover={{ bg: "goldLight" }}>
                        Solve puzzle →
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Text color="whiteAlpha.600" fontSize="sm">
                    No daily puzzle. Check Learning for more.
                  </Text>
                )}
              </Card.Body>
            </Card.Root>

            <Card.Root bg="bgCard" borderWidth="1px" borderColor="whiteAlpha.06">
              <Card.Header pb={2}>
                <Heading size="md" color="gold" fontWeight="600">
                  My recent games
                </Heading>
              </Card.Header>
              <Card.Body pt={0}>
                {myGames.length === 0 ? (
                  <Text color="whiteAlpha.600" fontSize="sm">
                    No games yet. Create one from Games.
                  </Text>
                ) : (
                  <VStack align="stretch" gap={1}>
                    {myGames.slice(0, 5).map((g) => (
                      <Link key={g.id} href={`/game/${g.id}`}>
                        <Box
                          py={2}
                          px={3}
                          borderRadius="md"
                          bg="whiteAlpha.05"
                          _hover={{ bg: "whiteAlpha.10" }}
                          color="whiteAlpha.900"
                          fontSize="sm"
                        >
                          {g.white?.username} vs {g.black?.username}
                          {g.status !== "FINISHED" && ` · ${g.status}`}
                          {g.result && ` (${g.result})`}
                        </Box>
                      </Link>
                    ))}
                  </VStack>
                )}
                <Link href="/games">
                  <Button size="sm" mt={3} variant="ghost" color="gold" fontSize="sm">
                    All games →
                  </Button>
                </Link>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
