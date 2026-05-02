"use client";

import { Box, Container, SimpleGrid, VStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/common/SectionHeader";
import { fadeInUp, staggerContainer, staggerChild, defaultViewport } from "@/lib/animations";
import { KingIcon, TrophyIcon, KnightIcon, RookIcon } from "./ChessIcons";

const FEATURES = [
  {
    Icon: KingIcon,
    title: "Rated play",
    description:
      "Bullet, Blitz, Rapid, and Classical with independent ratings. Live evaluation bar in review.",
    href: "/games",
    cta: "Find a game",
  },
  {
    Icon: TrophyIcon,
    title: "Tournaments",
    description:
      "Swiss arenas and round-robin events for institutions, schools, and the open community.",
    href: "/tournaments",
    cta: "See the calendar",
  },
  {
    Icon: KnightIcon,
    title: "Tactical training",
    description:
      "Daily puzzles, themed packs, and an in-browser engine review of every game you play.",
    href: "/learning",
    cta: "Solve puzzles",
  },
  {
    Icon: RookIcon,
    title: "Schools & federations",
    description:
      "Team rankings, school leagues, regional standings, and printable certificates.",
    href: "/schools",
    cta: "Browse schools",
  },
];

export function LandingIconFeatures() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="bgDark">
      <Container maxW="6xl">
        <VStack gap={12} align="stretch">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <SectionHeader
              label="Inspired by strategy"
              title="Connect curious minds through board play"
              subtitle="At Cameroon Chess Academy, every feature is built around the joy of focused play — and the slow, satisfying climb that comes with it."
              showDivider={true}
            />
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            style={{ width: "100%" }}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6} w="full">
              {FEATURES.map((f) => (
                <motion.div key={f.title} variants={staggerChild}>
                  <Link href={f.href}>
                    <VStack
                      p={6}
                      borderRadius="soft"
                      bg="bgCard"
                      borderWidth="1px"
                      borderColor="whiteAlpha.080"
                      align="flex-start"
                      gap={3}
                      h="full"
                      textAlign="left"
                      _hover={{
                        borderColor: "gold",
                        boxShadow: "0 18px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(230,164,82,0.15)",
                        transform: "translateY(-2px)",
                      }}
                      transition="all 0.2s"
                      backgroundImage="linear-gradient(150deg, rgba(230,164,82,0.04) 0%, rgba(20,27,46,0) 60%)"
                    >
                      <Box
                        w="48px"
                        h="48px"
                        borderRadius="cca"
                        bg="rgba(230,164,82,0.10)"
                        color="gold"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderWidth="1px"
                        borderColor="goldDark"
                      >
                        <f.Icon size={26} />
                      </Box>
                      <Text color="textPrimary" fontWeight="700" fontSize="md">
                        {f.title}
                      </Text>
                      <Text color="textSecondary" fontSize="sm" lineHeight="1.6">
                        {f.description}
                      </Text>
                      <Text color="gold" fontSize="xs" fontWeight="700" letterSpacing="wider" mt="auto">
                        {f.cta} →
                      </Text>
                    </VStack>
                  </Link>
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        </VStack>
      </Container>
    </Box>
  );
}
