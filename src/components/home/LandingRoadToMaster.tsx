"use client";

import { Box, Button, Container, Flex, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerChild, defaultViewport } from "@/lib/animations";

const STEPS = [
  {
    title: "Learn",
    body: "Short lessons that teach one idea at a time — tactics, strategy, endgames.",
  },
  {
    title: "Practice",
    body: "Drill each idea against the engine and in puzzles tuned to your level.",
  },
  {
    title: "Review",
    body: "See your strongest and weakest areas, and exactly what to work on next.",
  },
];

export function LandingRoadToMaster() {
  const lessonsDone = 1;
  const lessonsTotal = 30;
  const pct = Math.round((lessonsDone / lessonsTotal) * 100);

  return (
    <Box py={{ base: 12, md: 24 }} bg="bgCard" position="relative" overflow="hidden">
      <Box
        position="absolute"
        inset={0}
        background="radial-gradient(ellipse at 80% 30%, rgba(197,160,89,0.10) 0%, transparent 60%)"
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
                Training
              </Text>
              <Heading
                size={{ base: "xl", md: "2xl" }}
                fontFamily="var(--font-playfair), Georgia, serif"
                color="textPrimary"
                lineHeight="1.1"
                fontWeight="600"
              >
                A clear, step-by-step path{" "}
                <Box as="span" color="gold">
                  to improvement
                </Box>
                .
              </Heading>
              <Text color="textSecondary" fontSize="lg" lineHeight="1.65" maxW="lg">
                Work through a structured curriculum at your own pace. Every puzzle, drill, and game
                feeds into clear progress and a focused plan for what to study next.
              </Text>
              <HStack gap={3} pt={2} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                <Link href="/road-to-master">
                  <Button
                    size="lg"
                    bg="gold"
                    color="white"
                    borderRadius="soft"
                    px={8}
                    _hover={{ bg: "goldLight" }}
                  >
                    Start training
                  </Button>
                </Link>
                <Link href="/learning">
                  <Button
                    size="lg"
                    variant="outline"
                    borderColor="blackAlpha.300"
                    color="textPrimary"
                    borderRadius="soft"
                    _hover={{ borderColor: "gold", color: "gold" }}
                  >
                    Browse lessons
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
                bg="bgCard"
                borderWidth="1px"
                borderColor="blackAlpha.200"
                boxShadow="0 12px 32px -16px rgba(26,37,48,0.18)"
              >
                <Text fontSize="xs" color="textMuted" letterSpacing="wider" textTransform="uppercase" mb={4}>
                  How it works
                </Text>
                <VStack align="stretch" gap={3}>
                  {STEPS.map((s, i) => (
                    <motion.div key={s.title} variants={staggerChild}>
                      <HStack p={3} borderRadius="md" borderWidth="1px" borderColor="blackAlpha.200" align="flex-start" gap={3}>
                        <Box
                          mt={0.5}
                          w="26px"
                          h="26px"
                          borderRadius="full"
                          bg="bgWarm"
                          color="textPrimary"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="sm"
                          fontWeight="600"
                          flexShrink={0}
                        >
                          {i + 1}
                        </Box>
                        <Box>
                          <Text color="textPrimary" fontWeight="600" fontSize="sm">
                            {s.title}
                          </Text>
                          <Text color="textSecondary" fontSize="xs" lineHeight="1.5">
                            {s.body}
                          </Text>
                        </Box>
                      </HStack>
                    </motion.div>
                  ))}
                </VStack>

                <Box mt={5} p={3} borderRadius="md" borderWidth="1px" borderColor="blackAlpha.200">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xs" color="textMuted" letterSpacing="wider" textTransform="uppercase">
                      Lesson progress
                    </Text>
                    <Text fontSize="xs" color="textMuted">
                      {lessonsDone} of {lessonsTotal} · {pct}%
                    </Text>
                  </HStack>
                  <Box h="6px" borderRadius="full" bg="blackAlpha.200" overflow="hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={defaultViewport}
                      transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: "100%", background: "#C5A059" }}
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
              { tag: "Tactics", body: "A curated puzzle ladder by theme — pins, forks, mating attacks, defense." },
              { tag: "Endgames", body: "Lucena, Philidor, K+P opposition — drill against the engine until automatic." },
              { tag: "Theory", body: "Build an opening repertoire grouped around the players you admire." },
            ].map((c) => (
              <Box
                key={c.tag}
                p={5}
                bg="bgCard"
                borderRadius="soft"
                borderWidth="1px"
                borderColor="blackAlpha.200"
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
