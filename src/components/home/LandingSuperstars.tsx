"use client";

import { Box, Container, Heading, Text, VStack, SimpleGrid } from "@chakra-ui/react";

const SUPERSTARS = [
  { name: "Magnus Carlsen", title: "World Champion", quote: "Replace with approved quote." },
  { name: "Judit Polgár", title: "Legend", quote: "Replace with approved quote." },
  { name: "Vishy Anand", title: "World Champion", quote: "Replace with approved quote." },
];

export function LandingSuperstars() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="bgDark">
      <Container maxW="6xl">
        <VStack gap={10} align="stretch">
          <VStack gap={2}>
            <Heading
              size="lg"
              fontFamily="var(--font-playfair), Georgia, serif"
              color="textPrimary"
              letterSpacing="0.03em"
              textTransform="uppercase"
              textAlign="center"
            >
              Inspired by greatness
            </Heading>
            <Box h="1px" w="64px" bg="gold" opacity={0.8} />
            <Text color="textMuted" fontSize="sm" textAlign="center" maxW="md">
              Global standards. Replace with licensed images and approved quotes.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
            {SUPERSTARS.map((person) => (
              <Box
                key={person.name}
                p={6}
                borderRadius="soft"
                bg="bgCard"
                borderWidth="1px"
                borderColor="goldDark"
                boxShadow="var(--shadow-card-soft)"
                _hover={{ boxShadow: "var(--shadow-card-soft-hover)" }}
                transition="all 0.2s"
              >
                <Box
                  w="72px"
                  h="72px"
                  borderRadius="full"
                  bg="goldDark"
                  color="gold"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="xl"
                  mb={4}
                >
                  {person.name.charAt(0)}
                </Box>
                <Box h="1px" w="24px" bg="gold" opacity={0.8} mb={3} />
                <Heading size="sm" color="textPrimary" fontWeight="600">
                  {person.name}
                </Heading>
                <Text color="gold" fontSize="xs" fontWeight="600" mt={1}>
                  {person.title}
                </Text>
                <Text color="textMuted" fontSize="sm" mt={2} lineHeight="1.5">
                  {person.quote}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
