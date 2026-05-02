"use client";

import Link from "next/link";
import { Box, Button, Heading, HStack, SimpleGrid, Text, VStack, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { RankProgress } from "@/components/r2m/RankProgress";
import { QuestList } from "@/components/r2m/QuestList";
import { SkillTree } from "@/components/r2m/SkillTree";
import { tierForRating, xpProgress } from "@/lib/r2m";
import { fadeInUp, staggerContainer, staggerChild, defaultViewport } from "@/lib/animations";

export default function RoadToMasterPage() {
  const { user } = useAuth();
  const rating = user?.rating ?? 800;
  const tier = tierForRating(rating);
  const xp = user?.profile?.xp ?? 0;
  const xpInfo = xpProgress(xp);
  const streak = user?.profile?.puzzleStreakCount ?? 0;

  return (
    <VStack align="stretch" gap={8}>
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Box>
          <Text fontSize="sm" color="gold" fontWeight="600" letterSpacing="wider" textTransform="uppercase">
            Road to Master
          </Text>
          <Heading
            size="2xl"
            fontFamily="var(--font-playfair), Georgia, serif"
            color="textPrimary"
            fontWeight="600"
            mt={1}
          >
            The System
          </Heading>
          <Text color="textSecondary" maxW="2xl" mt={2}>
            Your hunter dashboard. Climb from {tier.rank} to SS by clearing daily quests, unlocking skills,
            and converting your study into rating points.
          </Text>
        </Box>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <RankProgress rating={rating} />
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <motion.div variants={staggerChild}>
            <StatCard label="Level" value={String(xpInfo.level)} accent="#e6a452" sub={`${xpInfo.current}/${xpInfo.needed} XP`} pct={xpInfo.pct} />
          </motion.div>
          <motion.div variants={staggerChild}>
            <StatCard label="Puzzle streak" value={String(streak)} accent="#a3e635" sub={streak > 0 ? "Keep it alive" : "Solve to start"} />
          </motion.div>
          <motion.div variants={staggerChild}>
            <StatCard label="Rating" value={String(rating)} accent="#22d3ee" sub={`${tier.rank} · ${tier.label}`} />
          </motion.div>
        </SimpleGrid>
      </motion.div>

      <Flex gap={3} flexWrap="wrap">
        <Link href="/learning">
          <Button bg="gold" color="bgDark" borderRadius="soft" _hover={{ bg: "goldLight" }}>
            Solve puzzles
          </Button>
        </Link>
        <Link href="/play/bot">
          <Button variant="outline" borderColor="gold" color="gold" borderRadius="soft">
            Spar with the engine
          </Button>
        </Link>
        <Link href="/analysis/import">
          <Button variant="outline" borderColor="whiteAlpha.300" color="textPrimary" borderRadius="soft">
            Review a Chess.com game
          </Button>
        </Link>
      </Flex>

      <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="lg" fontFamily="var(--font-playfair), Georgia, serif" color="textPrimary">
              Today&apos;s quests
            </Heading>
            <Text fontSize="xs" color="textMuted">
              Resets at midnight
            </Text>
          </HStack>
          <QuestList rank={tier.rank} />
        </Box>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={defaultViewport}>
        <Box>
          <Heading size="lg" fontFamily="var(--font-playfair), Georgia, serif" color="textPrimary" mb={4}>
            Skill tree
          </Heading>
          <Text color="textSecondary" mb={4} fontSize="sm" maxW="2xl">
            Each skill unlocks at a specific rank — clear your tier to open the next gate. Inspired by the
            masters whose styles you&apos;ll study along the way.
          </Text>
          <SkillTree rank={tier.rank} />
        </Box>
      </motion.div>
    </VStack>
  );
}

function StatCard({
  label,
  value,
  accent,
  sub,
  pct,
}: {
  label: string;
  value: string;
  accent: string;
  sub?: string;
  pct?: number;
}) {
  return (
    <Box p={5} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="whiteAlpha.080">
      <Text fontSize="xs" color="textMuted" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text
        fontSize="3xl"
        fontWeight="700"
        fontFamily="var(--font-playfair), Georgia, serif"
        color={accent}
        mt={1}
      >
        {value}
      </Text>
      {sub && (
        <Text fontSize="sm" color="textSecondary" mt={1}>
          {sub}
        </Text>
      )}
      {pct !== undefined && (
        <Box mt={3} h={1.5} borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
          <Box h="full" w={`${pct}%`} bg={accent} transition="width 0.4s ease" />
        </Box>
      )}
    </Box>
  );
}
