"use client";

import { useState } from "react";
import { Box, Container, Flex, Heading, HStack, Text, Button, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { APP_NAME } from "@/lib/appName";

/**
 * Public header — deliberately lean. Only links a logged-out visitor can
 * actually use without hitting a login wall live here:
 *   • Play       → instant, no-login game vs the engine
 *   • Tournaments → public schedule (the emphasised, "alive" link)
 *   • Legends    → the world-greats showcase on the landing
 * About / Contact / Rankings / Schools / Learning moved to the footer or
 * gated flows so the header stays a clean set of working doors.
 */
const NAV_LINKS = [
  { label: "Play", href: "/play" },
  { label: "Legends", href: "/#legends" },
];

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={10}
      borderBottomWidth="1px"
      borderColor="blackAlpha.100"
      bg="rgba(255,255,255, 0.92)"
      backdropFilter="blur(8px)"
    >
      <Container maxW="6xl" py={{ base: 3, md: 4 }} px={{ base: 3, md: 6 }}>
        <Flex align="center" justify="space-between" gap={2} flexWrap="nowrap">
          <Link href="/">
            <Heading
              size={{ base: "sm", md: "md" }}
              fontFamily="var(--font-playfair), Georgia, serif"
              color="gold"
              fontWeight="600"
              whiteSpace="nowrap"
            >
              {APP_NAME}
            </Heading>
          </Link>
          <HStack gap={{ base: 1, md: 5 }} flexWrap="nowrap" justify="flex-end">
            {/* Play */}
            <Link href="/play">
              <Text
                fontSize="sm"
                color="textSecondary"
                _hover={{ color: "gold" }}
                display={{ base: "none", md: "block" }}
                cursor="pointer"
              >
                Play
              </Text>
            </Link>

            {/* Tournaments — the emphasised, gently-alive link */}
            <Link href="/tournaments">
              <HStack
                className="cca-tournament-pill"
                display={{ base: "none", md: "flex" }}
                gap={2}
                px={3.5}
                py={1.5}
                borderRadius="full"
                bg="rgba(197,160,89,0.10)"
                borderWidth="1px"
                borderColor="gold"
                cursor="pointer"
                transition="background 0.2s"
                _hover={{ bg: "rgba(197,160,89,0.18)" }}
              >
                <Box className="cca-live-dot" w="6px" h="6px" borderRadius="full" bg="accentGreen" />
                <Text fontSize="sm" color="gold" fontWeight="700" letterSpacing="0.02em">
                  Tournaments
                </Text>
              </HStack>
            </Link>

            {/* Legends */}
            <Link href="/#legends">
              <Text
                fontSize="sm"
                color="textSecondary"
                _hover={{ color: "gold" }}
                display={{ base: "none", md: "block" }}
                cursor="pointer"
              >
                Legends
              </Text>
            </Link>

            <Link href="/login">
              <Button variant="ghost" size="sm" color="gold" display={{ base: "none", md: "inline-flex" }}>
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" bg="gold" color="white" borderRadius="soft" _hover={{ bg: "goldLight" }}>
                Join free
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              color="textSecondary"
              display={{ base: "flex", md: "none" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              px={2}
              minW="auto"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </Button>
          </HStack>
        </Flex>
      </Container>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <Box
          display={{ base: "block", md: "none" }}
          py={4}
          px={4}
          borderTopWidth="1px"
          borderColor="blackAlpha.100"
          bg="rgba(255,255,255, 0.98)"
        >
          <VStack align="stretch" gap={1}>
            <Link href="/play" onClick={() => setMobileMenuOpen(false)}>
              <Text w="full" py={2} fontSize="sm" color="textSecondary" _hover={{ color: "gold" }} cursor="pointer">
                Play
              </Text>
            </Link>
            <Link href="/tournaments" onClick={() => setMobileMenuOpen(false)}>
              <HStack w="full" py={2} gap={2}>
                <Box w="6px" h="6px" borderRadius="full" bg="accentGreen" />
                <Text fontSize="sm" color="gold" fontWeight="700" cursor="pointer">
                  Tournaments
                </Text>
              </HStack>
            </Link>
            <Link href="/#legends" onClick={() => setMobileMenuOpen(false)}>
              <Text w="full" py={2} fontSize="sm" color="textSecondary" _hover={{ color: "gold" }} cursor="pointer">
                Legends
              </Text>
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Text w="full" py={2} fontSize="sm" color="gold" cursor="pointer">
                Sign in
              </Text>
            </Link>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
