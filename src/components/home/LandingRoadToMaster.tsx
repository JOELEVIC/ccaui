"use client";

import { Box, Button, Container, Flex, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerChild, defaultViewport } from "@/lib/animations";
import { R2M_TIERS } from "@/lib/r2m";

const QUESTS = [
  {
    title: "Daily Grind",
    body: "Solve 10 tactics in a row · clean streak.",
    xp: 50,
    rank: "E",
  },
  {
    title: "Shadow Extract",
    body: "Open one lost game and find the turning point.",
    xp: 60,
    rank: "D",
  },
  {
    title: "Theory Session",
    body: "Drill 15 minutes of an opening you actually play.",
    xp: 40,
    rank: "C",
  },
];

export function LandingRoadToMaster() {
  return (
    <Box
      py={{ base: 16, md: 24 }}
      bg="bgCard"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset={0}
        background="radial-gradient(ellipse at 80% 30%, rgba(230,164,82,0.10) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.05) 0%, transparent 55%)"
        pointerEvents="none"
      />
      <Container maxW="6xl" position="relative" zIndex={1}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 12, lg: 16 }}
          align={{ base: "stretch", lg: "flex-start" }}
        >
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            style={{ flex: 1 }}
          >
            <VStack align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }} gap={6}>
              <Text
                fontSize="xs"
                color="gold"
                fontWeight="600"
                letterSpacing="0.08em"
                textTransform="uppercase"
              >
                The Road to Master
              </Text>
              <Heading
                size={{ base: "xl", md: "2xl" }}
                fontFamily="var(--font-playfair), Georgia, serif"
                color="textPrimary"
                lineHeight="1.1"
                fontWeight="600"
              >
                Climb from{" "}
                <Box as="span" color="gold">
                  E to SS
                </Box>
                .{" "}
                <Box as="span" color="textSecondary" display={{ base: "block", lg: "inline" }}>
                  One quest at a time.
                </Box>
              </Heading>
              <Text color="textSecondary" fontSize="lg" lineHeight="1.65" maxW="lg">
                Every puzzle, drill, and game feeds an XP system that mirrors your real chess strength.
                Daily quests gate your progress; ranks unlock new openings, endgames, and master studies.
              </Text>
              <HStack gap={3} pt={2} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                <Link href="/road-to-master">
                  <Button
                    size="lg"
                    bg="gold"
                    color="bgDark"
                    borderRadius="soft"
                    px={8}
                    _hover={{ bg: "goldLight", boxShadow: "0 0 28px rgba(230,164,82,0.4)" }}
                  >
                    Open the System
                  </Button>
                </Link>
                <Link href="/learning">
                  <Button
                    size="lg"
                    variant="outline"
                    borderColor="whiteAlpha.300"
                    color="textPrimary"
                    borderRadius="soft"
                    _hover={{ borderColor: "gold", color: "gold" }}
                  >
                    Browse the curriculum
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </motion.div>

          <Box flex={1} w="full">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
            >
              <Box
                p={5}
                borderRadius="soft"
                bg="rgba(10,14,26,0.7)"
                borderWidth="1px"
                borderColor="whiteAlpha.080"
                backdropFilter="blur(8px)"
                boxShadow="0 24px 80px rgba(0,0,0,0.45)"
              >
                <Text fontSize="xs" color="textMuted" letterSpacing="wider" textTransform="uppercase" mb={3}>
                  Rank ladder
                </Text>
                <HStack gap={2} mb={6} flexWrap="wrap">
                  {R2M_TIERS.map((t, i) => (
                    <motion.div key={t.rank} variants={staggerChild}>
                      <Box
                        px={3}
                        py={2}
                        borderRadius="md"
                        bg={i === 0 ? `${t.color}24` : "bgDark"}
                        borderWidth="1px"
                        borderColor={i === 0 ? t.color : "whiteAlpha.080"}
                        boxShadow={i === 0 ? `0 0 14px ${t.color}55` : undefined}
                      >
                        <Text fontWeight="700" color={t.color} fontSize="sm">
                          {t.rank}
                        </Text>
                        <Text fontSize="xs" color="textMuted">
                          {t.label}
                        </Text>
                      </Box>
                    </motion.div>
                  ))}
                </HStack>
                <Text fontSize="xs" color="textMuted" letterSpacing="wider" textTransform="uppercase" mb={3}>
                  Today&apos;s quests
                </Text>
                <VStack align="stretch" gap={2}>
                  {QUESTS.map((q, i) => (
                    <motion.div key={q.title} variants={staggerChild}>
                      <HStack
                        p={3}
                        borderRadius="md"
                        bg="bgDark"
                        borderWidth="1px"
                        borderColor="whiteAlpha.080"
                        justify="space-between"
                      >
                        <HStack gap={3} align="flex-start">
                          <Box
                            mt={1}
                            w="22px"
                            h="22px"
                            borderRadius="md"
                            bg="goldDark"
                            color="gold"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {i + 1}
                          </Box>
                          <Box>
                            <Text color="textPrimary" fontWeight="600" fontSize="sm">
                              {q.title}
                            </Text>
                            <Text color="textSecondary" fontSize="xs">
                              {q.body}
                            </Text>
                          </Box>
                        </HStack>
                        <Box
                          px={2.5}
                          py={1}
                          borderRadius="full"
                          bg="rgba(230,164,82,0.10)"
                          borderWidth="1px"
                          borderColor="goldDark"
                        >
                          <Text fontSize="xs" color="gold" fontWeight="700">
                            +{q.xp} XP
                          </Text>
                        </Box>
                      </HStack>
                    </motion.div>
                  ))}
                </VStack>

                <Box
                  mt={5}
                  p={3}
                  borderRadius="md"
                  bg="bgDark"
                  borderWidth="1px"
                  borderColor="whiteAlpha.080"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xs" color="textMuted" letterSpacing="wider" textTransform="uppercase">
                      Toward D · Apprentice
                    </Text>
                    <Text fontSize="xs" color="textMuted">
                      24% · 760 pts to go
                    </Text>
                  </HStack>
                  <Box h="6px" borderRadius="full" bg="whiteAlpha.080" overflow="hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "24%" }}
                      viewport={defaultViewport}
                      transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        height: "100%",
                        background: "linear-gradient(90deg, #e6a452 0%, #f0b870 100%)",
                        boxShadow: "0 0 12px rgba(230,164,82,0.6)",
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Flex>

        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mt={{ base: 12, lg: 16 }}>
            {[
              { tag: "Tactics", body: "Curated puzzle ladder by theme — pin, fork, mating attack, defence." },
              { tag: "Endgames", body: "Lucena, Philidor, K+P opposition — drill against the engine until automatic." },
              { tag: "Theory", body: "Opening repertoire builder grouped by your favourite legends." },
            ].map((c) => (
              <Box
                key={c.tag}
                p={5}
                bg="bgDark"
                borderRadius="soft"
                borderWidth="1px"
                borderColor="whiteAlpha.080"
                _hover={{ borderColor: "goldDark" }}
                transition="border-color 0.2s"
              >
                <Text
                  fontSize="xs"
                  color="gold"
                  fontWeight="700"
                  letterSpacing="wider"
                  textTransform="uppercase"
                  mb={2}
                >
                  {c.tag}
                </Text>
                <Text color="textSecondary" fontSize="sm" lineHeight="1.6">
                  {c.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </motion.div>
      </Container>
    </Box>
  );
}
