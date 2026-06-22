"use client";

import { Box, Container, Heading, Text, VStack, Button } from "@chakra-ui/react";
import Link from "next/link";

export function LandingCta() {
  return (
    <Box
      py={{ base: 16, md: 20 }}
      bg="bgCard"
      borderTopWidth="1px"
      borderColor="blackAlpha.100"
    >
      <Container maxW="4xl">
        <VStack gap={6} textAlign="center">
          <Heading
            size="lg"
            fontFamily="var(--font-playfair), Georgia, serif"
            color="textPrimary"
          >
            Ready to make your first move?
          </Heading>
          <Text color="textSecondary" maxW="md" lineHeight="1.7">
            Rated play, daily tactics, and tournaments. Create your account in under a minute and start climbing the Road to Master.
          </Text>
          <Link href="/register">
            <Button
              size="lg"
              bg="gold"
              color="bgDark"
              fontWeight="700"
              px={10}
              borderRadius="soft"
              _hover={{
                bg: "goldLight",
                boxShadow: "0 0 28px rgba(230,164,82,0.4)",
                transform: "translateY(-1px)",
              }}
              transition="all 0.2s"
            >
              ▶ Join the CCA family
            </Button>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
}
