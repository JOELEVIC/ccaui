"use client";

import { Box, Container, Heading, Text, HStack, Button, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { APP_NAME } from "@/lib/appName";

function SocialStub({ label }: { label: string }) {
  return (
    <Button
      size="sm"
      w="44px"
      h="44px"
      minW="44px"
      p={0}
      bg="bgDark"
      color="gold"
      borderRadius="soft"
      fontSize="xs"
      fontWeight="700"
      _hover={{ bg: "#1a2238" }}
      aria-label={label}
    >
      {label.slice(0, 2)}
    </Button>
  );
}

export default function LoginPage() {
  return (
    <Box minH="100vh" bg="gold" color="bgDark" py={{ base: 8, md: 12 }} px={4}>
      <Container maxW="md">
        <VStack gap={8} align="stretch">
          <Box textAlign="center" pt={4}>
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

          <VStack gap={3}>
            <Text fontSize="xs" textAlign="center" fontWeight="600" opacity={0.8}>
              Continue with
            </Text>
            <HStack justify="center" gap={2} flexWrap="wrap">
              <SocialStub label="Apple" />
              <SocialStub label="Twitch" />
              <SocialStub label="Facebook" />
              <SocialStub label="Google" />
              <SocialStub label="Twitter" />
              <SocialStub label="Discord" />
            </HStack>
          </VStack>

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
                Privacy
              </Text>
            </Link>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
