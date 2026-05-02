"use client";

import Link from "next/link";
import { Box, Button, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client/react";
import { fadeInUp, defaultViewport, staggerContainer, staggerChild } from "@/lib/animations";
import { PLAYERS_LEADERBOARD, SOONEST_TOURNAMENTS } from "@/graphql/queries/chessPro";

interface LeaderboardRow {
  rank: number;
  rating: number;
  user: { id: string; username: string; profile?: { country?: string | null; chessTitle?: string | null } | null };
}

interface SoonestRow {
  id: string;
  name: string;
  startDate: string;
  arenaTimeControl?: string | null;
  currentPlayers: number;
  maxPlayers: number;
  school?: { name: string } | null;
}

const HIGHLIGHTS = [
  {
    title: "Yaoundé Open · Round 5",
    body:
      "An exciting tactical battle on Board 1 swung the standings — Brilliant rook lift on move 23 set up a winning attack.",
    tag: "Tournament report",
  },
  {
    title: "Schools league: Buea regional finals",
    body:
      "Five schools, twelve boards, one cup. Catholic University secondary section took the trophy after a tense armageddon.",
    tag: "Schools",
  },
  {
    title: "Master class · Endgame technique",
    body:
      "Learn the Lucena and Philidor positions with annotated examples from this month's national rapid championship.",
    tag: "Coaching",
  },
];

const CLUBS = [
  { name: "Université de Yaoundé I", region: "Centre", members: 38 },
  { name: "Lycée Bilingue Buea", region: "Sud-Ouest", members: 24 },
  { name: "Douala Chess Society", region: "Littoral", members: 51 },
  { name: "Bamenda Knights", region: "Nord-Ouest", members: 19 },
];

export default function CommunityPage() {
  const { data: lbData } = useQuery<{ playersLeaderboard: LeaderboardRow[] }>(PLAYERS_LEADERBOARD, {
    variables: { limit: 5 },
  });
  const { data: trData } = useQuery<{ soonestTournaments: SoonestRow[] }>(SOONEST_TOURNAMENTS, {
    variables: { limit: 3 },
  });

  const leaderboard = lbData?.playersLeaderboard ?? [];
  const soonest = trData?.soonestTournaments ?? [];

  return (
    <VStack align="stretch" gap={10}>
      <Box>
        <Text fontSize="sm" color="gold" fontWeight="600" letterSpacing="wider" textTransform="uppercase">
          Together, we play
        </Text>
        <Heading
          fontFamily="var(--font-playfair), Georgia, serif"
          size="2xl"
          color="textPrimary"
          fontWeight="600"
          mt={1}
        >
          Community
        </Heading>
        <Text color="textSecondary" fontSize="sm" maxW="2xl" mt={2}>
          Schools, clubs, top players, and ongoing events — the people of Cameroon Chess Academy and what they&apos;re
          working on right now.
        </Text>
      </Box>

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={defaultViewport}>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          {HIGHLIGHTS.map((h) => (
            <motion.div key={h.title} variants={staggerChild}>
              <Box
                p={5}
                bg="bgCard"
                borderRadius="soft"
                borderWidth="1px"
                borderColor="whiteAlpha.080"
                _hover={{ borderColor: "goldDark" }}
                transition="border-color 0.2s"
                h="full"
              >
                <Text fontSize="xs" color="gold" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                  {h.tag}
                </Text>
                <Text mt={1} fontWeight="700" color="textPrimary" fontFamily="var(--font-playfair), Georgia, serif">
                  {h.title}
                </Text>
                <Text mt={2} fontSize="sm" color="textSecondary" lineHeight="1.65">
                  {h.body}
                </Text>
              </Box>
            </motion.div>
          ))}
        </SimpleGrid>
      </motion.div>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
          <Box p={5} bg="bgCard" borderRadius="soft" borderWidth="1px" borderColor="whiteAlpha.080">
            <HStack justify="space-between" mb={3}>
              <Heading size="md" color="textPrimary" fontFamily="var(--font-playfair), Georgia, serif">
                Top of the leaderboard
              </Heading>
              <Link href="/rankings">
                <Text fontSize="sm" color="gold" _hover={{ textDecoration: "underline" }}>
                  See all →
                </Text>
              </Link>
            </HStack>
            <VStack align="stretch" gap={2}>
              {leaderboard.length === 0 && (
                <Text color="textMuted" fontSize="sm">
                  Leaderboard loads as soon as rated games begin streaming.
                </Text>
              )}
              {leaderboard.map((row) => (
                <Link key={row.user.id} href={`/players?focus=${row.user.username}`}>
                  <HStack
                    justify="space-between"
                    py={2}
                    px={3}
                    borderRadius="md"
                    bg="bgDark"
                    borderWidth="1px"
                    borderColor="whiteAlpha.060"
                    _hover={{ borderColor: "gold" }}
                    transition="border-color 0.2s"
                  >
                    <HStack gap={3}>
                      <Box
                        w="24px"
                        h="24px"
                        borderRadius="full"
                        bg={row.rank === 1 ? "gold" : row.rank === 2 ? "#c0c0c0" : row.rank === 3 ? "#cd7f32" : "whiteAlpha.100"}
                        color={row.rank <= 3 ? "bgDark" : "textMuted"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="700"
                      >
                        {row.rank}
                      </Box>
                      <Text color="textPrimary" fontWeight="600">
                        {row.user.profile?.chessTitle ? `${row.user.profile.chessTitle} ` : ""}
                        {row.user.username}
                      </Text>
                    </HStack>
                    <Text color="gold" fontSize="sm" fontWeight="700">
                      {row.rating}
                    </Text>
                  </HStack>
                </Link>
              ))}
            </VStack>
          </Box>
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
          <Box p={5} bg="bgCard" borderRadius="soft" borderWidth="1px" borderColor="whiteAlpha.080">
            <HStack justify="space-between" mb={3}>
              <Heading size="md" color="textPrimary" fontFamily="var(--font-playfair), Georgia, serif">
                Next on the calendar
              </Heading>
              <Link href="/tournaments">
                <Text fontSize="sm" color="gold" _hover={{ textDecoration: "underline" }}>
                  All events →
                </Text>
              </Link>
            </HStack>
            <VStack align="stretch" gap={2}>
              {soonest.length === 0 && (
                <Text color="textMuted" fontSize="sm">
                  No upcoming arenas just yet — check back tomorrow.
                </Text>
              )}
              {soonest.map((t) => (
                <Link key={t.id} href={`/tournaments/${t.id}`}>
                  <Box
                    p={3}
                    bg="bgDark"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="whiteAlpha.060"
                    _hover={{ borderColor: "gold" }}
                    transition="border-color 0.2s"
                  >
                    <Text color="textPrimary" fontWeight="600">
                      {t.name}
                    </Text>
                    <Text color="textMuted" fontSize="xs">
                      {new Date(t.startDate).toLocaleString()} ·{" "}
                      {t.arenaTimeControl ?? "Arena"} · {t.currentPlayers}/{t.maxPlayers} registered
                    </Text>
                  </Box>
                </Link>
              ))}
            </VStack>
          </Box>
        </motion.div>
      </SimpleGrid>

      <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
        <Box p={5} bg="bgCard" borderRadius="soft" borderWidth="1px" borderColor="whiteAlpha.080">
          <HStack justify="space-between" mb={3}>
            <Heading size="md" color="textPrimary" fontFamily="var(--font-playfair), Georgia, serif">
              Active clubs across Cameroon
            </Heading>
            <Link href="/schools">
              <Text fontSize="sm" color="gold" _hover={{ textDecoration: "underline" }}>
                Browse all schools →
              </Text>
            </Link>
          </HStack>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
            {CLUBS.map((c) => (
              <Box
                key={c.name}
                p={3}
                bg="bgDark"
                borderRadius="md"
                borderWidth="1px"
                borderColor="whiteAlpha.060"
              >
                <Text color="textPrimary" fontWeight="600" fontSize="sm">
                  {c.name}
                </Text>
                <Text color="textMuted" fontSize="xs" mt={1}>
                  {c.region}
                </Text>
                <Text color="gold" fontSize="xs" mt={2} fontWeight="700">
                  {c.members} members
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
        <HStack
          p={5}
          bg="bgCard"
          borderRadius="soft"
          borderWidth="1px"
          borderColor="goldDark"
          justify="space-between"
          flexWrap="wrap"
          gap={3}
        >
          <Box>
            <Text fontSize="xs" color="gold" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
              Got something to share?
            </Text>
            <Text color="textPrimary" fontWeight="600" mt={1}>
              Submit a tournament report, masterclass, or club spotlight.
            </Text>
            <Text fontSize="sm" color="textSecondary" mt={1}>
              We feature community contributions in the highlights section weekly.
            </Text>
          </Box>
          <Link href="/contact">
            <Button bg="gold" color="bgDark" borderRadius="soft" _hover={{ bg: "goldLight" }}>
              Submit a story
            </Button>
          </Link>
        </HStack>
      </motion.div>
    </VStack>
  );
}
