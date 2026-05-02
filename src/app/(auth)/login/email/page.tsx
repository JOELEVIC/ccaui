"use client";

import { Box, Container, Heading, Text, HStack, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { APP_NAME } from "@/lib/appName";

export default function LoginEmailPage() {
  return (
    <Box minH="100vh" bg="gold" color="bgDark" py={{ base: 8, md: 12 }} px={4}>
      <Container maxW="md">
        <VStack gap={6} align="stretch">
          <Link href="/login">
            <Text fontSize="sm" color="bgDark" opacity={0.85} _hover={{ textDecoration: "underline" }}>
              ← Back
            </Text>
          </Link>

          <Box textAlign="center" pt={2}>
            <svg width="200" height="48" viewBox="0 0 200 48" fill="none" aria-hidden style={{ margin: "0 auto", maxWidth: "100%" }}>
              <path
                d="M20 38 L30 8 L40 38 M50 8 L50 38 M60 8 L70 28 L80 8 L80 38 M95 8 L95 38 L110 38 M125 8 L125 38 M140 8 L155 38 L170 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Heading
              size="2xl"
              fontFamily="var(--font-playfair), Georgia, serif"
              fontWeight="600"
              mt={4}
              color="bgDark"
            >
              Sign in
            </Heading>
            <Text fontSize="sm" mt={2} opacity={0.85}>
              {APP_NAME}
            </Text>
          </Box>

          <Box bg="whiteAlpha.400" backdropFilter="blur(8px)" borderRadius="soft" p={{ base: 6, md: 8 }} borderWidth="1px" borderColor="blackAlpha.100">
            <LoginForm chessPro />
          </Box>

          <Box
            mx="auto"
            px={4}
            py={2}
            borderRadius="soft"
            bg="whiteAlpha.300"
            borderWidth="1px"
            borderColor="blackAlpha.100"
            textAlign="center"
            maxW="340px"
          >
            <Text fontSize="xs" fontWeight="600" mb={1} letterSpacing="0.04em" textTransform="uppercase">
              Welcome back
            </Text>
            <Text fontSize="xs" opacity={0.85}>
              Your rating, games, and tournament history are waiting on the other side.
            </Text>
          </Box>

          <HStack justify="center" gap={6} flexWrap="wrap" fontSize="sm">
            <Link href="/register">
              <Text as="span" fontWeight="600" textDecoration="underline">
                Register
              </Text>
            </Link>
            <Link href="/regulations">
              <Text as="span" opacity={0.8}>
                Terms
              </Text>
            </Link>
            <Link href="/contact">
              <Text as="span" opacity={0.8}>
                Contact
              </Text>
            </Link>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
