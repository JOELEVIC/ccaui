"use client";

import Link from "next/link";
import { Box, Button, Heading, Text, VStack, Container } from "@chakra-ui/react";
import { APP_NAME } from "@/lib/appName";

export default function HomePage() {
  return (
    <Box minH="100vh" bg="bgDark" color="textPrimary" py={16} px={4}>
      <Container maxW="lg" textAlign="center">
        <VStack gap={8}>
          <Heading fontFamily="var(--font-playfair), Georgia, serif" size="2xl" color="gold">
            {APP_NAME}
          </Heading>
          <Text color="textSecondary" maxW="md" mx="auto">
            Play, learn, tournaments, puzzles, and analysis — in one place.
          </Text>
          <VStack gap={3} w="full" maxW="xs" mx="auto">
            <Link href="/login" style={{ width: "100%" }}>
              <Button w="full" bg="gold" color="bgDark" borderRadius="soft" size="lg" _hover={{ bg: "goldLight" }}>
                Sign in
              </Button>
            </Link>
            <Link href="/dashboard" style={{ width: "100%" }}>
              <Button w="full" variant="outline" borderColor="gold" color="gold" borderRadius="soft" size="md">
                Open app (signed in users)
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
