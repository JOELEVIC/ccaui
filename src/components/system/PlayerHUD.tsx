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
    <SystemPanel accent="cyan" glow="soft" brackets w={{ base: "full", md: "320px" }} p={4}>
      <HStack gap={3} align="flex-start">
        {/* Rank diamond */}
        <Box
          position="relative"
          w="56px"
          h="56px"
          flexShrink={0}
          style={{
            clipPath:
              "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
          }}
          bg={tier.color}
          display="flex"
          alignItems="center"
          justifyContent="center"
          filter={`drop-shadow(0 0 12px ${tier.color}aa)`}
        >
          <Box
            position="absolute"
            inset="2px"
            style={{
              clipPath:
                "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
            }}
            bg="sysVoid"
          />
          <Text
            position="relative"
            zIndex={1}
            fontWeight="800"
            fontSize="xl"
            color={tier.color}
            fontFamily="var(--font-playfair), Georgia, serif"
            letterSpacing="0.04em"
            textShadow={`0 0 10px ${tier.color}`}
          >
            {tier.rank}
          </Text>
        </Box>
        <VStack align="stretch" flex={1} gap={1}>
          <SystemLabel accent="cyan">Hunter</SystemLabel>
          <Text color="textPrimary" fontWeight="700" fontFamily="var(--font-playfair), Georgia, serif" fontSize="lg" lineHeight="1">
            {username}
          </Text>
          <HStack gap={3} pt={1}>
            <Box>
              <Text fontSize="2xs" color="textMuted" letterSpacing="wider" textTransform="uppercase">
                LV
              </Text>
              <Text color="sysCyan" fontWeight="800" fontSize="md" lineHeight="1">
                {level}
              </Text>
            </Box>
            <Box>
              <Text fontSize="2xs" color="textMuted" letterSpacing="wider" textTransform="uppercase">
                Rating
              </Text>
              <Text color="textPrimary" fontWeight="700" fontSize="md" lineHeight="1">
                {rating}
              </Text>
            </Box>
            <Box>
              <Text fontSize="2xs" color="textMuted" letterSpacing="wider" textTransform="uppercase">
                Class
              </Text>
              <Text color="sysEpic" fontWeight="700" fontSize="md" lineHeight="1">
                {tier.label}
              </Text>
            </Box>
          </HStack>
        </VStack>
      </HStack>

      {/* XP bar */}
      <Box mt={4}>
        <HStack justify="space-between" mb={1.5}>
          <Text fontSize="2xs" color="textMuted" letterSpacing="0.18em" textTransform="uppercase">
            XP
          </Text>
          <Text fontSize="2xs" color="sysCyan" fontWeight="700" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
            {xpInLevel} / {xpForLevel}
          </Text>
        </HStack>
        <Box
          position="relative"
          h="6px"
          bg="rgba(0,240,255,0.08)"
          borderRadius="2px"
          overflow="visible"
          borderWidth="1px"
          borderColor="rgba(0,240,255,0.25)"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              background:
                "linear-gradient(90deg, var(--chakra-colors-sysCyanDim) 0%, var(--chakra-colors-sysCyan) 100%)",
              boxShadow:
                "0 0 6px var(--chakra-colors-sysCyan), 0 0 14px rgba(0,240,255,0.5)",
            }}
          />
          {/* glowing tip */}
          <motion.div
            initial={{ left: 0, opacity: 0 }}
            animate={{ left: `${pct}%`, opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "-3px",
              width: "10px",
              height: "12px",
              transform: "translateX(-5px)",
              background: "var(--chakra-colors-sysCyan)",
              boxShadow: "0 0 10px var(--chakra-colors-sysCyan), 0 0 24px rgba(0,240,255,0.7)",
              clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
            }}
          />
        </Box>
      </Box>
    </SystemPanel>
  );
}
