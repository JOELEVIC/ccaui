"use client";

import { Box, Container, SimpleGrid, VStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/common/SectionHeader";
import { fadeInUp, staggerContainer, staggerChild, defaultViewport } from "@/lib/animations";
import { KingIcon, TrophyIcon, KnightIcon } from "./ChessIcons";
import { SectionAtmosphere } from "./SectionAtmosphere";

const FEATURES = [
  {
    Icon: KingIcon,
    title: "Play",
    description:
      "Games for every mood — against friendly bots or real players, from one-minute thrillers to slow, thoughtful chess.",
    href: "/play",
    cta: "Play now",
  },
  {
    Icon: KnightIcon,
    title: "Learn",
    description:
      "Interactive lessons that start at “this is how a pawn moves”, daily puzzles, and clear feedback on every game you finish.",
    href: "/learn",
    cta: "Start learning",
  },
  {
    Icon: TrophyIcon,
    title: "Compete",
    description:
      "Official tournaments for schools, universities and the open community — with national rankings to climb.",
    href: "/tournaments",
    cta: "See tournaments",
  },
];

export function LandingIconFeatures() {
  return (
    <Box py={{ base: 12, md: 24 }} bg="bgDark" position="relative" overflow="hidden">
      <SectionAtmosphere variant="scatter" opacity={0.035} />
      <Container maxW="6xl" position="relative" zIndex={1}>
        <VStack gap={12} align="stretch">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            <SectionHeader
              label="What you can do here"
              title="Play, learn, and compete — at your level"
              subtitle="Whether you've never touched a pawn or you're chasing a national title, Cameroon Chess Academy has a place for you."
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
            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={6} w="full">
              {FEATURES.map((f) => (
                <motion.div key={f.title} variants={staggerChild}>
                  <Link href={f.href}>
                    <VStack
                      p={6}
                      borderRadius="soft"
                      bg="bgCard"
                      borderWidth="1px"
                      borderColor="blackAlpha.200"
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
