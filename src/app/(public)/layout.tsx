"use client";

import { Box, Container, HStack, Link as ChakraLink, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="100vh" bg="bgDark" color="white">
      <Box borderBottomWidth="1px" borderColor="goldDark" py={3}>
        <Container maxW="6xl">
          <HStack justify="space-between">
            <Link href="/">
              <Text color="gold" fontWeight="600" fontFamily="var(--font-playfair), Georgia, serif">
                Cameroon Chess Academy
              </Text>
            </Link>
            <HStack gap={4}>
              <Link href="/login">
                <ChakraLink as="span" color="textSecondary" fontSize="sm" _hover={{ color: "gold" }}>
                  Sign in
                </ChakraLink>
              </Link>
              <Link href="/register">
                <ChakraLink as="span" color="gold" fontSize="sm" fontWeight="600" _hover={{ color: "goldLight" }}>
                  Register
                </ChakraLink>
              </Link>
            </HStack>
          </HStack>
        </Container>
      </Box>
      <Box flex={1} py={{ base: 6, md: 8 }}>
        <Container maxW="6xl">{children}</Container>
      </Box>
    </Box>
  );
}
