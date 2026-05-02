"use client";

import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { RankBadge } from "./RankBadge";
import { nextTier, progressInTier, tierForRating } from "@/lib/r2m";

interface RankProgressProps {
  rating: number;
}

export function RankProgress({ rating }: RankProgressProps) {
  const tier = tierForRating(rating);
  const next = nextTier(tier);
  const { pct, pointsRemaining } = progressInTier(rating);

  return (
    <Box
      p={6}
      borderRadius="soft"
      bg="bgCard"
      borderWidth="1px"
      borderColor="whiteAlpha.080"
      backgroundImage={`radial-gradient(circle at 0% 0%, ${tier.color}26 0%, transparent 60%)`}
    >
      <Flex align="center" gap={4} flexWrap="wrap">
        <RankBadge tier={tier} size="lg" />
        <VStack align="start" gap={1} flex={1} minW="200px">
          <HStack gap={3}>
            <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wider">
              Current rank
            </Text>
            <Text fontSize="xs" color="textMuted">
              {rating} rating
            </Text>
          </HStack>
          <Text
            fontSize="xl"
            fontWeight="700"
            fontFamily="var(--font-playfair), Georgia, serif"
            color={tier.color}
          >
            {tier.rank} · {tier.label}
          </Text>
          <Text fontSize="sm" color="textSecondary" maxW="lg">
            {tier.description}
          </Text>
        </VStack>
      </Flex>

      {next && (
        <Box mt={5}>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wider">
              Toward {next.rank} · {next.label}
            </Text>
            <Text fontSize="xs" color="textMuted">
              {pointsRemaining} pts to go
            </Text>
          </HStack>
          <Box h={2} borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
            <Box
              h="full"
              w={`${pct}%`}
              bg={tier.color}
              transition="width 0.6s ease"
              boxShadow={`0 0 12px ${tier.color}aa`}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
