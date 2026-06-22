"use client";

import Link from "next/link";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { type GlowAccent } from "./SystemPrimitives";

/**
 * CourseCard — a clean, standard card used for course modules, openings,
 * endgames, and tactical puzzles in /learning. Light surface, hairline
 * border, gold accent. Three variants:
 *   • "module"  — full-width row (glyph + title + description + Open)
 *   • "tile"    — grid item
 *   • "feature" — larger hero card (e.g. "Today's puzzle")
 */

interface CourseCardProps {
  href: string;
  title: string;
  subtitle?: string;
  description?: string;
  /** Eyebrow tag, e.g. "DAILY" or a category. */
  tag?: string;
  /** Right-side meta — colour ("White"), rating ("1500"), or theme list. */
  meta?: string;
  /** Three-tier difficulty (1=easy, 3=hard). Renders bars. */
  difficulty?: number;
  variant?: "module" | "tile" | "feature";
  /** Accepted for API compatibility; styling is uniformly gold/charcoal. */
  accent?: GlowAccent;
  /** Optional left glyph (e.g. "♞", "♚", "✦", or a category letter). */
  glyph?: string;
  /** Disabled = locked. Renders dimmed + lock badge, not clickable. */
  locked?: boolean;
  lockReason?: string;
}

export function CourseCard({
  href,
  title,
  subtitle,
  description,
  tag,
  meta,
  difficulty,
  variant = "module",
  glyph,
  locked = false,
  lockReason,
}: CourseCardProps) {
  const cardInner =
    variant === "feature" ? (
      <FeatureCard title={title} subtitle={subtitle} description={description} tag={tag} meta={meta} glyph={glyph} />
    ) : variant === "tile" ? (
      <TileCard title={title} subtitle={subtitle} description={description} tag={tag} meta={meta} glyph={glyph} />
    ) : (
      <ModuleCard title={title} subtitle={subtitle} description={description} tag={tag} meta={meta} difficulty={difficulty} glyph={glyph} />
    );

  if (locked) {
    return (
      <Box position="relative" opacity={0.55} cursor="not-allowed" title={lockReason ?? "Locked"}>
        {cardInner}
        <Box
          position="absolute"
          top={3}
          right={3}
          px={2.5}
          py={1}
          bg="bgWarm"
          borderRadius="full"
          borderWidth="1px"
          borderColor="blackAlpha.200"
        >
          <Text fontSize="2xs" color="textMuted" letterSpacing="0.1em" textTransform="uppercase" fontWeight="600">
            🔒 {lockReason ?? "Locked"}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Link href={href} style={{ display: "block", textDecoration: "none" }}>
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}>
        {cardInner}
      </motion.div>
    </Link>
  );
}

const CARD_SX = {
  bg: "bgCard",
  borderWidth: "1px",
  borderColor: "blackAlpha.200",
  borderRadius: "soft",
  transition: "all 0.18s",
} as const;

const CARD_HOVER = {
  borderColor: "goldDark",
  boxShadow: "0 12px 30px -16px rgba(26,37,48,0.18)",
} as const;

/* ─────────── Module variant (full-width row) ─────────── */

function ModuleCard(p: {
  title: string;
  subtitle?: string;
  description?: string;
  tag?: string;
  meta?: string;
  difficulty?: number;
  glyph?: string;
}) {
  return (
    <Box {...CARD_SX} p={4} _hover={CARD_HOVER}>
      <HStack gap={4} align="center">
        {p.glyph && <GlyphBlock glyph={p.glyph} />}
        <VStack align="stretch" gap={1} flex={1} minW={0}>
          <HStack gap={2} align="center">
            {p.tag && <TagLabel>{p.tag}</TagLabel>}
            {p.difficulty && <DifficultyBars difficulty={p.difficulty} />}
            {p.meta && <MetaText>· {p.meta}</MetaText>}
          </HStack>
          <Text fontFamily="var(--font-playfair), Georgia, serif" color="textPrimary" fontWeight="700" fontSize="lg" lineHeight="1.15">
            {p.title}
          </Text>
          {p.subtitle && (
            <Text fontSize="sm" color="textSecondary" fontWeight="600" lineHeight="1.3">
              {p.subtitle}
            </Text>
          )}
          {p.description && (
            <Text fontSize="sm" color="textSecondary" lineHeight="1.45" lineClamp={2}>
              {p.description}
            </Text>
          )}
        </VStack>
        <OpenLink />
      </HStack>
    </Box>
  );
}

/* ─────────── Tile variant (grid item) ─────────── */

function TileCard(p: {
  title: string;
  subtitle?: string;
  description?: string;
  tag?: string;
  meta?: string;
  glyph?: string;
}) {
  return (
    <Box {...CARD_SX} p={4} h="full" _hover={CARD_HOVER}>
      <HStack justify="space-between" mb={2}>
        {p.tag && <TagLabel>{p.tag}</TagLabel>}
        {p.meta && <MetaText>{p.meta}</MetaText>}
      </HStack>
      <HStack gap={3} align="flex-start">
        {p.glyph && <GlyphBlock glyph={p.glyph} compact />}
        <Box flex={1}>
          <Text fontFamily="var(--font-playfair), Georgia, serif" color="textPrimary" fontWeight="700" fontSize="lg" lineHeight="1.15">
            {p.title}
          </Text>
          {p.subtitle && (
            <Text fontSize="xs" color="textSecondary" fontWeight="600" mt={0.5}>
              {p.subtitle}
            </Text>
          )}
        </Box>
      </HStack>
      {p.description && (
        <Text mt={2.5} fontSize="sm" color="textSecondary" lineHeight="1.45" lineClamp={3}>
          {p.description}
        </Text>
      )}
      <HStack mt={3} justify="flex-end">
        <OpenLink />
      </HStack>
    </Box>
  );
}

/* ─────────── Feature variant (hero card) ─────────── */

function FeatureCard(p: {
  title: string;
  subtitle?: string;
  description?: string;
  tag?: string;
  meta?: string;
  glyph?: string;
}) {
  return (
    <Box {...CARD_SX} p={{ base: 5, md: 6 }} _hover={CARD_HOVER}>
      <HStack gap={{ base: 3, md: 5 }} align="center" flexWrap={{ base: "wrap", md: "nowrap" }}>
        {p.glyph && <GlyphBlock glyph={p.glyph} large />}
        <VStack align="stretch" gap={1.5} flex={1} minW={0}>
          {p.tag && <TagLabel>{p.tag}</TagLabel>}
          <Text fontFamily="var(--font-playfair), Georgia, serif" color="textPrimary" fontWeight="700" fontSize={{ base: "2xl", md: "3xl" }} lineHeight="1.05">
            {p.title}
          </Text>
          {p.subtitle && (
            <Text fontSize="md" color="textSecondary" fontWeight="600">
              {p.subtitle}
            </Text>
          )}
          {p.description && (
            <Text fontSize="sm" color="textSecondary" lineHeight="1.5">
              {p.description}
            </Text>
          )}
        </VStack>
        <Box flexShrink={0} display={{ base: "none", md: "block" }}>
          <OpenLink />
        </Box>
      </HStack>
    </Box>
  );
}

/* ─────────── Building blocks ─────────── */

function GlyphBlock({ glyph, compact = false, large = false }: { glyph: string; compact?: boolean; large?: boolean }) {
  const size = large ? "64px" : compact ? "44px" : "52px";
  const fontSize = large ? "3xl" : compact ? "xl" : "2xl";
  return (
    <Box
      w={size}
      h={size}
      flexShrink={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="md"
      bg="bgWarm"
      color="gold"
      fontFamily="serif"
    >
      <Text fontSize={fontSize} lineHeight="1">
        {glyph}
      </Text>
    </Box>
  );
}

function TagLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text fontSize="2xs" fontWeight="700" color="gold" letterSpacing="0.18em" textTransform="uppercase">
      {children}
    </Text>
  );
}

function MetaText({ children }: { children: React.ReactNode }) {
  return (
    <Text fontSize="2xs" color="textMuted" letterSpacing="0.12em" textTransform="uppercase">
      {children}
    </Text>
  );
}

function DifficultyBars({ difficulty }: { difficulty: number }) {
  const lvl = Math.min(3, Math.max(1, difficulty));
  return (
    <HStack gap="3px">
      {[1, 2, 3].map((i) => (
        <Box key={i} w="4px" h={i === 1 ? "6px" : i === 2 ? "9px" : "12px"} borderRadius="1px" bg={i <= lvl ? "gold" : "blackAlpha.200"} />
      ))}
    </HStack>
  );
}

function OpenLink() {
  return (
    <Text flexShrink={0} fontSize="sm" fontWeight="600" color="gold">
      Open →
    </Text>
  );
}
