"use client";

import { Box, Button, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { StudyPlayer } from "@/components/learn/StudyPlayer";
import { findEndgame } from "@/lib/learn/endgames";

export default function EndgamePage({ params }: { params: { slug: string } }) {
  const eg = findEndgame(params.slug);

  if (!eg) {
    return (
      <VStack align="stretch" gap={4} maxW="600px" mx="auto" py={10}>
        <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="2xl" color="textPrimary">
          Technique not found
        </Text>
        <Text color="textSecondary">That endgame isn’t in the library yet.</Text>
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
      <StudyPlayer
        glyph={eg.glyph}
        title={eg.name}
        chips={[
          { label: "Endgame", tone: "light" },
          { label: eg.result, tone: "muted" },
        ]}
        idea={eg.idea}
        startFen={eg.startFen}
        orientation={eg.orientation}
        lines={eg.lines}
      />
    </Box>
  );
}
