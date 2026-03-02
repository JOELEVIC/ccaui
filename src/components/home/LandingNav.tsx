"use client";

import { Box, Container, HStack, Text, Button } from "@chakra-ui/react";
import Link from "next/link";

export function LandingNav() {
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
          </HStack>
        </HStack>
      </Container>
      {/* Thin Cameroon stripe */}
      <Box h="3px" display="flex" gap={0}>
        <Box flex={1} bg="cameroonGreen" />
        <Box flex={1} bg="cameroonRed" />
        <Box flex={1} bg="cameroonYellow" />
      </Box>
    </Box>
  );
}
