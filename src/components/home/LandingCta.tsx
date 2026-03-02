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
          <Text color="textSecondary" maxW="md" lineHeight="1.7">
            Join the national platform. Create your account and climb the rankings.
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
              borderRadius="soft"
              boxShadow="var(--shadow-card-soft)"
              _hover={{
                borderColor: "goldLight",
                boxShadow: "0 0 24px rgba(201, 169, 110, 0.2)",
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
