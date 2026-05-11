"use client";

import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { SystemPanel, SystemLabel } from "./SystemPrimitives";
import type { R2MTier } from "@/lib/r2m";

interface PlayerHUDProps {
  username: string;
  tier: R2MTier;
  rating: number;
  level: number;
  xpInLevel: number;
  xpForLevel: number;
}

/**
 * Top-left lobby HUD — single-row identity with rank diamond, username,
 * and a thin XP bar below. Hierarchy: name first, rank pill second,
 * XP last. No competing labels.
 */
export function PlayerHUD({
  username,
  tier,
  rating,
  level,
  xpInLevel,
  xpForLevel,
}: PlayerHUDProps) {
  const pct = Math.min(100, (xpInLevel / xpForLevel) * 100);

  return (
    <SystemPanel accent="cyan" glow="soft" w={{ base: "full", md: "300px" }} p={4}>
      <HStack gap={3} align="center">
        {/* Rank diamond */}
        <Box
          position="relative"
          w="42px"
          h="42px"
          flexShrink={0}
          style={{
            clipPath:
              "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
          }}
          bg={tier.color}
          display="flex"
          alignItems="center"
          justifyContent="center"
          filter={`drop-shadow(0 0 10px ${tier.color}aa)`}
        >
          <Box
            position="absolute"
            inset="1.5px"
            style={{
              clipPath:
                "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
            }}
            bg="var(--sys-void)"
          />
          <Text
            position="relative"
            zIndex={1}
            fontWeight="800"
            fontSize="md"
            color={tier.color}
            fontFamily="var(--font-playfair), Georgia, serif"
            textShadow={`0 0 8px ${tier.color}`}
          >
            {tier.rank}
          </Text>
        </Box>

        <VStack align="flex-start" gap={0} flex={1} minW={0}>
          <Text
            color="textPrimary"
            fontWeight="700"
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize="lg"
            lineHeight="1.1"
            maxW="170px"
            lineClamp={1}
          >
            {username}
          </Text>
          <HStack gap={2} mt={0.5} align="center">
            <Text
              fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
              fontSize="2xs"
              color="sysCyan"
              fontWeight="700"
              letterSpacing="0.18em"
              textTransform="uppercase"
            >
              Lv {level}
            </Text>
            <Box w="2px" h="10px" bg="rgba(255,255,255,0.12)" />
            <Text
              fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
              fontSize="2xs"
              color="textSecondary"
              fontWeight="700"
              letterSpacing="0.18em"
              textTransform="uppercase"
            >
              {rating}
            </Text>
          </HStack>
        </VStack>
      </HStack>

      {/* XP bar — single visual hierarchy, no surrounding labels */}
      <Box mt={3.5}>
        <HStack justify="space-between" mb={1}>
          <SystemLabel accent="cyan">XP</SystemLabel>
          <Text
            fontSize="2xs"
            color="textMuted"
            fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
            letterSpacing="0.12em"
          >
            {xpInLevel}/{xpForLevel}
          </Text>
        </HStack>
        <Box
          position="relative"
          h="4px"
          bg="rgba(0,240,255,0.08)"
          borderRadius="2px"
          overflow="visible"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              background:
                "linear-gradient(90deg, var(--chakra-colors-sysCyanDim) 0%, var(--chakra-colors-sysCyan) 100%)",
              boxShadow: "0 0 6px var(--chakra-colors-sysCyan)",
            }}
          />
        </Box>
      </Box>
    </SystemPanel>
  );
}
