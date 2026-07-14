"use client";

import { Box, Container, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { players2 } from "@/assets/images/ubca";
import { fadeInUp, staggerContainer, staggerChild, defaultViewport } from "@/lib/animations";
import { SectionAtmosphere } from "./SectionAtmosphere";

/**
 * Single "who we are" band — merges what used to be five separate sections
 * (story, stats counters, photo gallery, testimonials, national-authority
 * pillars) into one. The landing tells each story once.
 */
const PILLARS = [
  {
    title: "Certified tournaments",
    body: "Officially sanctioned competitions with clear rules and fair play.",
  },
  {
    title: "Schools & universities",
    body: "Team leagues, regional standings, and printable certificates.",
  },
  {
    title: "A path to the top",
    body: "From your first club game to national representation.",
  },
];

export function LandingStory() {
  return (
    <Box py={{ base: 12, md: 24 }} bg="bgDark" position="relative" overflow="hidden">
      <SectionAtmosphere variant="scatter" opacity={0.03} />
      <Container maxW="6xl" position="relative" zIndex={1}>
        <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 10, lg: 16 }} align="center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            style={{ flex: 1, width: "100%" }}
          >
            <VStack align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }} gap={5}>
              <Text fontSize="xs" color="gold" fontWeight="600" letterSpacing="0.08em" textTransform="uppercase">
                Our story
              </Text>
              <Heading
                size={{ base: "xl", md: "2xl" }}
                fontFamily="var(--font-playfair), Georgia, serif"
                color="textPrimary"
                lineHeight="1.1"
                fontWeight="600"
              >
                Cameroon&apos;s home{" "}
                <Box as="span" color="gold">
                  for chess
                </Box>
              </Heading>
              <Text color="textSecondary" fontSize={{ base: "md", md: "lg" }} lineHeight="1.7" maxW="lg">
                CCA began as a small chess club and grew into a national home for the
                game — lessons, tournaments, school leagues, and a community that plays
                together. Whether you come to learn, to compete, or just to meet people
                who love the game, there&apos;s a seat at the board for you.
              </Text>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                style={{ width: "100%" }}
              >
                <VStack align="stretch" gap={3} pt={2}>
                  {PILLARS.map((p) => (
                    <motion.div key={p.title} variants={staggerChild}>
                      <HStack
                        p={3}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="blackAlpha.200"
                        bg="bgCard"
                        align="flex-start"
                        gap={3}
                      >
                        <Box color="gold" fontSize="md" mt={0.5} flexShrink={0}>
                          ♟
                        </Box>
                        <Box textAlign="left">
                          <Text color="textPrimary" fontWeight="600" fontSize="sm">
                            {p.title}
                          </Text>
                          <Text color="textSecondary" fontSize="xs" lineHeight="1.5">
                            {p.body}
                          </Text>
                        </Box>
                      </HStack>
                    </motion.div>
                  ))}
                </VStack>
              </motion.div>
            </VStack>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            style={{ flex: 1, width: "100%" }}
          >
            <VStack gap={4} w="full">
              <Box borderRadius="soft" overflow="hidden" w="full" position="relative" boxShadow="0 18px 50px rgba(26,37,48,0.18)">
                <Image
                  src={players2}
                  alt="Players at a Cameroon Chess Academy event"
                  style={{ width: "100%", height: "auto", display: "block" }}
                  placeholder="blur"
                />
              </Box>
              <Box
                p={5}
                borderRadius="soft"
                bg="bgCard"
                borderWidth="1px"
                borderColor="blackAlpha.200"
                w="full"
              >
                <Text color="textPrimary" fontSize="sm" lineHeight="1.7" fontStyle="italic">
                  “CCA has such a welcoming vibe. I&apos;ve made new friends and learned a
                  lot during tournaments. Love this platform for chess and more!”
                </Text>
                <Text color="textMuted" fontSize="xs" mt={2}>
                  Student player · Yaoundé
                </Text>
              </Box>
            </VStack>
          </motion.div>
        </Flex>
      </Container>
    </Box>
  );
}
