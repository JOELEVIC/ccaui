"use client";

import Link from "next/link";
import { Box, Button, Container, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import { APP_NAME } from "@/lib/appName";

/**
 * Login gateway — welcoming step before the email/password form at /login/email.
 */
export default function LoginGatewayPage() {
  return (
    <Box minH="100vh" bg="bgDark" color="textPrimary" py={{ base: 10, md: 16 }} px={4}>
      <Container maxW="lg">
        <VStack gap={10} align="stretch">
          <Link href="/">
            <Text fontSize="sm" color="gold" _hover={{ textDecoration: "underline" }}>
              ← Back to home
            </Text>
          </Link>

          <VStack gap={4} textAlign="center" pt={4}>
            <svg width="180" height="56" viewBox="0 0 200 56" fill="none" aria-hidden style={{ margin: "0 auto" }}>
              <path
                d="M24 42 L36 10 L48 42 M58 10 L58 42 M70 10 L82 32 L94 10 L94 42 M108 10 L108 42 L126 42 M140 10 L140 42 M152 10 L170 42 L188 10"
                stroke="#e6a452"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Heading fontFamily="var(--font-playfair), Georgia, serif" size="2xl" color="textPrimary" fontWeight="600">
              Welcome back
            </Heading>
            <Text color="textSecondary" fontSize="md" maxW="md" mx="auto">
              You&apos;re a step away from your games, puzzles, and tournaments at <strong style={{ color: "var(--chakra-colors-gold)" }}>{APP_NAME}</strong>.
            </Text>
          </VStack>

          <Box
            bg="bgCard"
            borderRadius="soft"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            p={{ base: 6, md: 8 }}
          >
            <Text fontWeight="600" color="gold" mb={4} fontSize="sm" textTransform="uppercase" letterSpacing="wider">
              When you sign in you can
            </Text>
            <VStack align="stretch" gap={3}>
              {[
                "Resume games and see your rating across variants",
                "Join arena tournaments and track your stats",
                "Train with puzzles and review past performances",
              ].map((item) => (
                <HStack key={item} align="flex-start" gap={2}>
                  <Text color="accentGreen" mt={0.5} flexShrink={0}>
                    ✓
                  </Text>
                  <Text color="textSecondary" fontSize="sm">
                    {item}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          <VStack gap={4} align="stretch">
            <Link href="/login/email">
              <Button w="full" size="lg" bg="gold" color="bgDark" borderRadius="soft" _hover={{ bg: "goldLight" }}>
                Continue with email
              </Button>
            </Link>
            <Text fontSize="xs" color="textMuted" textAlign="center">
              You&apos;ll enter your email and password on the next screen.
            </Text>
          </VStack>

          <HStack justify="center" gap={2} flexWrap="wrap" fontSize="sm" color="textSecondary">
            <Text>New here?</Text>
            <Link href="/register">
              <Text color="gold" fontWeight="600" textDecoration="underline">
                Create an account
              </Text>
            </Link>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
