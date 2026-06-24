"use client";

import Link from "next/link";
import { Box, Text, VStack } from "@chakra-ui/react";
import { MemoryGame } from "@/components/train/MemoryGame";

/**
 * Public, no-login "Board Memory" trainer. A novel, visually engaging hook a
 * visitor can try immediately — the kind of thing that makes them feel chess
 * here is different.
 */
export default function TrainMemoryPage() {
  return (
    <VStack align="stretch" gap={{ base: 6, md: 8 }} maxW="3xl" mx="auto">
      <VStack align={{ base: "center", md: "flex-start" }} gap={2} textAlign={{ base: "center", md: "left" }}>
        <Text as="h1" fontFamily="var(--font-playfair), Georgia, serif" fontSize={{ base: "3xl", md: "4xl" }} color="textPrimary" fontWeight="600" lineHeight="1.1">
          Board Memory
        </Text>
        <Text color="textSecondary" fontSize={{ base: "sm", md: "md" }} maxW="lg">
          The hidden skill behind every strong player is visualisation. Study a
          position, then rebuild it from memory — it gets harder each level.{" "}
          <Link href="/register" style={{ color: "var(--gold)", fontWeight: 600 }}>
            Create a free account
          </Link>{" "}
          to track your best streak.
        </Text>
      </VStack>

      <Box bg="bgCard" borderWidth="1px" borderColor="blackAlpha.200" borderRadius="xl2" p={{ base: 4, md: 8 }} boxShadow="var(--shadow-card-soft)">
        <MemoryGame />
      </Box>
    </VStack>
  );
}
