"use client";

import { Box, Container, Heading, Text, VStack, SimpleGrid } from "@chakra-ui/react";

const PILLARS = [
  {
    title: "Institutional Governance",
    description: "Structured oversight and certified standards for academy operations and events.",
  },
  {
    title: "Certified Tournaments",
    description: "Officially sanctioned competitions with clear regulations and fair play.",
  },
  {
    title: "Structured Player Development",
    description: "Pathways from university play to national representation and mastery.",
  },
];

function PillarIcon() {
  return (
    <Box
      w="24px"
      h="24px"
      borderRadius="4px"
      borderWidth="1px"
      borderColor="gold"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      <Box w="8px" h="8px" bg="gold" opacity={0.8} borderRadius="2px" />
    </Box>
  );
}

export function LandingAcademy() {
  return (
    <Box
      py={{ base: 16, md: 24 }}
      position="relative"
      bg="bgDark"
      overflow="hidden"
    >
      {/* Subtle gold radial glow center */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="gold"
        opacity={0.03}
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Container position="relative" zIndex={1} maxW="6xl">
        <VStack gap={12} align="stretch">
          <Heading
            size="lg"
            fontFamily="var(--font-playfair), Georgia, serif"
            color="textPrimary"
            letterSpacing="0.05em"
            textTransform="uppercase"
            textAlign="center"
          >
            The National Authority
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} w="full">
            {PILLARS.map((pillar) => (
              <VStack key={pillar.title} align="flex-start" gap={3} p={6} borderRadius="cca" bg="bgCard" borderWidth="1px" borderColor="goldDark">
                <Box display="flex" alignItems="center" gap={2}>
                  <PillarIcon />
                  <Heading size="sm" color="gold" fontWeight="600">
                    {pillar.title}
                  </Heading>
                </Box>
                <Text color="textSecondary" fontSize="sm" lineHeight="1.6">
                  {pillar.description}
                </Text>
                <Box h="1px" w="48px" bg="gold" opacity={0.6} />
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
