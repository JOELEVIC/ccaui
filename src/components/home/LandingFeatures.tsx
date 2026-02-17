"use client";

import { Box, Container, Heading, Text, SimpleGrid, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { Card } from "@chakra-ui/react";

const FEATURES = [
  {
    title: "Rated play",
    description: "Challenge players from your institution or the academy. Rated games, multiple time controls, and live boards.",
    href: "/register",
    cta: "Start playing",
  },
  {
    title: "Tournaments",
    description: "Join official CCA tournaments. Swiss or round-robin, school-based or open—compete and climb the standings.",
    href: "/tournaments",
    cta: "View tournaments",
  },
  {
    title: "Tactical training",
    description: "Daily puzzles and themed training. Sharpen tactics and endgames at your own pace.",
    href: "/learning",
    cta: "Try puzzles",
  },
  {
    title: "Schools & institutions",
    description: "Connect with your school, see leaderboards, and represent your region. Coaches and admins manage teams and events.",
    href: "/schools",
    cta: "Explore schools",
  },
];

function FeatureIcon() {
  return (
    <Box
      w="32px"
      h="32px"
      borderRadius="cca"
      borderWidth="1px"
      borderColor="gold"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      <Box w="6px" h="6px" bg="gold" opacity={0.8} borderRadius="2px" />
    </Box>
  );
}

export function LandingFeatures() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="bgDark">
      <Container maxW="6xl">
        <VStack gap={12} align="stretch">
          <VStack gap={3} textAlign="center" maxW="2xl" mx="auto">
            <Heading
              size="xl"
              fontFamily="var(--font-playfair), Georgia, serif"
              color="textPrimary"
            >
              Tools for competitive excellence
            </Heading>
            <Text color="textSecondary" fontSize="lg">
              One platform for players, coaches, and institutions.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} w="full">
            {FEATURES.map((f) => (
              <Link key={f.title} href={f.href}>
                <Card.Root
                  bg="bgCard"
                  borderWidth="1px"
                  borderColor="goldDark"
                  borderRadius="cca"
                  _hover={{
                    borderColor: "gold",
                    boxShadow: "0 0 20px rgba(198, 167, 94, 0.08)",
                  }}
                  transition="all 0.2s"
                  height="full"
                >
                  <Card.Body p={6}>
                    <Box display="flex" alignItems="flex-start" gap={3} mb={3}>
                      <FeatureIcon />
                      <Heading size="md" color="textPrimary" fontWeight="600">
                        {f.title}
                      </Heading>
                    </Box>
                    <Text color="textSecondary" fontSize="sm" lineHeight="1.6" mb={4}>
                      {f.description}
                    </Text>
                    <Text color="gold" fontSize="sm" fontWeight="600">
                      {f.cta} →
                    </Text>
                  </Card.Body>
                </Card.Root>
              </Link>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
