"use client";

import { useState } from "react";
import { Box, Container, Flex, Heading, HStack, Text, Button, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { APP_NAME } from "@/lib/appName";

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
      as="header"
      position="sticky"
      top={0}
      zIndex={10}
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
      bg="rgba(10, 14, 26, 0.92)"
      backdropFilter="blur(8px)"
    >
      <Container maxW="6xl" py={4}>
        <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
          <Link href="/">
            <Heading size="md" fontFamily="var(--font-playfair), Georgia, serif" color="gold" fontWeight="600">
              {APP_NAME}
            </Heading>
          </Link>
          <HStack gap={{ base: 2, md: 6 }} flexWrap="wrap" justify="flex-end">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href}>
                <Text
                  fontSize="sm"
                  color="textSecondary"
                  _hover={{ color: "gold" }}
                  display={{ base: "none", md: "block" }}
                  cursor="pointer"
                >
                  {label}
                </Text>
              </Link>
            ))}
            <Link href="/login">
              <Button variant="ghost" size="sm" color="gold">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" bg="gold" color="bgDark" borderRadius="soft" _hover={{ bg: "goldLight" }}>
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
        </Flex>
      </Container>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <Box
          display={{ base: "block", md: "none" }}
          py={4}
          px={4}
          borderTopWidth="1px"
          borderColor="whiteAlpha.100"
          bg="rgba(10, 14, 26, 0.98)"
        >
          <VStack align="stretch" gap={1}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                <Text w="full" py={2} fontSize="sm" color="textSecondary" _hover={{ color: "gold" }} cursor="pointer">
                  {label}
                </Text>
              </Link>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
