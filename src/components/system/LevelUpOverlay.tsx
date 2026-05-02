"use client";

import { useEffect, useState } from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { SystemPanel, SystemLabel, SystemButton } from "./SystemPrimitives";

export interface LevelUpStat {
  label: string;
  before: number;
  after: number;
}

export interface LevelUpReward {
  /** Short title — e.g. "Skill Unlocked: The Pin (Passive)" */
  title: string;
  /** One-line description. */
  description?: string;
}

interface LevelUpOverlayProps {
  open: boolean;
  newLevel: number;
  stats: LevelUpStat[];
  reward?: LevelUpReward;
  onClose: () => void;
}

/**
 * Full-screen "LEVEL UP" sequence:
 *   1) backdrop darkens
 *   2) neon slash crosses the screen
 *   3) System panel expands from centre
 *   4) Stats roll up
 *   5) Reward drops in
 */
export function LevelUpOverlay({
  open,
  newLevel,
  stats,
  reward,
  onClose,
}: LevelUpOverlayProps) {
  const [phase, setPhase] = useState<"idle" | "slash" | "modal" | "stats" | "reward">(
    "idle"
  );

  useEffect(() => {
    if (!open) {
      setPhase("idle");
      return;
    }
    setPhase("slash");
    const t1 = setTimeout(() => setPhase("modal"), 600);
    const t2 = setTimeout(() => setPhase("stats"), 1200);
    const t3 = setTimeout(() => setPhase("reward"), 1200 + Math.max(800, stats.length * 350));
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open, stats.length]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(2, 4, 10, 0.86)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Slash */}
          {(phase === "slash" || phase === "modal" || phase === "stats" || phase === "reward") && (
            <Box
              position="absolute"
              top="50%"
              left="0"
              w="120%"
              h="3px"
              bg="linear-gradient(90deg, transparent 0%, var(--chakra-colors-sysCyan) 50%, transparent 100%)"
              boxShadow="0 0 24px var(--chakra-colors-sysCyan), 0 0 60px rgba(0,240,255,0.6)"
              pointerEvents="none"
              style={{
                animation: "system-slash 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            />
          )}

          {/* Modal */}
          {(phase === "modal" || phase === "stats" || phase === "reward") && (
            <Box
              maxW="480px"
              w="full"
              mx={4}
              style={{ animation: "system-modal-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
            >
              <SystemPanel accent="cyan" glow="strong" brackets p={{ base: 5, md: 8 }}>
                <VStack align="stretch" gap={5}>
                  <VStack gap={1} textAlign="center">
                    <SystemLabel accent="cyan">[ The System ]</SystemLabel>
                    <Text
                      fontFamily="var(--font-playfair), Georgia, serif"
                      fontSize={{ base: "3xl", md: "5xl" }}
                      fontWeight="700"
                      color="sysCyan"
                      lineHeight="1"
                      letterSpacing="0.05em"
                      textShadow="0 0 12px var(--chakra-colors-sysCyan), 0 0 28px rgba(0,240,255,0.6)"
                      style={{ animation: "system-glitch 0.4s ease-out 1" }}
                    >
                      LEVEL UP !
                    </Text>
                    <Text
                      mt={1}
                      fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
                      letterSpacing="0.35em"
                      textTransform="uppercase"
                      fontSize="xs"
                      color="textSecondary"
                    >
                      You have reached level{" "}
                      <Box as="span" color="sysEpic" fontWeight="700">
                        {newLevel}
                      </Box>
                    </Text>
                  </VStack>

                  {(phase === "stats" || phase === "reward") && (
                    <VStack align="stretch" gap={2} pt={2}>
                      {stats.map((s, i) => (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <HStack
                            justify="space-between"
                            px={3}
                            py={2}
                            bg="rgba(0,240,255,0.05)"
                            borderWidth="1px"
                            borderColor="rgba(0,240,255,0.18)"
                          >
                            <Text
                              fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
                              fontSize="sm"
                              color="textSecondary"
                              letterSpacing="wider"
                              textTransform="uppercase"
                            >
                              {s.label}
                            </Text>
                            <HStack gap={2}>
                              <Text fontSize="sm" color="textMuted">
                                {s.before}
                              </Text>
                              <Text fontSize="sm" color="textMuted">
                                →
                              </Text>
                              <Text fontSize="md" color="sysCyan" fontWeight="700">
                                {s.after}
                              </Text>
                              <Text
                                fontSize="xs"
                                color="sysEpic"
                                fontWeight="700"
                                ml={1}
                              >
                                (+{s.after - s.before})
                              </Text>
                            </HStack>
                          </HStack>
                        </motion.div>
                      ))}
                    </VStack>
                  )}

                  {phase === "reward" && reward && (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Box
                        p={4}
                        borderWidth="1px"
                        borderColor="sysEpic"
                        bg="rgba(177,151,252,0.06)"
                        boxShadow="0 0 18px rgba(177,151,252,0.35)"
                      >
                        <SystemLabel accent="epic">⚡ Reward acquired</SystemLabel>
                        <Text
                          mt={1}
                          color="sysEpic"
                          fontWeight="700"
                          fontFamily="var(--font-playfair), Georgia, serif"
                          fontSize="lg"
                        >
                          {reward.title}
                        </Text>
                        {reward.description && (
                          <Text mt={1} fontSize="sm" color="textSecondary">
                            {reward.description}
                          </Text>
                        )}
                      </Box>
                    </motion.div>
                  )}

                  {phase === "reward" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <SystemButton accent="cyan" onClick={onClose}>
                        Acknowledge
                      </SystemButton>
                    </motion.div>
                  )}
                </VStack>
              </SystemPanel>
            </Box>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
