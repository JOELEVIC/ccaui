"use client";

import { Box, Container, Heading, Text, VStack, HStack, Button, Flex, ListRoot, ListItem } from "@chakra-ui/react";
import Link from "next/link";

export function LandingPlayCompete() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="bgDark">
      <Container maxW="6xl">
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          gap={{ base: 10, lg: 16 }}
        >
          {/* Left: board preview */}
          <Box flex={1} w="full" maxW={{ lg: "420px" }} position="relative">
            <Box
              position="relative"
              sx={{
                aspectRatio: "1",
                background: "linear-gradient(145deg, #2a2420 0%, #1a1510 100%)",
                borderRadius: "cca",
                border: "1px solid var(--chakra-colors-goldDark)",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.4)",
                overflow: "hidden",
              }}
            >
              <Box
                position="absolute"
                inset={0}
                sx={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(143,121,61,0.5) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(143,121,61,0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: "12.5% 12.5%",
                }}
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                fontSize="3rem"
                color="gold"
                opacity={0.2}
                aria-hidden
              >
                ♟
              </Box>
            </Box>
          </Box>

          {/* Right: copy */}
          <VStack align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }} gap={6} flex={1}>
            <Heading
              size="xl"
              fontFamily="var(--font-playfair), Georgia, serif"
              color="textPrimary"
              letterSpacing="0.03em"
              textTransform="uppercase"
            >
              Compete at the Highest Level
            </Heading>
            <Text color="textSecondary" fontSize="lg" lineHeight="1.6" maxW="md">
              Engage in ranked matches, institutional tournaments, and national competitions.
            </Text>
            <ListRoot spacing={3} color="textSecondary">
              <ListItem display="flex" alignItems="center" gap={2}>
                <Box w="4px" h="4px" borderRadius="full" bg="gold" flexShrink={0} />
                Real-time ranked games
              </ListItem>
              <ListItem display="flex" alignItems="center" gap={2}>
                <Box w="4px" h="4px" borderRadius="full" bg="gold" flexShrink={0} />
                University tournaments
              </ListItem>
              <ListItem display="flex" alignItems="center" gap={2}>
                <Box w="4px" h="4px" borderRadius="full" bg="gold" flexShrink={0} />
                Regional championships
              </ListItem>
            </ListRoot>
            <Link href="/games">
              <Button
                size="lg"
                bg="gold"
                color="black"
                fontWeight="600"
                px={8}
                borderRadius="cca"
                _hover={{ bg: "goldLight", boxShadow: "0 0 20px rgba(198, 167, 94, 0.2)" }}
                transition="all 0.2s"
              >
                Start a Match
              </Button>
            </Link>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
}
