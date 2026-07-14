"use client";

import { useCallback } from "react";
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { LessonRunner } from "@/components/learn/LessonRunner";
import { ENTRY_WORLD } from "@/lib/learn/entryCurriculum";
import { flattenLessons } from "@/lib/learn/types";
import { useLearnProgress } from "@/lib/learn/useLearnProgress";

export default function LessonPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const flat = flattenLessons(ENTRY_WORLD);
  const idx = flat.findIndex((x) => x.lesson.id === id);
  const { complete } = useLearnProgress(ENTRY_WORLD);

  const onComplete = useCallback(() => complete(id), [complete, id]);

  if (idx < 0) {
    return (
      <VStack align="stretch" gap={4} maxW="600px" mx="auto" py={10}>
        <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="2xl" color="textPrimary">
          Lesson not found
        </Text>
        <Text color="textSecondary">That lesson doesn’t exist yet.</Text>
        <Link href="/learn">
          <Button bg="gold" color="white" borderRadius="soft" _hover={{ bg: "goldLight" }} w="fit-content">
            ← Back to the map
          </Button>
        </Link>
      </VStack>
    );
  }

  const lesson = flat[idx].lesson;
  const next = idx + 1 < flat.length ? { id: flat[idx + 1].lesson.id, title: flat[idx + 1].lesson.title } : null;

  return (
    <Box py={2}>
      <LessonRunner lesson={lesson} next={next} onComplete={onComplete} />
    </Box>
  );
}
