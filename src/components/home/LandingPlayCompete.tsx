"use client";

import { useState } from "react";
import { Box, Container, Heading, Text, VStack, Button, Flex, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, defaultViewport } from "@/lib/animations";
import { ShowcaseBoard } from "./ShowcaseBoard";

const HIGHLIGHTS: { title: string; body: string }[] = [
  {
    title: "Real-time ranked games",
    body: "Bullet, Blitz, Rapid, Classical — independent ratings, with a live evaluation bar in review.",
  },
  {
    title: "Arena tournaments",
    body: "Swiss and round-robin events for institutions and the open community, with arbiter tools.",
  },
  {
    title: "Schools league",
    body: "Team competitions with regional standings, seeded boards, and printable certificates.",
  },
];

export function LandingPlayCompete() {
  const [openingName, setOpeningName] = useState("Italian Game · Evans Gambit");

  return (
    <Box
      py={{ base: 16, md: 24 }}
      bg="bgDark"
      backgroundImage="radial-gradient(circle at 10% 20%, rgba(230,164,82,0.06) 0%, transparent 60%)"
    >
      <Container maxW="6xl">
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          gap={{ base: 12, lg: 16 }}
        >
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            style={{ flex: 1, width: "100%", maxWidth: 480 }}
          >
            <Box position="relative" w="full" maxW="440px" mx={{ base: "auto", lg: 0 }}>
              <ShowcaseBoard onLineChange={setOpeningName} />
              <Box
                mt={4}
                px={4}
                py={2}
                borderRadius="full"
                bg="rgba(20,27,46,0.8)"
                borderWidth="1px"
                borderColor="goldDark"
                display="inline-flex"
                alignItems="center"
                gap={2}
                backdropFilter="blur(8px)"
              >
                <Box w="6px" h="6px" borderRadius="full" bg="gold" boxShadow="0 0 8px var(--chakra-colors-gold)" />
                <Text fontSize="xs" color="textSecondary" letterSpacing="wider" textTransform="uppercase">
                  Now playing · {openingName}
                </Text>
              </Box>
            </Box>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            style={{ flex: 1 }}
          >
            <VStack
              align={{ base: "center", lg: "flex-start" }}
              textAlign={{ base: "center", lg: "left" }}
              gap={6}
            >
              <Text
                color="gold"
                fontSize="xs"
                fontWeight="600"
                letterSpacing="0.08em"
                textTransform="uppercase"
                fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
              >
                Play & compete
              </Text>
              <Heading
                size="xl"
                fontFamily="var(--font-playfair), Georgia, serif"
                color="textPrimary"
                letterSpacing="0.02em"
                lineHeight="1.15"
              >
                Compete on real boards, against real opponents
              </Heading>
              <Text color="textSecondary" fontSize="lg" lineHeight="1.65" maxW="lg">
                Live arenas, school leagues, and rated practice — the full chess workflow your academy
                runs on, with engine review for every game you finish.
              </Text>
              <VStack align="stretch" gap={3} w="full" maxW="md">
                {HIGHLIGHTS.map((h, i) => (
                  <motion.div
                    key={h.title}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={defaultViewport}
                    transition={{ duration: 0.45, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <HStack align="flex-start" gap={3}>
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
                        flexShrink={0}
                        fontSize="xs"
                        fontWeight="700"
                      >
                        {i + 1}
                      </Box>
                      <Box>
                        <Text color="textPrimary" fontWeight="600">
                          {h.title}
                        </Text>
                        <Text color="textSecondary" fontSize="sm" lineHeight="1.55">
                          {h.body}
                        </Text>
                      </Box>
                    </HStack>
                  </motion.div>
                ))}
              </VStack>
              <HStack gap={3} pt={2} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                <Link href="/games">
                  <Button
                    size="lg"
                    bg="gold"
                    color="bgDark"
                    fontWeight="600"
                    px={8}
                    borderRadius="soft"
                    _hover={{ bg: "goldLight", boxShadow: "0 0 24px rgba(230,164,82,0.35)" }}
                    transition="all 0.2s"
                  >
                    Start a match
                  </Button>
                </Link>
                <Link href="/tournaments">
                  <Button
                    size="lg"
                    variant="outline"
                    borderColor="whiteAlpha.300"
                    color="textPrimary"
                    borderRadius="soft"
                    _hover={{ borderColor: "gold", color: "gold" }}
                  >
                    Browse tournaments
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </motion.div>
        </Flex>
      </Container>
    </Box>
  );
}
