"use client";

import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { SKILL_TREE, rankAtLeast, type R2MRank, type SkillCategory, type SkillNode } from "@/lib/r2m";

const CATEGORIES: { id: SkillCategory; label: string; accent: string }[] = [
  { id: "openings",    label: "Openings",    accent: "#a3e635" },
  { id: "tactics",     label: "Tactics",     accent: "#fb923c" },
  { id: "strategy",    label: "Strategy",    accent: "#a78bfa" },
  { id: "endgame",     label: "Endgame",     accent: "#22d3ee" },
  { id: "calculation", label: "Calculation", accent: "#f472b6" },
];

interface SkillTreeProps {
  rank: R2MRank;
}

export function SkillTree({ rank }: SkillTreeProps) {
  const grouped = CATEGORIES.map((c) => ({
    ...c,
    nodes: SKILL_TREE.filter((n) => n.category === c.id),
  }));

  return (
    <VStack align="stretch" gap={6}>
      {grouped.map((cat) => (
        <Box key={cat.id}>
          <HStack mb={3}>
            <Box w="10px" h="10px" borderRadius="full" bg={cat.accent} />
            <Text
              fontSize="lg"
              fontFamily="var(--font-playfair), Georgia, serif"
              color="textPrimary"
              fontWeight="600"
            >
              {cat.label}
            </Text>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
            {cat.nodes.map((n) => (
              <SkillCard key={n.id} node={n} accent={cat.accent} unlocked={rankAtLeast(rank, n.unlockAt)} />
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </VStack>
  );
}

function SkillCard({
  node,
  accent,
  unlocked,
}: {
  node: SkillNode;
  accent: string;
  unlocked: boolean;
}) {
  return (
    <Box
      p={4}
      borderRadius="soft"
      bg="bgCard"
      borderWidth="1px"
      borderColor={unlocked ? `${accent}66` : "whiteAlpha.080"}
      transition="border-color 0.2s, transform 0.2s"
      _hover={unlocked ? { borderColor: accent, transform: "translateY(-1px)" } : undefined}
      opacity={unlocked ? 1 : 0.55}
      position="relative"
    >
      <HStack justify="space-between" align="flex-start">
        <Text fontWeight="600" color={unlocked ? "textPrimary" : "textMuted"}>
          {node.name}
        </Text>
        <Box
          px={1.5}
          py={0.5}
          borderRadius="md"
          bg="whiteAlpha.080"
          borderWidth="1px"
          borderColor={unlocked ? accent : "whiteAlpha.200"}
        >
          <Text fontSize="xs" color={unlocked ? accent : "textMuted"} fontWeight="700">
            {node.unlockAt}
          </Text>
        </Box>
      </HStack>
      <Text fontSize="sm" color="textSecondary" mt={1.5}>
        {node.description}
      </Text>
      {node.legend && (
        <Text fontSize="xs" color="textMuted" mt={2} fontStyle="italic">
          inspired by {node.legend}
        </Text>
      )}
    </Box>
  );
}
