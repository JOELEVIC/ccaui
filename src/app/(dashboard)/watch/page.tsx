"use client";

import { Box, Heading, Text, VStack, SimpleGrid } from "@chakra-ui/react";

const PLACEHOLDERS = [
  { title: "Featured stream", desc: "Live commentary and top-level games." },
  { title: "Event coverage", desc: "Major tournaments and tie-breaks." },
  { title: "Lessons on demand", desc: "Recorded masterclasses." },
];

export default function WatchPage() {
  return (
    <VStack align="stretch" gap={8}>
      <Heading fontFamily="var(--font-playfair), Georgia, serif" size="xl" color="textPrimary">
        Watch
      </Heading>
      <Text color="textSecondary">Browse broadcasts and event coverage (content hub — connect streams when ready).</Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        {PLACEHOLDERS.map((p) => (
          <Box key={p.title} p={6} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="whiteAlpha.100">
            <Text fontWeight="700" color="gold" mb={2}>
              {p.title}
            </Text>
            <Text fontSize="sm" color="textSecondary">
              {p.desc}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
