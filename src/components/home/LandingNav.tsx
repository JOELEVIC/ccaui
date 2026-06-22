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
          <HStack gap={{ base: 1, md: 6 }} flexWrap="nowrap" justify="flex-end">
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
              <Button variant="ghost" size="sm" color="gold" display={{ base: "none", md: "inline-flex" }}>
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
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                <Text w="full" py={2} fontSize="sm" color="textSecondary" _hover={{ color: "gold" }} cursor="pointer">
                  {label}
                </Text>
              </Link>
            ))}
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
