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
      {/* Vignette edges */}
      <Box
        position="absolute"
        inset={0}
        sx={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(15,17,21,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Very faint chessboard overlay 3–5% */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.04}
        sx={{
          backgroundImage: `
            linear-gradient(to right, var(--chakra-colors-gold) 1px, transparent 1px),
            linear-gradient(to bottom, var(--chakra-colors-gold) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <Container position="relative" zIndex={1} maxW="6xl" py={{ base: 16, md: 20 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={{ base: 12, lg: 8 }}
        >
          {/* Left: copy */}
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
                Cameroon Chess Academy
              </Heading>
              <Box
                mt={3}
                h="2px"
                w="80px"
                bg="gold"
                opacity={0.9}
                sx={{ animation: "shimmer 3s ease-in-out infinite" }}
              />
              <Heading
                as="h2"
                size="md"
                color="textSecondary"
                fontWeight="400"
                letterSpacing="0.02em"
                mt={4}
              >
                National Platform for Competitive Excellence
              </Heading>
              <Text color="textSecondary" fontSize="lg" lineHeight="1.6" mt={2} maxW="md">
                Where strategy, discipline, and mastery define the future of chess.
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
                  borderRadius="cca"
                  _hover={{
                    borderColor: "goldLight",
                    boxShadow: "0 0 20px rgba(198, 167, 94, 0.15)",
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
                  _hover={{ color: "gold" }}
                  transition="color 0.2s"
                >
                  View National Rankings
                </Button>
              </Link>
            </HStack>
          </VStack>

          {/* Right: elegant chessboard visual */}
          <Box
            flex={1}
            display={{ base: "none", lg: "block" }}
            maxW="400px"
            position="relative"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                position: "relative",
                aspectRatio: 1,
                background: "linear-gradient(145deg, #1a1510 0%, #0f1115 100%)",
                borderRadius: 6,
                border: "1px solid var(--chakra-colors-goldDark)",
                boxShadow: "0 0 40px rgba(143, 121, 61, 0.1), inset 0 0 60px rgba(0,0,0,0.3)",
                overflow: "hidden",
              }}
            >
              <Box
                position="absolute"
                inset={0}
                sx={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(143,121,61,0.4) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(143,121,61,0.4) 1px, transparent 1px)
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
            </motion.div>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
