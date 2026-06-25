"use client";

import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import type { Stage, World } from "@/lib/learn/types";

const PULSE = `@keyframes lp{0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,.55)}50%{box-shadow:0 0 0 10px rgba(212,175,55,0)}}`;

type NodeState = "done" | "active" | "locked";

function MapNode({
  href,
  icon,
  title,
  state,
  accent,
}: {
  href: string;
  icon: string;
  title: string;
  state: NodeState;
  accent: string;
}) {
  const circle = (
    <Box
      w="64px"
      h="64px"
      borderRadius="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="26px"
      flexShrink={0}
      color={state === "locked" ? "blackAlpha.500" : "white"}
      bg={state === "done" ? "gold" : state === "active" ? accent : "blackAlpha.100"}
      borderWidth="3px"
      borderColor={state === "done" ? "goldLight" : state === "active" ? "white" : "blackAlpha.200"}
      boxShadow={state === "locked" ? "none" : "0 8px 20px -8px rgba(0,0,0,0.35)"}
      style={state === "active" ? { animation: "lp 2.2s ease-in-out infinite" } : undefined}
      transition="transform 0.15s"
      _hover={state !== "locked" ? { transform: "scale(1.08)" } : undefined}
    >
      {state === "done" ? "✓" : state === "locked" ? "🔒" : icon}
    </Box>
  );

  return (
    <VStack gap={1.5} w="104px" textAlign="center">
      {state === "locked" ? circle : <Link href={href}>{circle}</Link>}
      <Text fontSize="2xs" lineHeight="1.2" color={state === "locked" ? "textMuted" : "textSecondary"} fontWeight={state === "active" ? "700" : "500"}>
        {title}
      </Text>
    </VStack>
  );
}

function StageBlock({
  stage,
  locked,
  prevStageName,
  nodeState,
}: {
  stage: Stage;
  locked: boolean;
  prevStageName?: string;
  nodeState: (lessonId: string) => NodeState;
}) {
  return (
    <Box position="relative" w="full">
      {/* Village banner */}
      <HStack justify="center" gap={3} mb={6}>
        <Box w="44px" h="44px" borderRadius="14px" display="flex" alignItems="center" justifyContent="center"
          fontSize="22px" color="white" bg={stage.accent} boxShadow="0 8px 20px -10px rgba(0,0,0,0.4)">
          {stage.icon}
        </Box>
        <Box textAlign="left">
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="lg" color="textPrimary" lineHeight="1.1">
            {stage.name}
          </Text>
          <Text fontSize="2xs" color="textMuted" letterSpacing="0.08em" textTransform="uppercase">
            {stage.tagline}
          </Text>
        </Box>
      </HStack>

      {/* Serpentine path of lesson nodes */}
      <VStack gap={4} position="relative">
        {stage.lessons.map((lesson, k) => (
          <Flex key={lesson.id} w="full" maxW="420px" justify={k % 2 === 0 ? "flex-start" : "flex-end"} px={{ base: 2, sm: 6 }}>
            <MapNode
              href={`/learn/lesson/${lesson.id}`}
              icon={lesson.icon}
              title={lesson.title}
              state={nodeState(lesson.id)}
              accent={stage.accent}
            />
          </Flex>
        ))}
      </VStack>

      {/* Cloud gate over a locked village */}
      {locked && (
        <Flex
          position="absolute"
          inset={0}
          align="center"
          justify="center"
          borderRadius="soft"
          bg="rgba(245,243,237,0.55)"
          backdropFilter="blur(4px)"
          flexDir="column"
          gap={2}
          textAlign="center"
          px={6}
        >
          <Text fontSize="40px" lineHeight="1">☁️</Text>
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="md" color="textPrimary">
            {stage.name}
          </Text>
          <Text fontSize="xs" color="textSecondary" maxW="260px">
            {prevStageName ? `Clear ${prevStageName} to part the clouds.` : "Keep going to unlock this village."}
          </Text>
        </Flex>
      )}
    </Box>
  );
}

export function EntryMap({
  world,
  nodeState,
  isStageUnlocked,
}: {
  world: World;
  nodeState: (lessonId: string) => NodeState;
  isStageUnlocked: (firstLessonId: string) => boolean;
}) {
  return (
    <Box position="relative" maxW="620px" mx="auto">
      <style>{PULSE}</style>
      {/* central winding line */}
      <Box position="absolute" left="50%" top="80px" bottom="40px" w="0" borderLeftWidth="2px" borderStyle="dashed" borderColor="blackAlpha.200" transform="translateX(-50%)" zIndex={0} />
      <VStack gap={14} position="relative" zIndex={1}>
        {world.map((stage, idx) => (
          <StageBlock
            key={stage.id}
            stage={stage}
            locked={!isStageUnlocked(stage.lessons[0]?.id ?? "")}
            prevStageName={idx > 0 ? world[idx - 1].name : undefined}
            nodeState={nodeState}
          />
        ))}
      </VStack>
    </Box>
  );
}
