"use client";

import { Box, Container, Heading, Text, VStack, HStack, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";

export function LandingHero() {
  return (
    <Box
      position="relative"
      minH="100vh"
      display="flex"
      alignItems="center"
      bg="bgDark"
      overflow="hidden"
    >
      {/* Warm gradient base (add /images/hero.jpg for optional full-bleed hero image) */}
      <Box
        position="absolute"
        inset={0}
        sx={{
          background: "linear-gradient(180deg, #13151a 0%, #15181f 50%, #171a22 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Softer vignette */}
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        sx={{
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(17,19,24,0.85) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Very faint chessboard overlay */}
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        opacity={0.04}
        sx={{
          backgroundImage: `
            linear-gradient(to right, var(--chakra-colors-gold) 1px, transparent 1px),
            linear-gradient(to bottom, var(--chakra-colors-gold) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <Container position="relative" zIndex={2} maxW="6xl" py={{ base: 16, md: 20 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={{ base: 12, lg: 8 }}
        >
          <VStack align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }} gap={6} flex={1} maxW={{ lg: "50%" }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ width: "100%" }}
            >
              <Heading
                as="h1"
                size={{ base: "2xl", md: "4xl" }}
                fontFamily="var(--font-playfair), Georgia, serif"
                color="textPrimary"
                fontWeight="600"
                letterSpacing="0.05em"
                textTransform="uppercase"
                lineHeight="1.1"
              >
                <Box as="span" position="relative" display="inline-block">
                  Cameroon
                  <Box
                    position="absolute"
                    left={0}
                    right={0}
                    bottom="-4px"
                    h="3px"
                    display="flex"
                    sx={{ gap: "2px" }}
                  >
                    <Box w="33.33%" h="full" bg="cameroonGreen" borderRadius="full" />
                    <Box w="33.33%" h="full" bg="cameroonRed" borderRadius="full" />
                    <Box w="33.33%" h="full" bg="cameroonYellow" borderRadius="full" />
                  </Box>
                </Box>{" "}
                Chess Academy
              </Heading>
              <Box mt={5} h="2px" w="80px" bg="gold" opacity={0.9} sx={{ animation: "shimmer 3s ease-in-out infinite" }} />
              <Text color="textSecondary" fontSize="lg" lineHeight="1.6" mt={4} maxW="md">
                Where Cameroon&apos;s best minds meet over the board.
              </Text>
              <Heading
                as="h2"
                size="sm"
                color="textMuted"
                fontWeight="400"
                letterSpacing="0.02em"
                mt={2}
              >
                National Platform for Competitive Excellence
              </Heading>
              <Text color="textMuted" fontSize="sm" lineHeight="1.5" mt={1} maxW="md">
                Strategy, discipline, and mastery define the future of chess.
              </Text>
            </motion.div>
            <HStack gap={4} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }} pt={2}>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  borderWidth="2px"
                  borderColor="gold"
                  bg="bgSurface"
                  color="gold"
                  fontWeight="600"
                  px={8}
                  borderRadius="soft"
                  boxShadow="var(--shadow-card-soft)"
                  _hover={{
                    borderColor: "goldLight",
                    boxShadow: "0 0 24px rgba(201, 169, 110, 0.2)",
                  }}
                  transition="all 0.2s"
                >
                  Enter the Arena
                </Button>
              </Link>
              <Link href="/rankings">
                <Button
                  size="lg"
                  variant="ghost"
                  color="textSecondary"
                  fontWeight="500"
                  px={8}
                  borderRadius="soft"
                  _hover={{ color: "gold" }}
                  transition="color 0.2s"
                >
                  View National Rankings
                </Button>
              </Link>
            </HStack>
          </VStack>

          {/* Right: hero image or chessboard visual */}
          <Box flex={1} display={{ base: "none", lg: "block" }} maxW="400px" position="relative">
            <Box
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              position="relative"
              sx={{
                aspectRatio: "1",
                borderRadius: "var(--radius-soft)",
                border: "1px solid var(--chakra-colors-goldDark)",
                boxShadow: "var(--shadow-card-soft)",
                overflow: "hidden",
              }}
            >
              <Box
                position="absolute"
                inset={0}
                sx={{
                  background: "linear-gradient(145deg, #1e1a16 0%, #15181f 100%)",
                  backgroundImage: `
                    linear-gradient(to right, rgba(143,121,61,0.35) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(143,121,61,0.35) 1px, transparent 1px)
                  `,
                  backgroundSize: "12.5% 12.5%",
                }}
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                fontSize="4rem"
                color="gold"
                opacity={0.25}
                aria-hidden
              >
                ♔
              </Box>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
