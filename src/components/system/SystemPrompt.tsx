"use client";

import { useEffect, useRef, useState } from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { SystemPanel, SystemLabel } from "./SystemPrimitives";

interface SystemPromptProps {
  /** Pre-amble line shown above the typed message (e.g. "DAILY DIRECTIVE"). */
  category: string;
  /** The body that types out character-by-character. */
  message: string;
  /** XP / reward strapline. */
  reward?: string;
  /** Speed in ms per character. */
  speed?: number;
}

export function SystemPrompt({
  category,
  message,
  reward,
  speed = 22,
}: SystemPromptProps) {
  const [typed, setTyped] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setTyped("");
    indexRef.current = 0;
    const id = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current > message.length) {
        clearInterval(id);
        return;
      }
      setTyped(message.slice(0, indexRef.current));
    }, speed);
    return () => clearInterval(id);
  }, [message, speed]);

  return (
    <SystemPanel accent="cyan" glow="strong" brackets w={{ base: "full", md: "360px" }} p={5}>
      <VStack align="stretch" gap={3}>
        <HStack gap={2}>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="sysCyan"
            boxShadow="0 0 8px var(--chakra-colors-sysCyan)"
            style={{ animation: "system-pulse 2s ease-in-out infinite" }}
          />
          <SystemLabel accent="cyan">[ {category} ]</SystemLabel>
        </HStack>
        <Text
          fontFamily="'JetBrains Mono', 'Courier New', monospace"
          fontSize="md"
          lineHeight="1.5"
          color="textPrimary"
          minH="3.6em"
        >
          {typed}
          <Box
            as="span"
            display="inline-block"
            ml={0.5}
            w="9px"
            h="1.1em"
            verticalAlign="text-bottom"
            bg="sysCyan"
            boxShadow="0 0 8px var(--chakra-colors-sysCyan)"
            style={{ animation: "system-pulse 1s ease-in-out infinite" }}
          />
        </Text>
        {reward && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (message.length * speed) / 1000 + 0.2, duration: 0.4 }}
          >
            <HStack
              gap={2}
              pt={2}
              borderTopWidth="1px"
              borderColor="rgba(0,240,255,0.2)"
            >
              <Text fontSize="2xs" color="textMuted" letterSpacing="wider" textTransform="uppercase">
                Reward
              </Text>
              <Text
                fontSize="sm"
                fontWeight="700"
                color="sysEpic"
                fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
                letterSpacing="0.06em"
              >
                {reward}
              </Text>
            </HStack>
          </motion.div>
        )}
      </VStack>
    </SystemPanel>
  );
}
