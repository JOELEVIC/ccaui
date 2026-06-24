"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Dialog,
  Flex,
  Heading,
  HStack,
  Portal,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import legendsData from "@/data/legends.json";

const MotionBox = motion.create(Box);

interface Legend {
  slug: string;
  name: string;
  country: string;
  flag: string;
  era: string;
  crown: string;
  peak: string | null;
  achievements: string[];
  why: string;
  blurb: string;
  image: string;
  credit: { artist: string; license: string; licenseUrl: string | null; source: string };
  wikipedia: string;
}

const LEGENDS = legendsData as Legend[];

/**
 * "Hall of Legends" — an immersive, relatable gallery of the players who
 * shaped the game. Photos are downloaded, licence-verified Wikimedia images
 * (see scripts/fetch-legends.mjs); every card credits its source. Tap a card
 * to reveal the story.
 */
export function LandingLegends() {
  const [selected, setSelected] = useState<Legend | null>(null);

  return (
    <Box id="legends" scrollMarginTop="80px" py={{ base: 14, md: 24 }} bg="bgDark">
      <Container maxW="6xl">
        <VStack gap={3} mb={{ base: 8, md: 12 }} textAlign="center">
          <Text
            fontSize="xs"
            color="gold"
            fontWeight="700"
            letterSpacing="0.22em"
            textTransform="uppercase"
          >
            Hall of Legends
          </Text>
          <Heading
            size={{ base: "lg", md: "xl" }}
            fontFamily="var(--font-playfair), Georgia, serif"
            color="textPrimary"
            fontWeight="600"
            lineHeight="1.1"
          >
            The players who shaped the game
          </Heading>
          <Box h="1px" w="64px" bg="gold" opacity={0.8} />
          <Text color="textSecondary" fontSize={{ base: "sm", md: "md" }} maxW="lg" lineHeight="1.6">
            From Morphy to Carlsen — and Africa&apos;s own trailblazers. Tap a face to
            discover who they were and why they matter.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={{ base: 3, md: 5 }}>
          {LEGENDS.map((p) => (
            <MotionBox
              key={p.slug}
              as="button"
              className="legend-card"
              onClick={() => setSelected(p)}
              whileHover={{ y: -5 }}
              position="relative"
              borderRadius="soft"
              overflow="hidden"
              cursor="pointer"
              textAlign="left"
              bg="bgCard"
              borderWidth="1px"
              borderColor="blackAlpha.200"
              boxShadow="var(--shadow-card-soft)"
              _hover={{ boxShadow: "var(--shadow-card-soft-hover)", borderColor: "gold" }}
              aria-label={`${p.name} — ${p.crown}`}
            >
              <Box position="relative" w="full" style={{ aspectRatio: "3 / 4" }} overflow="hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                    display: "block",
                  }}
                />
                {/* bottom scrim for legible text */}
                <Box
                  position="absolute"
                  inset={0}
                  pointerEvents="none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(26,37,48,0.86) 0%, rgba(26,37,48,0.30) 38%, transparent 62%)",
                  }}
                />
                <Box position="absolute" left={0} right={0} bottom={0} p={{ base: 2.5, md: 3 }}>
                  <Text fontSize="md" mb={0.5}>
                    {p.flag}
                  </Text>
                  <Text
                    color="white"
                    fontWeight="700"
                    fontSize={{ base: "sm", md: "md" }}
                    lineHeight="1.15"
                    fontFamily="var(--font-playfair), Georgia, serif"
                  >
                    {p.name}
                  </Text>
                  <Text color="rgba(255,255,255,0.8)" fontSize="2xs" mt={0.5} lineHeight="1.2">
                    {p.crown}
                  </Text>
                </Box>
              </Box>
            </MotionBox>
          ))}
        </SimpleGrid>

        <Text color="textMuted" fontSize="2xs" mt={6} textAlign="center">
          Photographs from Wikimedia Commons, reused under their respective Creative
          Commons / public-domain licences. Each profile credits its source.
        </Text>
      </Container>

      <LegendDialog legend={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}

/* ─────────────────────── expanded profile dialog ─────────────────────── */

function LegendDialog({ legend, onClose }: { legend: Legend | null; onClose: () => void }) {
  return (
    <Dialog.Root
      open={!!legend}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      size="lg"
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop
          style={{ background: "rgba(26,37,48,0.5)", backdropFilter: "blur(6px)" }}
        />
        <Dialog.Positioner>
          <Dialog.Content
            bg="bgCard"
            borderRadius="xl2"
            overflow="hidden"
            maxW={{ base: "94vw", md: "760px" }}
            borderWidth="1px"
            borderColor="blackAlpha.200"
            boxShadow="var(--shadow-card-soft-hover)"
          >
            {legend && (
              <Flex direction={{ base: "column", md: "row" }}>
                {/* Portrait */}
                <Box
                  flex="0 0 auto"
                  w={{ base: "full", md: "300px" }}
                  h={{ base: "260px", md: "auto" }}
                  position="relative"
                  bg="bgWarm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={legend.image}
                    alt={legend.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      display: "block",
                    }}
                  />
                </Box>

                {/* Details */}
                <Box flex="1" p={{ base: 5, md: 7 }} overflowY="auto" maxH={{ md: "78vh" }}>
                  <HStack justify="space-between" align="flex-start" mb={1}>
                    <Text fontSize="xl">{legend.flag}</Text>
                    <Dialog.CloseTrigger asChild>
                      <Box
                        as="button"
                        onClick={onClose}
                        w="32px"
                        h="32px"
                        borderRadius="full"
                        bg="bgWarm"
                        color="textSecondary"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        _hover={{ color: "gold" }}
                        aria-label="Close"
                      >
                        ✕
                      </Box>
                    </Dialog.CloseTrigger>
                  </HStack>

                  <Heading
                    size="lg"
                    fontFamily="var(--font-playfair), Georgia, serif"
                    color="textPrimary"
                    fontWeight="600"
                    lineHeight="1.1"
                  >
                    {legend.name}
                  </Heading>
                  <Text color="gold" fontWeight="700" fontSize="sm" mt={1}>
                    {legend.crown}
                  </Text>
                  <HStack gap={3} mt={1.5} flexWrap="wrap">
                    <Tag>{legend.country}</Tag>
                    <Tag>{legend.era}</Tag>
                    {legend.peak && <Tag>Peak {legend.peak}</Tag>}
                  </HStack>

                  <Text color="textSecondary" fontSize="sm" mt={4} lineHeight="1.6">
                    {legend.blurb}
                  </Text>

                  <Text
                    fontSize="2xs"
                    color="textMuted"
                    letterSpacing="0.16em"
                    textTransform="uppercase"
                    mt={5}
                    mb={2}
                  >
                    Why they matter
                  </Text>
                  <Text
                    color="textPrimary"
                    fontSize="sm"
                    fontStyle="italic"
                    fontFamily="var(--font-accent), var(--font-playfair), Georgia, serif"
                    lineHeight="1.6"
                  >
                    {legend.why}
                  </Text>

                  <VStack align="stretch" gap={2} mt={5}>
                    {legend.achievements.map((a) => (
                      <HStack key={a} align="flex-start" gap={2.5}>
                        <Box mt="7px" w="5px" h="5px" borderRadius="full" bg="gold" flexShrink={0} />
                        <Text color="textSecondary" fontSize="sm" lineHeight="1.5">
                          {a}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>

                  <Box borderTopWidth="1px" borderColor="blackAlpha.200" mt={6} pt={4}>
                    <HStack justify="space-between" flexWrap="wrap" gap={2}>
                      <Text fontSize="2xs" color="textMuted">
                        Photo:{" "}
                        <a href={legend.credit.source} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                          {legend.credit.artist || "Wikimedia"}
                        </a>{" "}
                        ·{" "}
                        {legend.credit.licenseUrl ? (
                          <a href={legend.credit.licenseUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                            {legend.credit.license}
                          </a>
                        ) : (
                          legend.credit.license
                        )}
                      </Text>
                      <a
                        href={legend.wikipedia}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 600 }}
                      >
                        Read more on Wikipedia →
                      </a>
                    </HStack>
                  </Box>
                </Box>
              </Flex>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontSize="2xs"
      color="textSecondary"
      bg="bgWarm"
      px={2.5}
      py={1}
      borderRadius="full"
      fontWeight="600"
      letterSpacing="0.02em"
    >
      {children}
    </Text>
  );
}
