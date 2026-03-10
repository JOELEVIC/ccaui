"use client";

import { Box, Heading, Text, VStack, SimpleGrid, Card, HStack, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "@/lib/auth";
import { LevelBadge, XPBar, StreakCounter, TierLabel } from "@/components/dashboard";
import { ubcaImages } from "@/assets/images/ubca";

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
        xp
        level
        puzzleStreakCount
        lastPuzzleSolvedAt
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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getDateString(): string {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: meData } = useQuery<{
    me: {
      id: string;
      username: string;
      role: string;
      rating: number;
      profile?: {
        firstName: string;
        lastName: string;
        xp?: number;
        level?: number;
        puzzleStreakCount?: number;
        lastPuzzleSolvedAt?: string | null;
      };
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
  const firstName = me?.profile?.firstName || me?.username || "Player";
  const level = me?.profile?.level ?? 1;
  const xp = me?.profile?.xp ?? 0;
  const streak = me?.profile?.puzzleStreakCount ?? 0;
  const xpPerLevel = 100;
  const xpNextLevel = level * xpPerLevel;
  const xpNeededForNext = xpNextLevel - xp;

  return (
    <VStack align="stretch" gap={{ base: 6, md: 10 }}>
      <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={{ base: 3, md: 4 }}>
        <Box minW={0} flex={1}>
          <Heading
            size={{ base: "lg", md: "xl" }}
            color="gold"
            fontFamily="var(--font-playfair), Georgia, serif"
          >
            Dashboard
          </Heading>
          <Text color="textMuted" fontSize="sm" mt={1}>
            {getGreeting()}, {firstName}
          </Text>
          <Text color="textMuted" fontSize="xs" mt={0.5}>
            {getDateString()}
          </Text>
        </Box>
        {me && (
          <HStack gap={{ base: 2, md: 4 }} flexWrap="wrap" align="center">
            <LevelBadge level={level} size="md" />
            <Box minW={{ base: "100px", sm: "140px" }} w={{ base: "100px", sm: "140px" }}>
              <XPBar xp={xp} level={level} showLabel={true} size="sm" />
            </Box>
            <StreakCounter count={streak} size="md" />
          </HStack>
        )}
      </Flex>

      {/* Academy / community hero blend */}
      <Box
        w="full"
        borderRadius="soft"
        overflow="hidden"
        position="relative"
        h={{ base: "100px", md: "140px" }}
        minH={{ base: "100px", md: "140px" }}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(17, 19, 24, 0.75) 0%, rgba(17, 19, 24, 0.92) 100%), url(${ubcaImages.players2.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box position="absolute" inset={0} display="flex" alignItems="center" px={{ base: 4, md: 6 }}>
          <Text color="gold" fontSize="sm" fontWeight="600" letterSpacing="0.04em" textTransform="uppercase">
            Where the game is played
          </Text>
        </Box>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 4, md: 8 }} w="full">
        {/* Left column: profile + continue match */}
        <VStack align="stretch" gap={{ base: 4, md: 8 }}>
          {me && (
            <Card.Root
              bg="bgCard"
              borderWidth="1px"
              borderColor="goldDark"
              borderRadius="soft"
              boxShadow="var(--shadow-card-soft)"
            >
              <Card.Body p={{ base: 4, md: 6 }}>
                <HStack gap={{ base: 3, md: 4 }} flexWrap="wrap">
                  <Box
                    w={{ base: "48px", md: "56px" }}
                    h={{ base: "48px", md: "56px" }}
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
                  <VStack align="flex-start" gap={0} minW={0} flex={1}>
                    <Text color="textPrimary" fontWeight="600" fontSize={{ base: "md", md: "lg" }} lineClamp={1}>
                      {me.profile?.firstName} {me.profile?.lastName} ({me.username})
                    </Text>
                    <Text color="textSecondary" fontSize="sm">
                      {me.school ? `${me.school.name} · ${me.school.region}` : "—"}
                    </Text>
                    <HStack gap={4} mt={2} flexWrap="wrap">
                      <Text color="gold" fontWeight="700" fontSize="2xl">
                        {me.rating}
                      </Text>
                      <TierLabel rating={me.rating} size="sm" />
                      <Text color="textMuted" fontSize="sm">
                        National rank: —
                      </Text>
                    </HStack>
                    {xpNeededForNext > 0 && (
                      <Text color="textMuted" fontSize="xs" mt={1}>
                        Next level at {xpNextLevel} XP ({xpNeededForNext} to go)
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Card.Body>
            </Card.Root>
          )}

          <Card.Root
            bg="bgCard"
            borderWidth="1px"
            borderColor="gold"
            borderRadius="soft"
            boxShadow="var(--shadow-card-soft)"
            _hover={{ boxShadow: "var(--shadow-card-soft-hover)" }}
            transition="all 0.2s"
          >
            <Card.Body p={{ base: 4, md: 6 }}>
              {liveGames.length > 0 ? (
                <VStack align="stretch" gap={4}>
                  <Heading size="md" color="gold">
                    Continue Match
                  </Heading>
                  <Text color="textMuted" fontSize="xs">
                    Finish games to earn XP (win: 20, draw: 10, loss: 5).
                  </Text>
                  <VStack align="stretch" gap={2}>
                    {liveGames.slice(0, 3).map((g: { id: string; white: { username: string }; black: { username: string } }) => (
                      <Link key={g.id} href={`/game/${g.id}`}>
                        <Box
                          py={3}
                          px={4}
                          borderRadius="soft"
                          bg="whiteAlpha.05"
                          _hover={{ bg: "whiteAlpha.08" }}
                          color="gold"
                        >
                          {g.white?.username} vs {g.black?.username}
                        </Box>
                      </Link>
                    ))}
                  </VStack>
                  <HStack gap={2} flexWrap="wrap">
                    <Link href="/games">
                      <Button size="sm" variant="outline" borderColor="gold" color="gold" borderRadius="soft">
                        All games
                      </Button>
                    </Link>
                    <Link href="/play/bot">
                      <Button size="sm" variant="ghost" color="textMuted" borderRadius="soft">
                        Practice
                      </Button>
                    </Link>
                  </HStack>
                </VStack>
              ) : (
                <VStack align="stretch" gap={4}>
                  <Heading size="md" color="gold">
                    Start a Match
                  </Heading>
                  <Text color="textSecondary" fontSize="sm">
                    Create a new game and compete in the arena. Earn XP by completing games (win: 20, draw: 10, loss: 5).
                  </Text>
                  <Link href="/games">
                    <Button size="md" bg="gold" color="black" borderRadius="soft" _hover={{ bg: "goldLight" }}>
                      Start a Match
                    </Button>
                  </Link>
                  <HStack gap={2} flexWrap="wrap" pt={2}>
                    <Link href="/play/bot">
                      <Button size="sm" variant="outline" borderColor="goldDark" color="gold" borderRadius="soft">
                        Practice vs Bot
                      </Button>
                    </Link>
                    <Link href="/play/local">
                      <Button size="sm" variant="ghost" color="textMuted" borderRadius="soft">
                        Play vs Self
                      </Button>
                    </Link>
                  </HStack>
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </VStack>

        {/* Right column: tournaments + rating */}
        <VStack align="stretch" gap={{ base: 4, md: 6 }}>
          <Card.Root bg="bgCard" borderWidth="1px" borderColor="goldDark" borderRadius="soft" boxShadow="var(--shadow-card-soft)">
            <Card.Header px={{ base: 4, md: 6 }} pt={{ base: 4, md: 6 }}>
              <Heading size="sm" color="gold">
                Upcoming Tournaments
              </Heading>
            </Card.Header>
            <Card.Body pt={0} px={{ base: 4, md: 6 }} pb={{ base: 4, md: 6 }}>
              {upcomingTournaments.length === 0 ? (
                <Text color="textMuted" fontSize="sm">
                  No upcoming tournaments.
                </Text>
              ) : (
                <VStack align="stretch" gap={2}>
                  {upcomingTournaments.slice(0, 5).map((t) => (
                    <Link key={t.id} href={`/dashboard/tournaments/${t.id}`}>
                      <Box
                        py={2}
                        px={3}
                        borderRadius="soft"
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

          <Card.Root bg="bgCard" borderWidth="1px" borderColor="goldDark" borderRadius="soft" boxShadow="var(--shadow-card-soft)">
            <Card.Header px={{ base: 4, md: 6 }} pt={{ base: 4, md: 6 }}>
              <Heading size="sm" color="gold">
                Recent rating changes
              </Heading>
            </Card.Header>
            <Card.Body pt={0} px={{ base: 4, md: 6 }} pb={{ base: 4, md: 6 }}>
              <Text color="textMuted" fontSize="sm">
                —
              </Text>
            </Card.Body>
          </Card.Root>
        </VStack>
      </SimpleGrid>

      {dailyPuzzle && (
        <Card.Root bg="bgCard" borderWidth="1px" borderColor="goldDark" borderRadius="soft" boxShadow="var(--shadow-card-soft)">
          <Card.Body py={4} px={{ base: 4, md: 6 }}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <HStack gap={3}>
                <Text color="textSecondary" fontSize="sm">
                  Daily puzzle · Difficulty {dailyPuzzle.difficulty}
                </Text>
                {streak > 0 && <StreakCounter count={streak} size="sm" />}
                <Text color="textMuted" fontSize="xs">
                  +XP on solve
                </Text>
              </HStack>
              <Link href={`/learning/puzzle/${dailyPuzzle.id}`}>
                <Button size="sm" variant="ghost" color="gold" borderRadius="soft">
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
