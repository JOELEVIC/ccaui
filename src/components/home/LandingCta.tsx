"use client";

import { Box, Container, Heading, Text, VStack, Button } from "@chakra-ui/react";
import Link from "next/link";

export function LandingCta() {
  return (
    <Box
      py={{ base: 16, md: 20 }}
      bg="bgCard"
      borderTopWidth="1px"
      borderColor="goldDark"
    >
      <Container maxW="4xl">
        <VStack gap={6} textAlign="center">
          <Heading
            size="lg"
            fontFamily="var(--font-playfair), Georgia, serif"
            color="textPrimary"
          >
            Enter the Arena
          </Heading>
          <Text color="textSecondary" maxW="md">
            Join Cameroon Chess Academy. Create an account and take your place in the national rankings.
          </Text>
          <Link href="/register">
            <Button
              size="lg"
              variant="outline"
              borderWidth="2px"
              borderColor="gold"
              bg="bgSurface"
              color="gold"
              fontWeight="600"
              px={8}
              borderRadius="cca"
              _hover={{
                borderColor: "goldLight",
                boxShadow: "0 0 20px rgba(198, 167, 94, 0.15)",
              }}
              transition="all 0.2s"
            >
              Register
            </Button>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
}
