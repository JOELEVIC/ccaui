"use client";

import { useState } from "react";
import { Box, Container, HStack, Text, Button, VStack } from "@chakra-ui/react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Rankings", href: "/rankings" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Learning", href: "/learning" },
  { label: "Schools", href: "/schools" },
  { label: "Contact", href: "/contact" },
];

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      bg="bgDark"
      borderBottomWidth="1px"
      borderColor="whiteAlpha.08"
      backdropFilter="saturate(180%) blur(8px)"
    >
      <Container maxW="6xl" py={4}>
        <HStack justify="space-between">
          <Link href="/">
            <HStack gap={2}>
              <Text fontSize="xl" color="gold" aria-hidden>
                ♔
              </Text>
              <Text
                fontWeight="600"
                color="textPrimary"
                fontFamily="var(--font-playfair), Georgia, serif"
              >
                Cameroon Chess Academy
              </Text>
            </HStack>
          </Link>
          <HStack gap={3} display={{ base: "none", md: "flex" }}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href}>
                <Button
                  size="sm"
                  variant="ghost"
                  color="textSecondary"
                  borderRadius="soft"
                  _hover={{ color: "gold" }}
                  transition="color 0.2s"
                >
                  {label}
                </Button>
              </Link>
            ))}
          </HStack>
          <HStack gap={3}>
            <Link href="/login">
              <Button
                size="sm"
                variant="ghost"
                color="textSecondary"
                borderRadius="soft"
                _hover={{ color: "gold" }}
                transition="color 0.2s"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                bg="gold"
                color="black"
                borderRadius="soft"
                _hover={{ bg: "goldLight" }}
                transition="all 0.2s"
              >
                Register
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              color="textSecondary"
              display={{ base: "flex", md: "none" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </Button>
          </HStack>
        </HStack>
      </Container>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <Box
          display={{ base: "block", md: "none" }}
          py={4}
          px={4}
          borderTopWidth="1px"
          borderColor="whiteAlpha.08"
          bg="bgDark"
        >
          <VStack align="stretch" gap={1}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  w="full"
                  justifyContent="flex-start"
                  size="sm"
                  variant="ghost"
                  color="textSecondary"
                  borderRadius="soft"
                  _hover={{ color: "gold" }}
                >
                  {label}
                </Button>
              </Link>
            ))}
          </VStack>
        </Box>
      )}
      {/* Thin Cameroon stripe */}
      <Box h="3px" display="flex" gap={0}>
        <Box flex={1} bg="cameroonGreen" />
        <Box flex={1} bg="cameroonRed" />
        <Box flex={1} bg="cameroonYellow" />
      </Box>
    </Box>
  );
}
