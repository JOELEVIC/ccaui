"use client";

import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import type { Stage, World } from "@/lib/learn/types";

const PULSE = `@keyframes lp{0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,.55)}50%{box-shadow:0 0 0 10px rgba(212,175,55,0)}}`;
const ROW_H = 124; // vertical spacing between lesson nodes

type NodeState = "done" | "active" | "locked";

function nodeX(k: number, n: number): number {
  if (n === 1) return 50;
  return k % 2 === 0 ? 28 : 72;
}

/** A winding-road SVG path through the stage's node points (viewBox 0..100 × 0..H). */
function roadPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let k = 1; k < points.length; k++) {
    const p0 = points[k - 1];
    const p1 = points[k];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }
  return d;
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
  const n = stage.lessons.length;
  const H = n * ROW_H;
  const points = stage.lessons.map((_, k) => ({ x: nodeX(k, n), y: (k + 0.5) * ROW_H }));
  const d = roadPath(points);

  return (
    <Box position="relative" w="full">
      {/* Village banner */}
      <HStack justify="center" gap={3} mb={5}>
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

      {/* Nodes + the road that links them */}
      <Box position="relative" w="full" h={`${H}px`}>
        {d && (
          <svg
            viewBox={`0 0 100 ${H}`}
            preserveAspectRatio="none"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, zIndex: 0 }}
          >
            {/* road bed, surface, then dashed centre line — like a real road */}
            <path d={d} fill="none" stroke="#a9803f" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <path d={d} fill="none" stroke="#d8bd8a" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <path d={d} fill="none" stroke="#fffaf0" strokeWidth={2} strokeDasharray="5 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.85} />
          </svg>
        )}

        {stage.lessons.map((lesson, k) => {
          const x = nodeX(k, n);
          const cy = (k + 0.5) * ROW_H;
          const state = nodeState(lesson.id);
          const circle = (
            <Box
              w="62px"
              h="62px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="26px"
              color={state === "locked" ? "blackAlpha.500" : "white"}
              bg={state === "done" ? "gold" : state === "active" ? stage.accent : "#e7e2d6"}
              borderWidth="4px"
              borderColor={state === "done" ? "goldLight" : state === "active" ? "white" : "#d6cfbe"}
              boxShadow={state === "locked" ? "0 4px 10px -6px rgba(0,0,0,0.3)" : "0 8px 22px -8px rgba(0,0,0,0.45)"}
              style={state === "active" ? { animation: "lp 2.2s ease-in-out infinite" } : undefined}
              transition="transform 0.15s"
              _hover={state !== "locked" ? { transform: "scale(1.08)" } : undefined}
            >
              {state === "done" ? "✓" : state === "locked" ? "🔒" : lesson.icon}
            </Box>
          );
          return (
            <Box key={lesson.id}>
              <Box position="absolute" left={`${x}%`} top={`${cy}px`} transform="translate(-50%,-50%)" zIndex={1}>
                {state === "locked" ? circle : <Link href={`/learn/lesson/${lesson.id}`}>{circle}</Link>}
              </Box>
              <Text
                position="absolute"
                left={`${x}%`}
                top={`${cy + 38}px`}
                transform="translateX(-50%)"
                w="124px"
                textAlign="center"
                zIndex={1}
                fontSize="2xs"
                lineHeight="1.2"
                color={state === "locked" ? "textMuted" : "textSecondary"}
                fontWeight={state === "active" ? "700" : "500"}
              >
                {lesson.title}
              </Text>
            </Box>
          );
        })}

        {/* Cloud gate over a locked village */}
        {locked && (
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            borderRadius="soft"
            bg="rgba(245,243,237,0.6)"
            backdropFilter="blur(4px)"
            flexDir="column"
            gap={2}
            textAlign="center"
            px={6}
            zIndex={2}
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
    <Box position="relative" maxW="560px" mx="auto">
      <style>{PULSE}</style>
      <Box display="flex" flexDirection="column" gap={10}>
        {world.map((stage, idx) => (
          <StageBlock
            key={stage.id}
            stage={stage}
            locked={!isStageUnlocked(stage.lessons[0]?.id ?? "")}
            prevStageName={idx > 0 ? world[idx - 1].name : undefined}
            nodeState={nodeState}
          />
        ))}
      </Box>
    </Box>
  );
}
