"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import {
  DAILY_QUESTS,
  rankAtLeast,
  tierForRating,
  xpProgress,
  type R2MTier,
} from "@/lib/r2m";
import { PlayerHUD } from "./PlayerHUD";
import { SystemPrompt } from "./SystemPrompt";
import { CenterPiece } from "./CenterPiece";
import {
  SystemButton,
  SystemPanel,
  SystemLabel,
  SYSTEM_KEYFRAMES,
  type GlowAccent,
} from "./SystemPrimitives";
import { LevelUpOverlay, type LevelUpStat } from "./LevelUpOverlay";

type LobbyTab = "lobby" | "quests" | "codex" | "inventory";

export function Lobby() {
  const { user } = useAuth();
  const rating = user?.rating ?? 800;
  const tier = tierForRating(rating);
  const xp = user?.profile?.xp ?? 0;
  const xpInfo = xpProgress(xp);
  const username = user?.username ?? "Hunter";

  const [tab, setTab] = useState<LobbyTab>("lobby");
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Pick the first quest the player has unlocked.
  const currentQuest =
    DAILY_QUESTS.find((q) => rankAtLeast(tier.rank, q.minRank)) ?? DAILY_QUESTS[0];

  const demoStats: LevelUpStat[] = [
    { label: "Tactical Vision", before: 14, after: 15 },
    { label: "Calculation Depth", before: 8, after: 10 },
    { label: "Endgame Theory", before: 11, after: 12 },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SYSTEM_KEYFRAMES }} />
      <Box
        position="relative"
        minH={{ base: "auto", md: "calc(100vh - 64px)" }}
        bg="sysVoid"
        color="textPrimary"
        overflow="hidden"
      >
        {/* Ambient backdrop */}
        <Backdrop tier={tier} />

        {/* Top tab dock */}
        <Box position="relative" zIndex={2} pt={{ base: 4, md: 6 }} px={{ base: 3, md: 6 }}>
          <HStack gap={2} flexWrap="wrap">
            {(
              [
                { id: "lobby", label: "Lobby" },
                { id: "quests", label: "Quests" },
                { id: "codex", label: "Codex" },
                { id: "inventory", label: "Inventory" },
              ] as { id: LobbyTab; label: string }[]
            ).map((t) => (
              <TabPill key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
              </TabPill>
            ))}
            <Link href="/road-to-master/gate" style={{ marginLeft: "auto" }}>
              <TabPill accent="purple">Dungeon Map</TabPill>
            </Link>
          </HStack>
        </Box>

        {/* Spatial body */}
        <Box position="relative" zIndex={2} px={{ base: 3, md: 6 }} pb={{ base: 6, md: 0 }}>
          {tab === "lobby" && (
            <LobbyView
              tier={tier}
              username={username}
              rating={rating}
              level={xpInfo.level}
              xpInLevel={xpInfo.current}
              xpForLevel={xpInfo.needed}
              questCategory="Daily Directive"
              questMessage={currentQuest.description}
              questReward={`+${currentQuest.xp} XP`}
              onTriggerLevelUp={() => setShowLevelUp(true)}
            />
          )}
          {tab === "quests" && <QuestsView tier={tier} />}
          {tab === "codex" && <CodexView />}
          {tab === "inventory" && <InventoryView />}
        </Box>

        <LevelUpOverlay
          open={showLevelUp}
          newLevel={xpInfo.level + 1}
          stats={demoStats}
          reward={{
            title: "Skill Unlocked: The Pin",
            description: "Passive — the engine highlights pinning opportunities in your reviews.",
          }}
          onClose={() => setShowLevelUp(false)}
        />
      </Box>
    </>
  );
}

function Backdrop({ tier }: { tier: R2MTier }) {
  return (
    <>
      {/* Vignette + colour wash */}
      <Box
        position="absolute"
        inset={0}
        background={`radial-gradient(ellipse at 50% 35%, ${tier.color}22 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(138,43,226,0.18) 0%, transparent 50%)`}
        pointerEvents="none"
      />
      {/* Grid */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.05}
        backgroundImage="linear-gradient(rgba(0,240,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.6) 1px, transparent 1px)"
        backgroundSize="64px 64px"
        pointerEvents="none"
      />
      {/* Slow scan */}
      <Box
        position="absolute"
        inset={0}
        background="linear-gradient(180deg, transparent 0%, rgba(0,240,255,0.04) 50%, transparent 100%)"
        backgroundSize="100% 600px"
        style={{ animation: "system-scan 18s linear infinite" }}
        pointerEvents="none"
      />
    </>
  );
}

function TabPill({
  children,
  active,
  onClick,
  accent = "cyan",
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  accent?: GlowAccent;
}) {
  const ringMap: Record<GlowAccent, string> = {
    cyan: "var(--chakra-colors-sysCyan)",
    purple: "var(--chakra-colors-sysPurple)",
    epic: "var(--chakra-colors-sysEpic)",
    threat: "var(--chakra-colors-sysThreat)",
    gold: "var(--chakra-colors-gold)",
  };
  const ring = ringMap[accent];
  return (
    <Box
      as="button"
      onClick={onClick}
      px={4}
      py={1.5}
      bg={active ? `${ring}22` : "rgba(10,11,14,0.55)"}
      borderWidth="1px"
      borderColor={active ? ring : "whiteAlpha.200"}
      style={{
        clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
      }}
      cursor="pointer"
      transition="all 0.15s"
      _hover={{ borderColor: ring, bg: `${ring}18` }}
    >
      <Text
        fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
        fontSize="xs"
        fontWeight="700"
        letterSpacing="0.16em"
        textTransform="uppercase"
        color={active ? ring : "textSecondary"}
      >
        {children}
      </Text>
    </Box>
  );
}

interface LobbyViewProps {
  tier: R2MTier;
  username: string;
  rating: number;
  level: number;
  xpInLevel: number;
  xpForLevel: number;
  questCategory: string;
  questMessage: string;
  questReward: string;
  onTriggerLevelUp: () => void;
}

function LobbyView(p: LobbyViewProps) {
  return (
    <Box
      position="relative"
      minH={{ base: "auto", md: "calc(100vh - 132px)" }}
      pt={{ base: 6, md: 4 }}
    >
      {/* Top-left HUD */}
      <Box
        position={{ base: "relative", md: "absolute" }}
        top={{ md: "16px" }}
        left={{ md: "0" }}
        zIndex={3}
      >
        <PlayerHUD
          username={p.username}
          tier={p.tier}
          rating={p.rating}
          level={p.level}
          xpInLevel={p.xpInLevel}
          xpForLevel={p.xpForLevel}
        />
      </Box>

      {/* Right: System prompt */}
      <Box
        position={{ base: "relative", md: "absolute" }}
        top={{ md: "16px" }}
        right={{ md: "0" }}
        zIndex={3}
        mt={{ base: 4, md: 0 }}
      >
        <SystemPrompt
          category={p.questCategory}
          message={p.questMessage}
          reward={p.questReward}
        />
      </Box>

      {/* Centre piece */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        py={{ base: 8, md: 12 }}
        minH={{ md: "calc(100vh - 280px)" }}
      >
        <CenterPiece tier={p.tier} />
      </Box>

      {/* Bottom-right CTA cluster */}
      <Box
        position={{ base: "relative", md: "absolute" }}
        bottom={{ md: "24px" }}
        right={{ md: "0" }}
        zIndex={3}
      >
        <VStack align={{ base: "stretch", md: "flex-end" }} gap={3}>
          <HStack gap={2} justify={{ base: "center", md: "flex-end" }}>
            <SystemButton accent="purple" size="md" onClick={p.onTriggerLevelUp}>
              ⚡ Demo Level-Up
            </SystemButton>
          </HStack>
          <Box w={{ base: "full", md: "auto" }}>
            <SystemButton accent="cyan" size="xl" href="/road-to-master/gate">
              ▶ Enter Gate
            </SystemButton>
          </Box>
        </VStack>
      </Box>

      {/* Bottom-left: quick links */}
      <Box
        position={{ base: "relative", md: "absolute" }}
        bottom={{ md: "24px" }}
        left={{ md: "0" }}
        zIndex={3}
        mt={{ base: 4, md: 0 }}
      >
        <SystemPanel accent="purple" glow="soft" p={3} w={{ base: "full", md: "auto" }}>
          <HStack gap={2} flexWrap="wrap">
            <QuickAction href="/play/bot">Spar Engine</QuickAction>
            <QuickAction href="/learning">Tactics</QuickAction>
            <QuickAction href="/games">Live Arena</QuickAction>
            <QuickAction href="/analysis/import">Review</QuickAction>
          </HStack>
        </SystemPanel>
      </Box>
    </Box>
  );
}

function QuickAction({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <Box
        px={3}
        py={1}
        borderRadius="md"
        bg="rgba(138,43,226,0.08)"
        borderWidth="1px"
        borderColor="rgba(138,43,226,0.35)"
        _hover={{ borderColor: "sysPurple", bg: "rgba(138,43,226,0.18)" }}
        transition="all 0.15s"
      >
        <Text
          fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
          fontSize="2xs"
          fontWeight="700"
          letterSpacing="wider"
          textTransform="uppercase"
          color="sysEpic"
        >
          {children}
        </Text>
      </Box>
    </Link>
  );
}

function QuestsView({ tier }: { tier: R2MTier }) {
  return (
    <Box pt={6} maxW="3xl" mx="auto">
      <SystemPanel accent="cyan" glow="soft" brackets p={6}>
        <SystemLabel accent="cyan">[ Quest Log ]</SystemLabel>
        <Text
          mt={2}
          fontFamily="var(--font-playfair), Georgia, serif"
          fontSize="2xl"
          color="textPrimary"
          fontWeight="700"
        >
          Today&apos;s Directives
        </Text>
        <VStack mt={4} align="stretch" gap={2}>
          {DAILY_QUESTS.map((q) => {
            const unlocked = rankAtLeast(tier.rank, q.minRank);
            return (
              <HStack
                key={q.id}
                p={3}
                bg="rgba(10,11,14,0.55)"
                borderWidth="1px"
                borderColor={unlocked ? "rgba(0,240,255,0.25)" : "whiteAlpha.080"}
                opacity={unlocked ? 1 : 0.45}
                justify="space-between"
              >
                <Box>
                  <Text fontWeight="700" color={unlocked ? "textPrimary" : "textMuted"}>
                    {q.title}
                  </Text>
                  <Text fontSize="sm" color="textSecondary">
                    {q.description}
                  </Text>
                </Box>
                <Box
                  px={3}
                  py={1}
                  borderWidth="1px"
                  borderColor={unlocked ? "sysCyan" : "whiteAlpha.200"}
                >
                  <Text fontSize="xs" color={unlocked ? "sysCyan" : "textMuted"} fontWeight="700">
                    +{q.xp} XP
                  </Text>
                </Box>
              </HStack>
            );
          })}
        </VStack>
      </SystemPanel>
    </Box>
  );
}

function CodexView() {
  return (
    <Box pt={6} maxW="3xl" mx="auto">
      <SystemPanel accent="purple" glow="soft" p={6}>
        <SystemLabel accent="purple">[ Codex ]</SystemLabel>
        <Text mt={2} color="textSecondary">
          Your full skill tree, classes, and lore lives at the dedicated codex view.
        </Text>
        <Box mt={4}>
          <SystemButton accent="purple" href="/learning">
            Open Curriculum
          </SystemButton>
        </Box>
      </SystemPanel>
    </Box>
  );
}

function InventoryView() {
  return (
    <Box pt={6} maxW="3xl" mx="auto">
      <SystemPanel accent="epic" glow="soft" p={6}>
        <SystemLabel accent="epic">[ Inventory ]</SystemLabel>
        <Text mt={2} color="textSecondary">
          Badges, unlocks, and the Hunter&apos;s Pass appear here once earned.
        </Text>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box mt={4} p={4} bg="rgba(177,151,252,0.06)" borderWidth="1px" borderColor="sysEpic">
            <Text fontSize="sm" color="textMuted">
              Empty slot — earn your first badge by completing a daily directive.
            </Text>
          </Box>
        </motion.div>
      </SystemPanel>
    </Box>
  );
}
