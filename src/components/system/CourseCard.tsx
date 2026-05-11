"use client";

import Link from "next/link";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { SystemLabel, type GlowAccent } from "./SystemPrimitives";

/**
 * CourseCard — the System-flavoured row used for course modules, openings,
 * endgames, and tactical puzzles in /learning. Designed for the squint
 * test: the chamfered border, eyebrow tag, and right-side ENTER glyph make
 * the click target obvious without reading any body copy.
 *
 * Variants:
 *   • "module"  — full-width row with a glyph block on the left + title +
 *                  description + ENTER pill on the right
 *   • "tile"    — square-ish tile for grid layouts (Openings / Endgames)
 *   • "feature" — large hero card for "Daily Gate" with strong glow
 */

interface CourseCardProps {
  href: string;
  title: string;
  subtitle?: string;
  description?: string;
  /** Eyebrow tag, e.g. "GATE · TIER E" or "DAILY". */
  tag?: string;
  /** Right-side meta — colour ("White") or rating ("1500") or theme list. */
  meta?: string;
  /** Three-tier difficulty (1=easy, 3=hard). Renders bars. */
  difficulty?: number;
  /** Visual variant — see file header. */
  variant?: "module" | "tile" | "feature";
  /** Accent colour for the card. */
  accent?: GlowAccent;
  /** Optional left glyph (e.g. "♞", "♚", "✦", or a category letter). */
  glyph?: string;
  /** Disabled = locked. Renders dimmed + lock icon, not clickable. */
  locked?: boolean;
  /** Reason for being locked, shown when hovered (e.g. "Reach C-Rank"). */
  lockReason?: string;
}

const ACCENT_VAR: Record<GlowAccent, string> = {
  cyan: "var(--sys-cyan)",
  purple: "var(--sys-purple)",
  epic: "var(--sys-epic)",
  threat: "var(--sys-threat)",
  gold: "var(--sys-prestige-gold)",
};

const ACCENT_RGB: Record<GlowAccent, string> = {
  cyan: "0, 240, 255",
  purple: "138, 43, 226",
  epic: "177, 151, 252",
  threat: "240, 101, 149",
  gold: "245, 194, 68",
};

export function CourseCard({
  href,
  title,
  subtitle,
  description,
  tag,
  meta,
  difficulty,
  variant = "module",
  accent = "cyan",
  glyph,
  locked = false,
  lockReason,
}: CourseCardProps) {
  const accentVar = ACCENT_VAR[accent];
  const rgb = ACCENT_RGB[accent];

  const cardInner =
    variant === "feature" ? (
      <FeatureCard
        title={title}
        subtitle={subtitle}
        description={description}
        tag={tag}
        meta={meta}
        glyph={glyph}
        accentVar={accentVar}
        rgb={rgb}
      />
    ) : variant === "tile" ? (
      <TileCard
        title={title}
        subtitle={subtitle}
        description={description}
        tag={tag}
        meta={meta}
        glyph={glyph}
        accentVar={accentVar}
        rgb={rgb}
      />
    ) : (
      <ModuleCard
        title={title}
        subtitle={subtitle}
        description={description}
        tag={tag}
        meta={meta}
        difficulty={difficulty}
        glyph={glyph}
        accentVar={accentVar}
        rgb={rgb}
      />
    );

  if (locked) {
    return (
      <Box
        position="relative"
        opacity={0.45}
        cursor="not-allowed"
        title={lockReason ?? "Locked"}
      >
        {cardInner}
        <Box
          position="absolute"
          top={3}
          right={3}
          px={2}
          py={1}
          bg="rgba(10,11,14,0.85)"
          borderWidth="1px"
          borderColor="rgba(255,255,255,0.25)"
          className="sys-clip-panel-sm"
        >
          <Text
            fontSize="2xs"
            color="textMuted"
            letterSpacing="0.18em"
            textTransform="uppercase"
            fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
          >
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

/* ─────────── Module variant (full-width row) ─────────── */

function ModuleCard(p: {
  title: string;
  subtitle?: string;
  description?: string;
  tag?: string;
  meta?: string;
  difficulty?: number;
  glyph?: string;
  accentVar: string;
  rgb: string;
}) {
  return (
    <Box
      position="relative"
      p={4}
      bg="rgba(10,11,14,0.72)"
      borderWidth="1px"
      borderColor={`rgba(${p.rgb}, 0.32)`}
      className="sys-clip-panel"
      transition="all 0.18s"
      _hover={{
        borderColor: p.accentVar,
        bg: "rgba(10,11,14,0.85)",
        boxShadow: `0 0 28px rgba(${p.rgb}, 0.35)`,
      }}
    >
      <HStack gap={4} align="center">
        {p.glyph && <GlyphBlock glyph={p.glyph} accentVar={p.accentVar} rgb={p.rgb} />}
        <VStack align="stretch" gap={1} flex={1} minW={0}>
          <HStack gap={2} align="center">
            {p.tag && (
              <Text
                fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
                fontSize="2xs"
                fontWeight="800"
                color={p.accentVar}
                letterSpacing="0.22em"
                textTransform="uppercase"
                style={{ textShadow: `0 0 4px rgba(${p.rgb}, 0.5)` }}
              >
                {p.tag}
              </Text>
            )}
            {p.difficulty && <DifficultyBars difficulty={p.difficulty} accentVar={p.accentVar} />}
            {p.meta && (
              <Text
                fontSize="2xs"
                color="textMuted"
                letterSpacing="0.16em"
                textTransform="uppercase"
                fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
              >
                · {p.meta}
              </Text>
            )}
          </HStack>
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            color="textPrimary"
            fontWeight="700"
            fontSize="lg"
            lineHeight="1.15"
          >
            {p.title}
          </Text>
          {p.subtitle && (
            <Text fontSize="sm" color={p.accentVar} fontWeight="600" lineHeight="1.3">
              {p.subtitle}
            </Text>
          )}
          {p.description && (
            <Text fontSize="sm" color="textSecondary" lineHeight="1.45" lineClamp={2}>
              {p.description}
            </Text>
          )}
        </VStack>
        <EnterPill accentVar={p.accentVar} rgb={p.rgb} />
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
  accentVar: string;
  rgb: string;
}) {
  return (
    <Box
      position="relative"
      p={4}
      bg="rgba(10,11,14,0.72)"
      borderWidth="1px"
      borderColor={`rgba(${p.rgb}, 0.32)`}
      className="sys-clip-panel"
      h="full"
      transition="all 0.18s"
      _hover={{
        borderColor: p.accentVar,
        bg: "rgba(10,11,14,0.88)",
        boxShadow: `0 0 26px rgba(${p.rgb}, 0.32)`,
      }}
    >
      <HStack justify="space-between" mb={2}>
        {p.tag && (
          <Text
            fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
            fontSize="2xs"
            fontWeight="800"
            color={p.accentVar}
            letterSpacing="0.22em"
            textTransform="uppercase"
            style={{ textShadow: `0 0 4px rgba(${p.rgb}, 0.5)` }}
          >
            {p.tag}
          </Text>
        )}
        {p.meta && (
          <Text
            fontSize="2xs"
            color="textMuted"
            letterSpacing="0.16em"
            textTransform="uppercase"
            fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
          >
            {p.meta}
          </Text>
        )}
      </HStack>
      <HStack gap={3} align="flex-start">
        {p.glyph && <GlyphBlock glyph={p.glyph} accentVar={p.accentVar} rgb={p.rgb} compact />}
        <Box flex={1}>
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            color="textPrimary"
            fontWeight="700"
            fontSize="lg"
            lineHeight="1.15"
          >
            {p.title}
          </Text>
          {p.subtitle && (
            <Text fontSize="xs" color={p.accentVar} fontWeight="700" mt={0.5} letterSpacing="0.04em">
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
        <EnterPill accentVar={p.accentVar} rgb={p.rgb} compact />
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
  accentVar: string;
  rgb: string;
}) {
  return (
    <Box
      position="relative"
      p={{ base: 5, md: 6 }}
      bg="rgba(10,11,14,0.78)"
      borderWidth="1px"
      borderColor={p.accentVar}
      className="sys-clip-panel"
      backdropFilter="blur(8px)"
      transition="all 0.18s"
      style={{
        boxShadow: `0 0 32px rgba(${p.rgb}, 0.32), inset 0 0 24px rgba(${p.rgb}, 0.06)`,
      }}
      _hover={{
        bg: "rgba(10,11,14,0.9)",
      }}
    >
      <Box
        position="absolute"
        inset={0}
        opacity={0.06}
        backgroundImage={`linear-gradient(${p.accentVar} 1px, transparent 1px), linear-gradient(90deg, ${p.accentVar} 1px, transparent 1px)`}
        backgroundSize="48px 48px"
        pointerEvents="none"
        className="sys-clip-panel"
      />
      <HStack
        gap={{ base: 3, md: 5 }}
        align="center"
        flexWrap={{ base: "wrap", md: "nowrap" }}
        position="relative"
        zIndex={1}
      >
        {p.glyph && <GlyphBlock glyph={p.glyph} accentVar={p.accentVar} rgb={p.rgb} large />}
        <VStack align="stretch" gap={1.5} flex={1} minW={0}>
          {p.tag && <SystemLabel accent={glowAccentForVar(p.accentVar)}>{p.tag}</SystemLabel>}
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            color="textPrimary"
            fontWeight="700"
            fontSize={{ base: "2xl", md: "3xl" }}
            lineHeight="1.05"
          >
            {p.title}
          </Text>
          {p.subtitle && (
            <Text fontSize="md" color={p.accentVar} fontWeight="700">
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
          <EnterPill accentVar={p.accentVar} rgb={p.rgb} />
        </Box>
      </HStack>
    </Box>
  );
}

/* ─────────── Building blocks ─────────── */

function GlyphBlock({
  glyph,
  accentVar,
  rgb,
  compact = false,
  large = false,
}: {
  glyph: string;
  accentVar: string;
  rgb: string;
  compact?: boolean;
  large?: boolean;
}) {
  const size = large ? "72px" : compact ? "44px" : "56px";
  const fontSize = large ? "4xl" : compact ? "xl" : "2xl";
  return (
    <Box
      position="relative"
      w={size}
      h={size}
      flexShrink={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        position="absolute"
        inset={0}
        className="sys-clip-hex"
        bg={accentVar}
        style={{ filter: `drop-shadow(0 0 10px rgba(${rgb}, 0.7))` }}
      />
      <Box position="absolute" inset="2px" className="sys-clip-hex" bg="var(--sys-void)" />
      <Text
        position="relative"
        zIndex={1}
        fontSize={fontSize}
        color={accentVar}
        fontWeight="700"
        lineHeight="1"
        style={{ textShadow: `0 0 10px ${accentVar}` }}
      >
        {glyph}
      </Text>
    </Box>
  );
}

function DifficultyBars({ difficulty, accentVar }: { difficulty: number; accentVar: string }) {
  const lvl = Math.min(3, Math.max(1, difficulty));
  return (
    <HStack gap="3px">
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          w="4px"
          h={i === 1 ? "6px" : i === 2 ? "9px" : "12px"}
          bg={i <= lvl ? accentVar : "rgba(255,255,255,0.15)"}
          style={{ boxShadow: i <= lvl ? `0 0 6px ${accentVar}` : undefined }}
        />
      ))}
    </HStack>
  );
}

function EnterPill({
  accentVar,
  rgb,
  compact = false,
}: {
  accentVar: string;
  rgb: string;
  compact?: boolean;
}) {
  return (
    <Box
      flexShrink={0}
      px={compact ? 3 : 4}
      py={compact ? 1.5 : 2}
      bg={`rgba(${rgb}, 0.12)`}
      borderWidth="1px"
      borderColor={accentVar}
      className="sys-clip-panel-sm"
      transition="all 0.15s"
      style={{ boxShadow: `0 0 10px rgba(${rgb}, 0.3)` }}
    >
      <HStack gap={1.5}>
        <Text
          fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
          fontSize={compact ? "2xs" : "xs"}
          fontWeight="800"
          color={accentVar}
          letterSpacing="0.2em"
          textTransform="uppercase"
        >
          Enter
        </Text>
        <Text fontSize={compact ? "sm" : "md"} color={accentVar} lineHeight="1">
          ▶
        </Text>
      </HStack>
    </Box>
  );
}


function glowAccentForVar(v: string): GlowAccent {
  if (v.includes("cyan")) return "cyan";
  if (v.includes("purple")) return "purple";
  if (v.includes("epic")) return "epic";
  if (v.includes("threat")) return "threat";
  return "gold";
}
