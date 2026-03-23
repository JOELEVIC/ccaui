"use client";

import { Box, Heading, Text, VStack, HStack, SimpleGrid } from "@chakra-ui/react";
import { useQuery } from "@apollo/client/react";
import { LEARN_COURSES } from "@/graphql/queries/chessPro";

type CourseRow = { id: string; title: string; category: string; completed: boolean; bookmarked: boolean };

export default function LearnPage() {
  const { data, loading } = useQuery<{ learnCourses: CourseRow[] }>(LEARN_COURSES);
  const courses = data?.learnCourses ?? [];
  const byCat = courses.reduce<Record<string, CourseRow[]>>((acc, c) => {
    const k = c.category;
    if (!acc[k]) acc[k] = [];
    acc[k].push(c);
    return acc;
  }, {});

  return (
    <VStack align="stretch" gap={10}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <Box
          p={10}
          borderRadius="soft"
          bg="gold"
          color="bgDark"
          minH="200px"
          display="flex"
          flexDir="column"
          justifyContent="flex-end"
        >
          <Heading fontFamily="var(--font-playfair), Georgia, serif" size="xl">
            Practice
          </Heading>
          <Text mt={2} fontSize="sm" opacity={0.9}>
            Structured lessons to sharpen calculation and pattern recognition.
          </Text>
        </Box>
        <Box bg="bgCard" borderRadius="soft" p={6} borderWidth="1px" borderColor="whiteAlpha.100">
          <Text color="textSecondary" fontSize="sm">
            Progress syncs with your account. Bookmark courses to revisit them anytime.
          </Text>
        </Box>
      </SimpleGrid>

      {loading && <Text color="textMuted">Loading courses…</Text>}

      {Object.entries(byCat).map(([category, items]) => (
        <Box key={category}>
          <Heading size="md" color="gold" mb={4} fontFamily="var(--font-playfair), Georgia, serif">
            {category}
          </Heading>
          <VStack align="stretch" gap={2}>
            {items.map((c: { id: string; title: string; completed: boolean; bookmarked: boolean }) => (
              <HStack
                key={c.id}
                justify="space-between"
                py={3}
                px={4}
                borderRadius="soft"
                bg="bgCard"
                borderWidth="1px"
                borderColor="whiteAlpha.080"
              >
                <HStack gap={3}>
                  <Text color={c.completed ? "accentGreen" : "textMuted"}>{c.completed ? "✓" : "○"}</Text>
                  <Text color="textPrimary" fontWeight="600">
                    {c.title}
                  </Text>
                </HStack>
                <Text color={c.bookmarked ? "gold" : "textMuted"}>{c.bookmarked ? "🔖" : "⋮"}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}
