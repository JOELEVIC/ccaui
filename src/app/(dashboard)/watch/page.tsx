"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Box, Button, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { fadeInUp, defaultViewport, staggerContainer, staggerChild } from "@/lib/animations";

const LIVE_GAMES = gql`
  query WatchLiveGames {
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

const SOONEST = gql`
  query WatchUpcoming {
    soonestTournaments(limit: 3) {
      id
      name
      startDate
      arenaTimeControl
      currentPlayers
      maxPlayers
    }
  }
`;

interface LiveGame {
  id: string;
  timeControl: string;
  white: { username: string; rating: number };
  black: { username: string; rating: number };
}

interface UpcomingTournament {
  id: string;
  name: string;
  startDate: string;
  arenaTimeControl?: string | null;
  currentPlayers: number;
  maxPlayers: number;
}

export default function WatchPage() {
  const { data: liveData, loading: liveLoading } = useQuery<{ liveGames: LiveGame[] }>(LIVE_GAMES, {
    pollInterval: 15000,
  });
  const { data: upcomingData } = useQuery<{ soonestTournaments: UpcomingTournament[] }>(SOONEST);

  const live = useMemo(() => liveData?.liveGames ?? [], [liveData]);
  const upcoming = upcomingData?.soonestTournaments ?? [];

  const featured = useMemo(() => {
    if (live.length === 0) return null;
    return [...live].sort(
      (a, b) =>
        Math.max(b.white.rating, b.black.rating) - Math.max(a.white.rating, a.black.rating)
    )[0];
  }, [live]);

  return (
    <VStack align="stretch" gap={10}>
      <Box>
        <Text fontSize="sm" color="gold" fontWeight="600" letterSpacing="wider" textTransform="uppercase">
          Live & broadcast
        </Text>
        <Heading
          fontFamily="var(--font-playfair), Georgia, serif"
          size="2xl"
          color="textPrimary"
          fontWeight="600"
          mt={1}
        >
          Watch
        </Heading>
        <Text color="textSecondary" fontSize="sm" maxW="2xl" mt={2}>
          Follow live games, top-rated arena boards, and the academy&apos;s upcoming events. New broadcasts roll in
          throughout the day.
        </Text>
      </Box>

      <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
        <Box
          p={{ base: 5, md: 7 }}
          borderRadius="soft"
          bg="bgCard"
          borderWidth="1px"
          borderColor={featured ? "goldDark" : "whiteAlpha.080"}
          backgroundImage="linear-gradient(120deg, rgba(230,164,82,0.10) 0%, rgba(20,27,46,0) 60%)"
        >
          <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
            <Box>
              <HStack gap={2}>
                <Box w="8px" h="8px" borderRadius="full" bg={featured ? "#ef4444" : "textMuted"} />
                <Text fontSize="xs" color={featured ? "#ef4444" : "textMuted"} fontWeight="700" letterSpacing="wider" textTransform="uppercase">
                  {featured ? "Featured live" : "No live boards yet"}
                </Text>
              </HStack>
              <Text fontSize="2xl" color="textPrimary" fontWeight="700" mt={2} fontFamily="var(--font-playfair), Georgia, serif">
                {featured
                  ? `${featured.white.username} vs ${featured.black.username}`
                  : "Be the first to play"}
              </Text>
              <Text color="textSecondary" fontSize="sm" mt={1}>
                {featured
                  ? `${featured.white.rating} — ${featured.black.rating} · ${featured.timeControl}`
                  : "Start a rated game and you may end up here as the featured board."}
              </Text>
            </Box>
            {featured ? (
              <Link href={`/game/${featured.id}`}>
                <Button bg="gold" color="bgDark" borderRadius="soft" _hover={{ bg: "goldLight" }}>
                  Watch live
                </Button>
              </Link>
            ) : (
              <Link href="/games">
                <Button bg="gold" color="bgDark" borderRadius="soft" _hover={{ bg: "goldLight" }}>
                  Start a game
                </Button>
              </Link>
            )}
          </HStack>
        </Box>
      </motion.div>

      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md" color="textPrimary" fontFamily="var(--font-playfair), Georgia, serif">
            All live boards
          </Heading>
          <Text fontSize="xs" color="textMuted">
            Auto-refresh · 15 s
          </Text>
        </HStack>
        {liveLoading && live.length === 0 ? (
          <Text color="textMuted" fontSize="sm">
            Loading live boards…
          </Text>
        ) : live.length === 0 ? (
          <Box p={6} bg="bgCard" borderRadius="soft" borderWidth="1px" borderColor="whiteAlpha.080" textAlign="center">
            <Text color="textMuted" fontSize="sm">
              Nothing live right now. Try the upcoming events below.
            </Text>
          </Box>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
              {live.map((g) => (
                <motion.div key={g.id} variants={staggerChild}>
                  <Link href={`/game/${g.id}`}>
                    <Box
                      p={4}
                      bg="bgCard"
                      borderRadius="soft"
                      borderWidth="1px"
                      borderColor="whiteAlpha.080"
                      transition="border-color 0.2s, transform 0.2s"
                      _hover={{ borderColor: "gold", transform: "translateY(-1px)" }}
                    >
                      <HStack justify="space-between">
                        <Text fontWeight="600" color="textPrimary">
                          {g.white.username}
                        </Text>
                        <Text fontSize="sm" color="textMuted">
                          {g.white.rating}
                        </Text>
                      </HStack>
                      <Text color="textMuted" fontSize="xs" my={1} textAlign="center">
                        vs
                      </Text>
                      <HStack justify="space-between">
                        <Text fontWeight="600" color="textPrimary">
                          {g.black.username}
                        </Text>
                        <Text fontSize="sm" color="textMuted">
                          {g.black.rating}
                        </Text>
                      </HStack>
                      <Text color="gold" fontSize="xs" mt={3} fontWeight="600">
                        {g.timeControl}
                      </Text>
                    </Box>
                  </Link>
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        )}
      </Box>

      {upcoming.length > 0 && (
        <Box>
          <Heading size="md" color="textPrimary" fontFamily="var(--font-playfair), Georgia, serif" mb={4}>
            Upcoming broadcasts
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
            {upcoming.map((t) => (
              <Link key={t.id} href={`/tournaments/${t.id}`}>
                <Box
                  p={4}
                  bg="bgCard"
                  borderRadius="soft"
                  borderWidth="1px"
                  borderColor="whiteAlpha.080"
                  _hover={{ borderColor: "gold" }}
                  transition="border-color 0.2s"
                >
                  <Text fontSize="xs" color="gold" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                    Tournament · {t.arenaTimeControl ?? "Arena"}
                  </Text>
                  <Text mt={1} fontWeight="700" color="textPrimary">
                    {t.name}
                  </Text>
                  <Text color="textSecondary" fontSize="sm" mt={1}>
                    {new Date(t.startDate).toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="textMuted" mt={2}>
                    {t.currentPlayers}/{t.maxPlayers} registered
                  </Text>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </VStack>
  );
}
