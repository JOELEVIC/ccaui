"use client";

import { useState } from "react";
import { Box, Button, Flex, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { EntryMap } from "@/components/learn/EntryMap";
import { ENTRY_WORLD } from "@/lib/learn/entryCurriculum";
import { useLearnProgress } from "@/lib/learn/useLearnProgress";

type Tab = "entry" | "r2m";

export default function LearnPage() {
  const [tab, setTab] = useState<Tab>("entry");
  const { isComplete, isUnlocked, isStageUnlocked, completedCount, total } = useLearnProgress(ENTRY_WORLD);

  const nodeState = (id: string): "done" | "active" | "locked" =>
    isComplete(id) ? "done" : isUnlocked(id) ? "active" : "locked";

  return (
    <VStack align="stretch" gap={8}>
      {/* Hero */}
      <Box>
        <Heading fontFamily="var(--font-playfair), Georgia, serif" size="2xl" color="textPrimary">
          Learn
        </Heading>
        <Text color="textSecondary" mt={1}>
          From your very first pawn move to mastery — one clear idea at a time.
        </Text>
      </Box>

      {/* Section selector */}
      <HStack gap={2} flexWrap="wrap" borderBottomWidth="1px" borderColor="blackAlpha.200" pb={3}>
        <SectionTab label="Entry" active={tab === "entry"} onClick={() => setTab("entry")} />
        <SectionTab label="Road to Master" active={tab === "r2m"} onClick={() => setTab("r2m")} />
        {/* Advanced — visible, intriguing, but sealed. No "coming soon", just locked. */}
        <Box
          px={4}
          py={2}
          borderRadius="full"
          fontSize="sm"
          fontWeight="600"
          color="textMuted"
          cursor="not-allowed"
          userSelect="none"
          title="Sealed for now"
          background="linear-gradient(120deg, rgba(212,175,55,0.10), rgba(139,92,246,0.10))"
          borderWidth="1px"
          borderColor="blackAlpha.200"
          opacity={0.8}
        >
          Advanced 🔒
        </Box>
      </HStack>

      {tab === "entry" && (
        <VStack align="stretch" gap={6}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <Text color="textSecondary" maxW="2xl" fontSize="sm" lineHeight="1.6">
              Begin on an empty board with a single pawn and grow from there — pieces, the board itself, and how they
              work together. Clear each village to part the clouds over the next.
            </Text>
            <Box textAlign="right" flexShrink={0}>
              <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="2xl" color="gold" lineHeight="1">
                {completedCount}/{total}
              </Text>
              <Text fontSize="2xs" color="textMuted" letterSpacing="0.1em" textTransform="uppercase">
                lessons done
              </Text>
            </Box>
          </Flex>

          <Box bg="bgCard" borderRadius="soft" borderWidth="1px" borderColor="blackAlpha.100" py={10} px={{ base: 2, md: 6 }}>
            <EntryMap world={ENTRY_WORLD} nodeState={nodeState} isStageUnlocked={isStageUnlocked} />
          </Box>
        </VStack>
      )}

      {tab === "r2m" && <RoadToMasterPanel />}
    </VStack>
  );
}

function SectionTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Box
      as="button"
      onClick={onClick}
      px={4}
      py={2}
      borderRadius="full"
      fontSize="sm"
      fontWeight="600"
      cursor="pointer"
      color={active ? "white" : "textSecondary"}
      bg={active ? "gold" : "transparent"}
      borderWidth="1px"
      borderColor={active ? "gold" : "blackAlpha.200"}
      _hover={active ? {} : { borderColor: "goldDark", color: "gold" }}
    >
      {label}
    </Box>
  );
}

function RoadToMasterPanel() {
  const steps = [
    { t: "Learn", b: "Short lessons that teach one idea — tactics, strategy, endgames." },
    { t: "Practice", b: "Drill each idea against the engine and in puzzles tuned to your level." },
    { t: "Review", b: "See your strongest and weakest areas, and exactly what to study next." },
  ];
  return (
    <VStack align="stretch" gap={6}>
      <Box
        p={{ base: 6, md: 8 }}
        borderRadius="soft"
        bg="bgCard"
        borderWidth="1px"
        borderColor="blackAlpha.100"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" inset={0} background="radial-gradient(ellipse at 85% 20%, rgba(197,160,89,0.12) 0%, transparent 60%)" pointerEvents="none" />
        <VStack align="flex-start" gap={4} position="relative">
          <Text fontSize="xs" color="gold" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase">
            Training
          </Text>
          <Heading fontFamily="var(--font-playfair), Georgia, serif" size="xl" color="textPrimary" lineHeight="1.1">
            A clear, step-by-step path to improvement
          </Heading>
          <Text color="textSecondary" maxW="2xl" lineHeight="1.65">
            Once the basics feel natural, follow a structured curriculum at your own pace. Every puzzle, drill, and
            game feeds into clear progress and a focused plan for what to study next.
          </Text>
          <HStack gap={3} pt={1} flexWrap="wrap">
            <Link href="/road-to-master">
              <Button size="lg" bg="gold" color="white" borderRadius="soft" px={8} _hover={{ bg: "goldLight" }}>
                Start training
              </Button>
            </Link>
            <Link href="/learning">
              <Button size="lg" variant="outline" borderColor="blackAlpha.300" color="textPrimary" borderRadius="soft"
                _hover={{ borderColor: "gold", color: "gold" }}>
                Browse lessons
              </Button>
            </Link>
          </HStack>
        </VStack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        {steps.map((s, i) => (
          <Box key={s.t} p={5} bg="bgCard" borderRadius="soft" borderWidth="1px" borderColor="blackAlpha.200">
            <Box w="26px" h="26px" borderRadius="full" bg="bgWarm" color="textPrimary" display="flex" alignItems="center"
              justifyContent="center" fontSize="sm" fontWeight="700" mb={3}>
              {i + 1}
            </Box>
            <Text color="textPrimary" fontWeight="600" mb={1}>{s.t}</Text>
            <Text color="textSecondary" fontSize="sm" lineHeight="1.55">{s.b}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
