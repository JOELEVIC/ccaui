"use client";

import { Box, Button, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { OpeningPlayer } from "@/components/learn/OpeningPlayer";
import { findOpening } from "@/lib/learn/openings";

export default function OpeningPage({ params }: { params: { slug: string } }) {
  const opening = findOpening(params.slug);

  if (!opening) {
    return (
      <VStack align="stretch" gap={4} maxW="600px" mx="auto" py={10}>
        <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="2xl" color="textPrimary">
          Opening not found
        </Text>
        <Text color="textSecondary">That opening isn’t in the library yet.</Text>
        <Link href="/learning">
          <Button bg="gold" color="white" borderRadius="soft" _hover={{ bg: "goldLight" }} w="fit-content">
            ← Back to Learn
          </Button>
        </Link>
      </VStack>
    );
  }

  return (
    <Box py={2}>
      <OpeningPlayer opening={opening} />
    </Box>
  );
}
