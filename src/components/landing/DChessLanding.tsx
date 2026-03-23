"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useQuery } from "@apollo/client/react";
import { APP_NAME } from "@/lib/appName";
import { PLATFORM_METRICS } from "@/graphql/queries/chessPro";

const FEATURES = [
  {
    title: "Play your way",
    body: "Matchmaking, friends, bots, and local games — pick the mode that fits your day.",
  },
  {
    title: "Train & compete",
    body: "Puzzles with skill radar, structured courses, and arena tournaments on the calendar.",
  },
  {
    title: "Review every game",
    body: "Post-game stats, evaluation charts, and deeper analysis when you want to level up.",
  },
];

export function DChessLanding() {
  const { data } = useQuery<{ platformMetrics: { playersTotal: number; playingNow: number } }>(PLATFORM_METRICS, {
    fetchPolicy: "cache-first",
  });
  const players = data?.platformMetrics?.playersTotal;
  const live = data?.platformMetrics?.playingNow;

  return (
    <Box minH="100vh" bg="bgDark" color="textPrimary">
      <Box as="header" borderBottomWidth="1px" borderColor="whiteAlpha.100" bg="rgba(10, 14, 26, 0.92)" backdropFilter="blur(8px)" position="sticky" top={0} zIndex={10}>
        <Container maxW="6xl" py={4}>
          <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
            <Link href="/">
              <Heading size="md" fontFamily="var(--font-playfair), Georgia, serif" color="gold" fontWeight="600">
                {APP_NAME}
              </Heading>
            </Link>
            <HStack gap={{ base: 2, md: 6 }} flexWrap="wrap" justify="flex-end">
              <Link href="#features">
                <Text fontSize="sm" color="textSecondary" _hover={{ color: "gold" }} display={{ base: "none", sm: "block" }}>
                  Features
                </Text>
              </Link>
              <Link href="/about">
                <Text fontSize="sm" color="textSecondary" _hover={{ color: "gold" }} display={{ base: "none", md: "block" }}>
                  About
                </Text>
              </Link>
              <Link href="/contact">
                <Text fontSize="sm" color="textSecondary" _hover={{ color: "gold" }}>
                  Contact
                </Text>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm" color="gold">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" bg="gold" color="bgDark" borderRadius="soft" _hover={{ bg: "goldLight" }}>
                  Register
                </Button>
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Box
        as="section"
        pt={{ base: 14, md: 20 }}
        pb={{ base: 16, md: 24 }}
        px={4}
        bg="linear-gradient(165deg, #0a0e1a 0%, #141b2e 45%, #0a0e1a 100%)"
      >
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 12, lg: 16 }} alignItems="center">
            <VStack align={{ base: "center", lg: "start" }} gap={6} textAlign={{ base: "center", lg: "left" }}>
              <Text fontSize="sm" color="gold" fontWeight="600" letterSpacing="wider" textTransform="uppercase">
                Welcome
              </Text>
              <Heading
                as="h1"
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize={{ base: "2.5rem", md: "3.5rem", lg: "4rem" }}
                lineHeight="1.1"
                fontWeight="600"
                color="textPrimary"
              >
                Chess training & play, built for serious learners
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} color="textSecondary" maxW="xl">
                {APP_NAME} brings together games, puzzles, tournaments, and analysis — whether you&apos;re sharpening tactics or
                competing in arenas.
              </Text>
              <HStack gap={3} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }} pt={2}>
                <Link href="/login">
                  <Button size="lg" bg="gold" color="bgDark" borderRadius="soft" px={8} _hover={{ bg: "goldLight" }}>
                    Get started
                  </Button>
                </Link>
                <Link href="/tournaments">
                  <Button size="lg" variant="outline" borderColor="whiteAlpha.300" color="textPrimary" borderRadius="soft" _hover={{ borderColor: "gold", color: "gold" }}>
                    Browse tournaments
                  </Button>
                </Link>
              </HStack>
              {(players != null || live != null) && (
                <HStack gap={8} pt={4} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                  <VStack align={{ base: "center", lg: "start" }} gap={0}>
                    <Text fontSize="2xl" fontWeight="800" color="gold">
                      {players != null ? players.toLocaleString() : "—"}
                    </Text>
                    <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wider">
                      Players on platform
                    </Text>
                  </VStack>
                  <VStack align={{ base: "center", lg: "start" }} gap={0}>
                    <Text fontSize="2xl" fontWeight="800" color="accentGreen">
                      {live != null ? live.toLocaleString() : "—"}
                    </Text>
                    <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wider">
                      Playing now
                    </Text>
                  </VStack>
                </HStack>
              )}
            </VStack>

            <Box
              borderRadius="soft"
              bg="bgCard"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              p={{ base: 8, md: 10 }}
              boxShadow="0 24px 80px rgba(0,0,0,0.35)"
            >
              <svg viewBox="0 0 320 280" width="100%" height="auto" aria-hidden fill="none">
                <path
                  d="M40 220 L160 40 L280 220 Z"
                  stroke="#e6a452"
                  strokeWidth="1.5"
                  opacity={0.35}
                />
                <circle cx="160" cy="120" r="48" stroke="#e6a452" strokeWidth="2" fill="none" opacity={0.6} />
                <path
                  d="M120 200 h80 M140 160 h40 M150 140 h20"
                  stroke="#a8b0c4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <text x="160" y="255" textAnchor="middle" fill="#e6a452" fontSize="14" fontFamily="Georgia, serif">
                  Think deeper. Play stronger.
                </text>
              </svg>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      <Box id="features" as="section" py={{ base: 16, md: 20 }} px={4} scrollMarginTop="80px">
        <Container maxW="6xl">
          <VStack align="stretch" gap={10}>
            <VStack align={{ base: "center", md: "start" }} gap={2} textAlign={{ base: "center", md: "left" }}>
              <Heading fontFamily="var(--font-playfair), Georgia, serif" size="xl" color="gold">
                Everything in one academy
              </Heading>
              <Text color="textSecondary" maxW="2xl">
                No login required to explore the site. Sign in when you&apos;re ready to play, track ratings, and join tournaments.
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
              {FEATURES.map((f) => (
                <Box
                  key={f.title}
                  p={6}
                  borderRadius="soft"
                  bg="bgCard"
                  borderWidth="1px"
                  borderColor="whiteAlpha.080"
                  transition="border-color 0.2s"
                  _hover={{ borderColor: "goldDark" }}
                >
                  <Text fontWeight="700" color="textPrimary" fontSize="lg" mb={2}>
                    {f.title}
                  </Text>
                  <Text fontSize="sm" color="textSecondary" lineHeight="tall">
                    {f.body}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      <Box as="section" py={{ base: 14, md: 18 }} px={4} bg="bgCard" borderTopWidth="1px" borderColor="whiteAlpha.060">
        <Container maxW="6xl" textAlign="center">
          <Heading fontFamily="var(--font-playfair), Georgia, serif" size="lg" color="textPrimary" mb={3}>
            Ready to join?
          </Heading>
          <Text color="textSecondary" mb={6} maxW="lg" mx="auto">
            Create a free account or sign in to access your dashboard, puzzles, and live events.
          </Text>
          <HStack gap={4} justify="center" flexWrap="wrap">
            <Link href="/login">
              <Button bg="gold" color="bgDark" borderRadius="soft" size="lg" _hover={{ bg: "goldLight" }}>
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" borderColor="gold" color="gold" borderRadius="soft" size="lg">
                Create account
              </Button>
            </Link>
          </HStack>
        </Container>
      </Box>

      <Box as="footer" py={10} px={4} borderTopWidth="1px" borderColor="whiteAlpha.080">
        <Container maxW="6xl">
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "center", md: "flex-start" }} gap={6}>
            <VStack align={{ base: "center", md: "start" }} gap={1}>
              <Text fontFamily="var(--font-playfair), Georgia, serif" color="gold" fontWeight="600">
                {APP_NAME}
              </Text>
              <Text fontSize="sm" color="textMuted">
                Discipline · Strategy · Growth
              </Text>
            </VStack>
            <HStack gap={6} flexWrap="wrap" justify="center">
              <Link href="/regulations">
                <Text fontSize="sm" color="textSecondary" _hover={{ color: "gold" }}>
                  Terms
                </Text>
              </Link>
              <Link href="/contact">
                <Text fontSize="sm" color="textSecondary" _hover={{ color: "gold" }}>
                  Privacy & contact
                </Text>
              </Link>
              <Link href="/about">
                <Text fontSize="sm" color="textSecondary" _hover={{ color: "gold" }}>
                  About us
                </Text>
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
