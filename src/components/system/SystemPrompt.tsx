"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { SystemPanel, SystemLabel } from "./SystemPrimitives";

interface SystemPromptProps {
  /** Section eyebrow — e.g. "DAILY DIRECTIVE". */
  category: string;
  /** Quest body. One concise sentence. */
  message: string;
  /** XP / reward strapline. */
  reward?: string;
}

/**
 * Top-right lobby quest card. One eyebrow + one sentence + one reward.
 * No typing animation, no blinking cursor — those read as "loading" /
 * noisy. The pulsing dot beside the eyebrow is the only motion.
 */
export function SystemPrompt({ category, message, reward }: SystemPromptProps) {
  return (
    <SystemPanel accent="cyan" glow="soft" w={{ base: "full", md: "300px" }} p={4}>
      <VStack align="stretch" gap={2.5}>
        <HStack gap={2}>
          <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg="sysCyan"
            boxShadow="0 0 6px var(--chakra-colors-sysCyan)"
            style={{ animation: "system-pulse 2s ease-in-out infinite" }}
          />
          <SystemLabel accent="cyan">{category}</SystemLabel>
        </HStack>
        <Text
          fontFamily="var(--font-playfair), Georgia, serif"
          fontSize="md"
          lineHeight="1.35"
          color="textPrimary"
          fontWeight="500"
        >
          {message}
        </Text>
        {reward && (
          <HStack
            gap={2}
            pt={2}
            borderTopWidth="1px"
            borderColor="rgba(0,240,255,0.18)"
          >
            <Text
              fontSize="2xs"
              color="textMuted"
              letterSpacing="0.2em"
              textTransform="uppercase"
              fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
            >
              Reward
            </Text>
            <Text
              fontSize="sm"
              fontWeight="800"
              color="sysCyan"
              fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
              letterSpacing="0.06em"
              style={{ textShadow: "0 0 6px var(--chakra-colors-sysCyan)" }}
            >
              {reward}
            </Text>
          </HStack>
        )}
      </VStack>
    </SystemPanel>
  );
}
