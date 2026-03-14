"use client";

import { Box, Container, SimpleGrid, VStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/common/SectionHeader";
import { fadeInUp, staggerContainer, staggerChild, defaultViewport } from "@/lib/animations";

const FEATURES = [
  {
    icon: "♔",
    title: "Chess mastery",
    description: "Sharpen your mind with engaging chess games and strategies",
    href: "/games",
  },
  {
    icon: "🏆",
    title: "Tournaments",
    description: "Compete, win, and celebrate achievements with fellow players",
    href: "/tournaments",
  },
  {
    icon: "🧩",
    title: "Tactical training",
    description: "Daily puzzles and themed training at your own pace",
    href: "/learning",
  },
  {
    icon: "🤝",
    title: "Community hub",
    description: "Connect, relax, and build friendships in a friendly space",
    href: "/schools",
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
              subtitle="At CCA, we cherish the joy of shared games and thoughtful play. Our team works to create a lively space for chess fans to meet, learn, and relax."
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
                      borderColor="whiteAlpha.06"
                      align="flex-start"
                      gap={3}
                      h="full"
                      textAlign="left"
                      _hover={{
                        borderColor: "gold",
                        boxShadow: "var(--shadow-card-soft-hover)",
                        transform: "translateY(-2px)",
                      }}
                      transition="all 0.2s"
                    >
                      <Box
                        w="48px"
                        h="48px"
                        borderRadius="cca"
                        bg="goldDark"
                        color="gold"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xl"
                      >
                        {f.icon}
                      </Box>
                      <Text color="gold" fontWeight="600" fontSize="md">
                        {f.title}
                      </Text>
                      <Text color="textSecondary" fontSize="sm" lineHeight="1.6">
                        {f.description}
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
