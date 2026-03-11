"use client";

import { Box, Container, Heading, Text, VStack, HStack, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { hero1, hero2 } from "@/assets/images/ubca";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { staggerContainer, staggerChild } from "@/lib/animations";

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
      {/* Full-bleed hero image */}
      <Box
        position="absolute"
        inset={0}
        bg="bgDark"
        backgroundImage={`url(${hero1.src})`}
        backgroundSize="cover"
        backgroundPosition="center"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        inset={0}
        background="linear-gradient(180deg, rgba(19,21,26,0.92) 0%, rgba(21,24,31,0.94) 50%, rgba(23,26,34,0.96) 100%)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        background="radial-gradient(ellipse at center, transparent 35%, rgba(17,19,24,0.85) 100%)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        opacity={0.04}
        backgroundImage="linear-gradient(to right, var(--chakra-colors-gold) 1px, transparent 1px), linear-gradient(to bottom, var(--chakra-colors-gold) 1px, transparent 1px)"
        backgroundSize="48px 48px"
      />

      <Container position="relative" zIndex={2} maxW="6xl" py={{ base: 16, md: 20 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={{ base: 12, lg: 8 }}
        >
          <VStack
            align={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            gap={6}
            flex={1}
            maxW={{ lg: "55%" }}
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ width: "100%" }}
            >
              <motion.div variants={staggerChild}>
                <Text
                  color="gold"
                  fontSize="xs"
                  fontWeight="600"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
                  mb={3}
                >
                  Inspired by strategy
                </Text>
              </motion.div>
              <motion.div variants={staggerChild}>
                <Heading
                  as="h1"
                  size={{ base: "2xl", md: "4xl" }}
                  fontFamily="var(--font-playfair), Georgia, serif"
                  color="textPrimary"
                  fontWeight="600"
                  letterSpacing="0.02em"
                  lineHeight="1.15"
                >
                  Unlock your full potential with chess
                </Heading>
              </motion.div>
              <motion.div variants={staggerChild}>
                <Text color="textSecondary" fontSize="lg" lineHeight="1.65" mt={4} maxW="md">
                  Join our community club for chess, board games, and a friendly space to think, learn, and connect.
                </Text>
              </motion.div>
              <motion.div variants={staggerChild}>
                <Box
                  mt={6}
                  p={4}
                  borderRadius="soft"
                  bg="whiteAlpha.05"
                  borderWidth="1px"
                  borderColor="goldDark"
                  display="inline-flex"
                  flexDir="column"
                  alignItems={{ base: "center", lg: "flex-start" }}
                  gap={1}
                >
                  <HStack gap={1} align="baseline">
                    <AnimatedCounter value={1} suffix="k+" fontSize="2xl" fontWeight="700" color="gold" />
                  </HStack>
                  <Text color="textMuted" fontSize="sm">
                    Discover fun and new friends at our chess academy
                  </Text>
                </Box>
              </motion.div>
              <motion.div variants={staggerChild}>
                <HStack gap={4} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }} mt={6}>
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
                  <Link href="/contact">
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
                      Have questions? Get in touch!
                    </Button>
                  </Link>
                </HStack>
              </motion.div>
            </motion.div>
          </VStack>

          <Box flex={1} display={{ base: "none", lg: "block" }} maxW="400px" position="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative", width: "100%" }}
            >
              <Box
                position="relative"
                aspectRatio="1"
                borderRadius="var(--radius-soft)"
                border="1px solid var(--chakra-colors-goldDark)"
                boxShadow="var(--shadow-card-soft)"
                overflow="hidden"
                bg="bgSurface"
                backgroundImage={`url(${hero2.src})`}
                backgroundSize="cover"
                backgroundPosition="center"
              >
                <Box
                  position="absolute"
                  inset={0}
                  background="linear-gradient(145deg, rgba(30,26,22,0.85) 0%, rgba(21,24,31,0.9) 100%)"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(143,121,61,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(143,121,61,0.2) 1px, transparent 1px)",
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
            </motion.div>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
