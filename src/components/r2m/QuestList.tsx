"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { DAILY_QUESTS, rankAtLeast, type R2MRank } from "@/lib/r2m";

interface QuestListProps {
  rank: R2MRank;
}

export function QuestList({ rank }: QuestListProps) {
  return (
    <VStack align="stretch" gap={2}>
      {DAILY_QUESTS.map((q) => {
        const unlocked = rankAtLeast(rank, q.minRank);
        return (
          <HStack
            key={q.id}
            p={4}
            borderRadius="soft"
            bg="bgCard"
            borderWidth="1px"
            borderColor="whiteAlpha.080"
            opacity={unlocked ? 1 : 0.5}
            justify="space-between"
            gap={4}
          >
            <Box>
              <HStack gap={2}>
                <Text fontWeight="600" color={unlocked ? "textPrimary" : "textMuted"}>
                  {q.title}
                </Text>
                {!unlocked && (
                  <Text fontSize="xs" color="textMuted">
                    · unlock at {q.minRank}
                  </Text>
                )}
              </HStack>
              <Text fontSize="sm" color="textSecondary">
                {q.description}
              </Text>
            </Box>
            <Box
              px={3}
              py={1.5}
              borderRadius="full"
              bg="goldDark"
              borderWidth="1px"
              borderColor="gold"
              minW="68px"
              textAlign="center"
            >
              <Text fontSize="xs" color="gold" fontWeight="700">
                +{q.xp} XP
              </Text>
            </Box>
          </HStack>
        );
      })}
    </VStack>
  );
}
