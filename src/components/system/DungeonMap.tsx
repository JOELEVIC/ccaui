"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { tierForRating, xpProgress } from "@/lib/r2m";
import {
  SystemButton,
  SystemLabel,
  SYSTEM_KEYFRAMES,
} from "./SystemPrimitives";

type NodeType = "tactic" | "strategy" | "endgame" | "boss";

interface DungeonNode {
  level: number;
  type: NodeType;
  title: string;
  href: string;
}

const NODES: DungeonNode[] = buildNodes();

function buildNodes(): DungeonNode[] {
  const out: DungeonNode[] = [];
  const rotation: { type: NodeType; title: string }[] = [
    { type: "tactic", title: "Pin & Skewer" },
    { type: "tactic", title: "Forks" },
    { type: "strategy", title: "Pawn Structure" },
    { type: "endgame", title: "K + P Opposition" },
    { type: "tactic", title: "Discoveries" },
  ];
  for (let lv = 1; lv <= 100; lv++) {
    if (lv % 10 === 0) {
      out.push({
        level: lv,
        type: "boss",
        title: `Gatekeeper · Level ${lv}`,
        href: "/play/bot?elo=" + Math.min(3200, 800 + lv * 24),
      });
    } else {
      const r = rotation[(lv - 1) % rotation.length];
      out.push({
        level: lv,
        type: r.type,
        title: r.title,
        href:
          r.type === "tactic"
            ? "/learning"
            : r.type === "endgame"
              ? "/learning"
              : "/play/bot?elo=" + Math.min(3200, 800 + lv * 20),
      });
    }
  }
  return out;
}

interface DungeonMapProps {
  /** Override the player level (used for storybook / preview). */
  playerLevel?: number;
}

const VISIBLE_AHEAD = 5;
const FOG_AHEAD = 4;

export function DungeonMap({ playerLevel }: DungeonMapProps) {
  const { user } = useAuth();
  const xp = user?.profile?.xp ?? 0;
  const level = playerLevel ?? xpProgress(xp).level;
  const rating = user?.rating ?? 800;
  const tier = tierForRating(rating);

  const nodes = useMemo(() => NODES, []);
  const cleared = level - 1; // levels strictly below current are cleared

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SYSTEM_KEYFRAMES }} />
      <Box position="relative" minH="100vh" bg="sysVoid" color="textPrimary" overflow="hidden">
        {/* Backdrop */}
        <Box
          position="absolute"
          inset={0}
          background={`radial-gradient(ellipse at 50% 0%, ${tier.color}1f 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(138,43,226,0.18) 0%, transparent 55%)`}
          pointerEvents="none"
        />
        <Box
          position="absolute"
          inset={0}
          opacity={0.04}
          backgroundImage="linear-gradient(rgba(0,240,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.6) 1px, transparent 1px)"
          backgroundSize="64px 64px"
          pointerEvents="none"
        />

        <Box position="relative" zIndex={1} maxW="3xl" mx="auto" px={{ base: 3, md: 6 }} py={{ base: 6, md: 10 }}>
          <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
            <Box>
              <SystemLabel accent="cyan">[ Gate of the System ]</SystemLabel>
              <Text
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize={{ base: "2xl", md: "4xl" }}
                color="textPrimary"
                fontWeight="600"
                lineHeight="1.05"
                mt={1}
              >
                Dungeon Map
              </Text>
              <Text mt={1} fontSize="sm" color="textSecondary">
                The next {VISIBLE_AHEAD} levels are revealed. Beyond them, the fog only lifts as you climb.
              </Text>
            </Box>
            <Link href="/road-to-master">
              <SystemButton accent="purple" size="md">
                ← Lobby
              </SystemButton>
            </Link>
          </HStack>

          <Box position="relative" pl={{ base: "32px", md: "48px" }}>
            {/* the spine */}
            <Box
              position="absolute"
              top="0"
              bottom="0"
              left={{ base: "16px", md: "23px" }}
              w="2px"
              background="linear-gradient(180deg, rgba(0,240,255,0.6) 0%, rgba(138,43,226,0.4) 60%, rgba(255,255,255,0.05) 100%)"
              boxShadow="0 0 8px rgba(0,240,255,0.5)"
            />
            <VStack align="stretch" gap={3}>
              {nodes.map((n) => {
                const distance = n.level - level;
                if (distance > VISIBLE_AHEAD + FOG_AHEAD) return null;
                const isVisible = distance <= VISIBLE_AHEAD;
                const isCurrent = n.level === level;
                const isCleared = n.level <= cleared;
                return (
                  <NodeRow
                    key={n.level}
                    node={n}
                    isVisible={isVisible}
                    isCurrent={isCurrent}
                    isCleared={isCleared}
                  />
                );
              })}
            </VStack>
          </Box>
        </Box>
      </Box>
    </>
  );
}

function NodeRow({
  node,
  isVisible,
  isCurrent,
  isCleared,
}: {
  node: DungeonNode;
  isVisible: boolean;
  isCurrent: boolean;
  isCleared: boolean;
}) {
  const accent =
    node.type === "boss"
      ? "var(--chakra-colors-sysThreat)"
      : node.type === "endgame"
        ? "var(--chakra-colors-sysEpic)"
        : node.type === "strategy"
          ? "var(--chakra-colors-sysPurple)"
          : "var(--chakra-colors-sysCyan)";
  const accentRgb =
    node.type === "boss"
      ? "240,101,149"
      : node.type === "endgame"
        ? "177,151,252"
        : node.type === "strategy"
          ? "138,43,226"
          : "0,240,255";

  if (!isVisible) {
    return (
      <Box position="relative" pl={{ base: "8px", md: "12px" }} opacity={0.6}>
        <NodeMarker
          accent="rgba(255,255,255,0.18)"
          accentRgb="255,255,255"
          locked
          isCurrent={false}
          type={node.type}
        />
        <Box
          ml={{ base: "32px", md: "40px" }}
          py={3}
          px={4}
          bg="rgba(10,11,14,0.45)"
          borderWidth="1px"
          borderColor="whiteAlpha.080"
          borderStyle="dashed"
          backdropFilter="blur(10px)"
        >
          <HStack justify="space-between">
            <Text fontFamily="var(--font-oswald), var(--font-inter), sans-serif" fontSize="xs" color="textMuted" letterSpacing="wider" textTransform="uppercase">
              Level {node.level}
            </Text>
            <Text fontSize="xs" color="textMuted">
              ▒▒▒▒ ▒▒▒▒
            </Text>
          </HStack>
          <Text mt={1} fontSize="sm" color="textMuted" fontStyle="italic">
            Hidden in the fog
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Box position="relative" pl={{ base: "8px", md: "12px" }}>
        <NodeMarker
          accent={accent}
          accentRgb={accentRgb}
          locked={!isCleared && !isCurrent}
          isCurrent={isCurrent}
          type={node.type}
        />
        <Box
          ml={{ base: "32px", md: "40px" }}
          opacity={isCleared ? 0.65 : 1}
        >
          <Link href={node.href}>
            <Box
              py={3}
              px={4}
              bg="rgba(10,11,14,0.7)"
              borderWidth="1px"
              borderColor={isCurrent ? accent : `rgba(${accentRgb}, 0.3)`}
              backdropFilter="blur(12px)"
              boxShadow={isCurrent ? `0 0 20px rgba(${accentRgb}, 0.45)` : "none"}
              transition="all 0.18s"
              _hover={{
                borderColor: accent,
                boxShadow: `0 0 16px rgba(${accentRgb}, 0.45)`,
              }}
              style={{
                clipPath:
                  "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
              }}
            >
              <HStack justify="space-between" align="center">
                <HStack gap={3}>
                  <Box
                    fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
                    fontSize="xs"
                    fontWeight="700"
                    color={accent}
                    letterSpacing="0.18em"
                    textTransform="uppercase"
                  >
                    Lv {node.level}
                  </Box>
                  <Box>
                    <Text
                      fontWeight="700"
                      color="textPrimary"
                      fontFamily="var(--font-playfair), Georgia, serif"
                      fontSize="md"
                      lineHeight="1.2"
                    >
                      {node.title}
                    </Text>
                    <Text fontSize="xs" color="textMuted" mt={0.5}>
                      {labelForNode(node.type)}
                    </Text>
                  </Box>
                </HStack>
                {isCurrent ? (
                  <Box
                    px={2}
                    py={1}
                    bg={`rgba(${accentRgb}, 0.15)`}
                    borderWidth="1px"
                    borderColor={accent}
                  >
                    <Text fontSize="2xs" color={accent} fontWeight="700" letterSpacing="0.18em" textTransform="uppercase">
                      ◆ Active
                    </Text>
                  </Box>
                ) : isCleared ? (
                  <Text color="sysEpic" fontSize="xs" fontWeight="700">
                    ✓ Cleared
                  </Text>
                ) : (
                  <Text color="textMuted" fontSize="xs">
                    Locked
                  </Text>
                )}
              </HStack>
            </Box>
          </Link>
        </Box>
      </Box>
    </motion.div>
  );
}

function NodeMarker({
  accent,
  accentRgb,
  locked,
  isCurrent,
  type,
}: {
  accent: string;
  accentRgb: string;
  locked: boolean;
  isCurrent: boolean;
  type: NodeType;
}) {
  const isBoss = type === "boss";
  const size = isBoss ? "26px" : "20px";
  return (
    <Box
      position="absolute"
      left={{ base: "8px", md: "16px" }}
      top="14px"
      w={size}
      h={size}
      style={{
        clipPath: isBoss
          ? "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)"
          : "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
      }}
      bg={accent}
      filter={
        isCurrent
          ? `drop-shadow(0 0 10px rgba(${accentRgb}, 0.9)) drop-shadow(0 0 24px rgba(${accentRgb}, 0.55))`
          : `drop-shadow(0 0 6px rgba(${accentRgb}, 0.5))`
      }
      opacity={locked ? 0.7 : 1}
      _before={
        isCurrent
          ? {
              content: '""',
              position: "absolute",
              inset: "-8px",
              borderRadius: "full",
              borderWidth: "1px",
              borderColor: accent,
              animation: "system-pulse 1.5s ease-in-out infinite",
            }
          : undefined
      }
    >
      <Box
        position="absolute"
        inset="2px"
        bg="sysVoid"
        style={{
          clipPath: isBoss
            ? "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)"
            : "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
        }}
      />
    </Box>
  );
}

function labelForNode(t: NodeType): string {
  switch (t) {
    case "tactic":
      return "Tactical drill";
    case "strategy":
      return "Strategic study";
    case "endgame":
      return "Endgame technique";
    case "boss":
      return "Gatekeeper · beat the engine to advance";
  }
}
