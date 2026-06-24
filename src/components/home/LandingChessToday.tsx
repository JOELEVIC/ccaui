"use client";

import { Box, Container, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import chessToday from "@/data/chess-today.json";

const MotionBox = motion.create(Box);

interface ChessEvent {
  id: string;
  title: string;
  subtitle: string | null;
  status: "live" | "upcoming" | "recent";
  location: string | null;
  format: string | null;
  dateLabel: string;
  url: string;
  image: string | null;
}

const DATA = chessToday as { updated: string; events: ChessEvent[] };

const STATUS = {
  live: { label: "Live now", color: "var(--accent-green)", dot: true },
  upcoming: { label: "Upcoming", color: "var(--gold)", dot: false },
  recent: { label: "Recent", color: "var(--foreground-muted)", dot: false },
} as const;

/**
 * "Chess Today" — a real, refreshable window into the chess world right now,
 * built from Lichess's open broadcast API (see scripts/fetch-chess-today.mjs).
 * Pairs with the Legends gallery: history on one side, today on the other.
 */
export function LandingChessToday() {
  const events = DATA.events ?? [];
  if (events.length === 0) return null;

  return (
    <Box py={{ base: 14, md: 24 }} bg="bgWarm">
      <Container maxW="6xl">
        <VStack gap={3} mb={{ base: 8, md: 12 }} textAlign="center">
          <Text fontSize="xs" color="gold" fontWeight="700" letterSpacing="0.22em" textTransform="uppercase">
            Chess Today
          </Text>
          <Heading
            size={{ base: "lg", md: "xl" }}
            fontFamily="var(--font-playfair), Georgia, serif"
            color="textPrimary"
            fontWeight="600"
            lineHeight="1.1"
          >
            Live from the chess world
          </Heading>
          <Box h="1px" w="64px" bg="gold" opacity={0.8} />
          <Text color="textSecondary" fontSize={{ base: "sm", md: "md" }} maxW="lg" lineHeight="1.6">
            Elite tournaments happening right now — from the African Championship to
            world title events. Follow any board, live.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 4, md: 6 }}>
          {events.map((e) => {
            const s = STATUS[e.status];
            return (
              <a
                key={e.id}
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", display: "block" }}
              >
              <MotionBox
                whileHover={{ y: -5 }}
                display="block"
                borderRadius="xl2"
                overflow="hidden"
                bg="bgCard"
                borderWidth="1px"
                borderColor="blackAlpha.200"
                boxShadow="var(--shadow-card-soft)"
                _hover={{ boxShadow: "var(--shadow-card-soft-hover)", borderColor: "gold" }}
              >
                {/* Thumbnail */}
                <Box position="relative" w="full" style={{ aspectRatio: "16 / 9" }} bg="bgWarm" overflow="hidden">
                  {e.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.image}
                      alt={e.title}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center" color="gold" fontSize="3xl">
                      ♟
                    </Box>
                  )}
                  {/* status pill */}
                  <HStack
                    position="absolute"
                    top={3}
                    left={3}
                    gap={1.5}
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    bg="rgba(255,255,255,0.92)"
                    style={{ backdropFilter: "blur(4px)" }}
                  >
                    {s.dot && (
                      <Box className="cca-live-dot" w="6px" h="6px" borderRadius="full" style={{ background: s.color }} />
                    )}
                    <Text fontSize="2xs" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase" style={{ color: s.color }}>
                      {s.label}
                    </Text>
                  </HStack>
                </Box>

                {/* Body */}
                <Box p={{ base: 4, md: 5 }}>
                  <Text
                    fontWeight="700"
                    color="textPrimary"
                    fontSize={{ base: "sm", md: "md" }}
                    lineHeight="1.25"
                    fontFamily="var(--font-playfair), Georgia, serif"
                  >
                    {e.title}
                  </Text>
                  {e.subtitle && (
                    <Text color="textMuted" fontSize="xs" mt={0.5}>
                      {e.subtitle}
                    </Text>
                  )}
                  <HStack gap={2} mt={3} flexWrap="wrap" color="textSecondary" fontSize="xs">
                    {e.location && <Text>📍 {e.location}</Text>}
                    <Text>· {e.dateLabel}</Text>
                  </HStack>
                  <Text color="gold" fontSize="xs" fontWeight="600" mt={3}>
                    Follow on Lichess →
                  </Text>
                </Box>
              </MotionBox>
              </a>
            );
          })}
        </SimpleGrid>

        <Text color="textMuted" fontSize="2xs" mt={6} textAlign="center">
          Live data from the Lichess broadcast API · refreshed periodically.
        </Text>
      </Container>
    </Box>
  );
}
