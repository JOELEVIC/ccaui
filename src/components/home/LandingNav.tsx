"use client";

import { useState } from "react";
import { Box, Container, Flex, HStack, Text, Button, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/appName";

/**
 * Public header — branded, light, sticky. A crowned wordmark with a federation
 * sub-label for credibility, an emphasised "live" Tournaments pill, and a
 * high-contrast primary CTA. Links point only at pages a logged-out visitor
 * can actually use (Play, Tournaments, Community, Legends).
 */

function Brand() {
  return (
    <Link href="/" style={{ textDecoration: "none" }}>
      <HStack gap={2.5} align="center">
        <Box
          w="36px"
          h="36px"
          borderRadius="full"
          borderWidth="1px"
          borderColor="gold"
          color="gold"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          style={{ boxShadow: "0 0 0 4px rgba(197,160,89,0.08)" }}
        >
          <Text fontSize="xl" lineHeight="1">♚</Text>
        </Box>
        <Box>
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize={{ base: "md", md: "lg" }}
            fontWeight="700"
            color="textPrimary"
            lineHeight="1.05"
            whiteSpace="nowrap"
          >
            {APP_NAME}
          </Text>
          <Text
            display={{ base: "none", md: "block" }}
            fontSize="9px"
            letterSpacing="0.24em"
            textTransform="uppercase"
            color="textMuted"
            mt="3px"
          >
            Cameroon Chess Academy
          </Text>
        </Box>
      </HStack>
    </Link>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Box position="relative" px={1} py={1} display={{ base: "none", md: "block" }}>
        <Text
          fontSize="xs"
          fontWeight="600"
          letterSpacing="0.14em"
          textTransform="uppercase"
          color={active ? "textPrimary" : "textSecondary"}
          _hover={{ color: "gold" }}
          cursor="pointer"
          transition="color 0.2s"
        >
          {label}
        </Text>
        {active && (
          <Box
            position="absolute"
            left="50%"
            bottom="-7px"
            w="16px"
            h="2px"
            borderRadius="full"
            bg="gold"
            style={{ transform: "translateX(-50%)", boxShadow: "0 0 6px rgba(197,160,89,0.5)" }}
          />
        )}
      </Box>
    </Link>
  );
}

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  const isActive = (href: string) => href !== "/#legends" && (pathname === href || pathname.startsWith(href + "/"));
  const tournamentsActive = pathname === "/tournaments" || pathname.startsWith("/tournaments/");

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={20}
      borderBottomWidth="1px"
      borderColor="rgba(197,160,89,0.18)"
      bg="rgba(252,250,245,0.9)"
      backdropFilter="blur(10px)"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.02)" }}
    >
      <Container maxW="6xl" py={{ base: 2.5, md: 3.5 }} px={{ base: 3, md: 6 }}>
        <Flex align="center" justify="space-between" gap={3}>
          <Brand />

          <HStack gap={{ base: 1, md: 6 }} align="center" justify="flex-end">
            <NavLink href="/play" label="Play" active={isActive("/play")} />

            {/* Tournaments — emphasised, gently-alive */}
            <Link href="/tournaments" style={{ textDecoration: "none" }}>
              <HStack
                className="cca-tournament-pill"
                display={{ base: "none", md: "flex" }}
                gap={2}
                px={3.5}
                py={1.5}
                borderRadius="full"
                bg={tournamentsActive ? "rgba(197,160,89,0.20)" : "rgba(197,160,89,0.10)"}
                borderWidth="1px"
                borderColor="gold"
                cursor="pointer"
                transition="background 0.2s"
                _hover={{ bg: "rgba(197,160,89,0.2)" }}
              >
                <Box className="cca-live-dot" w="6px" h="6px" borderRadius="full" bg="accentGreen" />
                <Text fontSize="xs" color="gold" fontWeight="700" letterSpacing="0.12em" textTransform="uppercase">
                  Tournaments
                </Text>
              </HStack>
            </Link>

            <NavLink href="/community" label="Community" active={isActive("/community")} />
            <NavLink href="/#legends" label="Legends" active={false} />

            <Box display={{ base: "none", md: "block" }} w="1px" h="20px" bg="rgba(0,0,0,0.08)" />

            <Link href="/login" style={{ textDecoration: "none" }}>
              <Button
                variant="ghost"
                size="sm"
                color="textSecondary"
                _hover={{ color: "gold", bg: "transparent" }}
                display={{ base: "none", md: "inline-flex" }}
                fontSize="xs"
                fontWeight="600"
                letterSpacing="0.1em"
                textTransform="uppercase"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/register" style={{ textDecoration: "none" }}>
              <Button
                size="sm"
                bg="gold"
                color="textPrimary"
                fontWeight="700"
                borderRadius="soft"
                _hover={{ bg: "goldLight" }}
                style={{ boxShadow: "0 2px 10px rgba(197,160,89,0.35)" }}
              >
                Join free
              </Button>
            </Link>

            <Button
              size="sm"
              variant="ghost"
              color="textPrimary"
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
          py={3}
          px={4}
          borderTopWidth="1px"
          borderColor="rgba(197,160,89,0.18)"
          bg="rgba(252,250,245,0.98)"
        >
          <VStack align="stretch" gap={1}>
            <Link href="/play" onClick={() => setMobileMenuOpen(false)}>
              <Text w="full" py={2} fontSize="sm" fontWeight="600" color="textSecondary" _hover={{ color: "gold" }} cursor="pointer">
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
            <Link href="/community" onClick={() => setMobileMenuOpen(false)}>
              <Text w="full" py={2} fontSize="sm" fontWeight="600" color="textSecondary" _hover={{ color: "gold" }} cursor="pointer">
                Community
              </Text>
            </Link>
            <Link href="/#legends" onClick={() => setMobileMenuOpen(false)}>
              <Text w="full" py={2} fontSize="sm" fontWeight="600" color="textSecondary" _hover={{ color: "gold" }} cursor="pointer">
                Legends
              </Text>
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Text w="full" py={2} fontSize="sm" fontWeight="700" color="gold" cursor="pointer">
                Sign in
              </Text>
            </Link>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
