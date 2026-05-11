"use client";

import { useEffect, useState } from "react";
import { Box, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { HexRadar } from "./HexRadar";
import {
  SystemPanel,
  SystemButton,
  SystemLabel,
  SYSTEM_KEYFRAMES,
} from "./SystemPrimitives";
import { ATTR_META, ATTR_ORDER, type HunterClassDef } from "@/lib/r2m-attributes";
import {
  profileFromChessCom,
  placeholderProfile,
  type HunterProfile,
} from "@/lib/r2m-classifier";
import { tierForRating, type R2MTier } from "@/lib/r2m";

interface StatusWindowProps {
  username: string;
  rating: number;
  /** Pre-loaded profile (e.g. from server); when present we skip the placeholder. */
  initialProfile?: HunterProfile;
  /** Chess.com handle to auto-fetch on mount. */
  chessComHandle?: string;
  /** Optional close handler — when present the window renders as a modal. */
  onClose?: () => void;
}

/**
 * The Hunter Status Window.
 *
 * Three regions, top-to-bottom:
 *   1. Hunter Licence (rank diamond + class badge + mentor)
 *   2. Hexagonal Radar of the six attributes
 *   3. Recommended Dungeon (driven by weakest stat)
 *
 * If no profile is supplied and no Chess.com handle, we show a placeholder
 * based purely on the rating tier — and a "Link Chess.com" CTA.
 */
export function StatusWindow({
  username,
  rating,
  initialProfile,
  chessComHandle,
  onClose,
}: StatusWindowProps) {
  const tier = tierForRating(rating);
  const [profile, setProfile] = useState<HunterProfile>(
    () => initialProfile ?? placeholderProfile(rating)
  );
  const [handle, setHandle] = useState(chessComHandle ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState<boolean>(Boolean(initialProfile));

  useEffect(() => {
    if (initialProfile) return;
    if (!chessComHandle) return;
    void runSync(chessComHandle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chessComHandle]);

  async function runSync(name: string) {
    const target = name.trim();
    if (!target) {
      setError("Enter a Chess.com username first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await profileFromChessCom(target);
      next.username = username; // display name
      setProfile(next);
      setSynced(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setLoading(false);
    }
  }

  const inner = (
    <Box position="relative">
      <style dangerouslySetInnerHTML={{ __html: SYSTEM_KEYFRAMES }} />
      <SystemPanel accent="cyan" glow="strong" brackets p={{ base: 5, md: 7 }}>
        <VStack align="stretch" gap={5}>
          <Header username={username} tier={tier} hunterClass={profile.hunterClass} onClose={onClose} />

          <HStack
            gap={6}
            align="flex-start"
            flexWrap={{ base: "wrap", md: "nowrap" }}
            justify={{ base: "center", md: "space-between" }}
          >
            {/* Radar */}
            <Box
              position="relative"
              flexShrink={0}
              w={{ base: "320px", md: "360px" }}
              h={{ base: "320px", md: "360px" }}
            >
              {/* Subtle backdrop disc */}
              <Box
                position="absolute"
                inset={6}
                borderRadius="full"
                background="radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)"
                pointerEvents="none"
              />
              <HexRadar
                attributes={profile.attributes}
                size={360}
                accent={profile.hunterClass.accent}
              />
            </Box>

            {/* Attribute rail */}
            <VStack flex={1} align="stretch" gap={2} minW={{ base: "full", md: "220px" }}>
              <SystemLabel accent="cyan">Attributes</SystemLabel>
              {ATTR_ORDER.map((k) => {
                const meta = ATTR_META[k];
                const v = profile.attributes[k];
                return (
                  <AttributeRow
                    key={k}
                    label={meta.label}
                    flavour={meta.flavour}
                    value={v}
                    accent={meta.accent}
                  />
                );
              })}
            </VStack>
          </HStack>

          <Mentor hunterClass={profile.hunterClass} />

          <Recommendation rec={profile.recommendation} />

          {/* Chess.com sync */}
          <Box
            p={4}
            borderWidth="1px"
            borderColor="rgba(0,240,255,0.25)"
            bg="rgba(10,11,14,0.55)"
            backdropFilter="blur(8px)"
            className="sys-clip-panel-sm"
          >
            <SystemLabel accent="cyan">Data Bridge — Chess.com</SystemLabel>
            <Text fontSize="sm" color="textSecondary" mt={2}>
              Sync your last 50 games to recompute your class. We never store your password —
              this uses Chess.com&apos;s public API.
            </Text>
            <HStack mt={3} gap={2} flexWrap="wrap">
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Chess.com username"
                size="md"
                color="textPrimary"
                bg="rgba(0,0,0,0.4)"
                borderColor="rgba(0,240,255,0.35)"
                fontFamily="var(--font-oswald), var(--font-inter), sans-serif"
                _placeholder={{ color: "textMuted" }}
                maxW="260px"
              />
              <SystemButton accent="cyan" size="md" onClick={() => runSync(handle)}>
                {loading ? "Syncing…" : synced ? "Re-Sync" : "Sync"}
              </SystemButton>
              {profile.sample.games > 0 && (
                <Text fontSize="xs" color="textMuted" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
                  Last sync · {profile.sample.games} games · median rating {profile.sample.medianRating}
                </Text>
              )}
            </HStack>
            {error && (
              <Text mt={2} fontSize="xs" color="sysThreat">
                {error}
              </Text>
            )}
          </Box>
        </VStack>
      </SystemPanel>
    </Box>
  );

  if (!onClose) return inner;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          background: "rgba(2, 4, 10, 0.82)",
          backdropFilter: "blur(6px)",
          padding: "24px 12px",
          overflowY: "auto",
        }}
        onClick={onClose}
      >
        <Box
          maxW="980px"
          mx="auto"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "system-modal-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
        >
          {inner}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────── Subcomponents ─────────── */

function Header({
  username,
  tier,
  hunterClass,
  onClose,
}: {
  username: string;
  tier: R2MTier;
  hunterClass: HunterClassDef;
  onClose?: () => void;
}) {
  return (
    <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
      <HStack align="center" gap={4}>
        {/* Rank diamond */}
        <Box position="relative" w="68px" h="68px" flexShrink={0}>
          <Box
            className="sys-clip-hex"
            position="absolute"
            inset={0}
            bg={tier.color}
            filter={`drop-shadow(0 0 14px ${tier.color}aa)`}
          />
          <Box position="absolute" inset="2px" className="sys-clip-hex" bg="var(--sys-void)" />
          <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center">
            <Text
              fontFamily="var(--font-playfair), Georgia, serif"
              fontSize="2xl"
              fontWeight="800"
              color={tier.color}
              textShadow={`0 0 10px ${tier.color}`}
            >
              {tier.rank}
            </Text>
          </Box>
        </Box>
        <Box>
          <SystemLabel accent="cyan">[ Hunter Licence ]</SystemLabel>
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize={{ base: "2xl", md: "3xl" }}
            color="textPrimary"
            fontWeight="700"
            lineHeight="1"
            mt={1}
          >
            {username}
          </Text>
          <HStack mt={1.5} gap={3}>
            <Text fontSize="xs" color="textMuted" letterSpacing="wider" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
              {tier.label} · {tier.rank}-Rank
            </Text>
          </HStack>
        </Box>
      </HStack>

      <ClassBadge hunterClass={hunterClass} />

      {onClose && (
        <Box ml="auto">
          <SystemButton accent="purple" size="md" onClick={onClose}>
            Close
          </SystemButton>
        </Box>
      )}
    </HStack>
  );
}

function ClassBadge({ hunterClass }: { hunterClass: HunterClassDef }) {
  return (
    <Box
      className="sys-clip-panel-sm"
      px={4}
      py={2.5}
      borderWidth="1px"
      borderColor={hunterClass.accent}
      bg="rgba(10,11,14,0.55)"
      style={{ boxShadow: `0 0 14px ${hunterClass.accent}55` }}
    >
      <HStack gap={2.5} align="center">
        <Text fontSize="2xl" color={hunterClass.accent} lineHeight="1" style={{ textShadow: `0 0 8px ${hunterClass.accent}` }}>
          {hunterClass.glyph}
        </Text>
        <Box>
          <Text fontSize="2xs" color="textMuted" letterSpacing="0.2em" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
            Class
          </Text>
          <Text fontWeight="800" color={hunterClass.accent} fontFamily="var(--font-playfair), Georgia, serif" fontSize="lg" lineHeight="1">
            {hunterClass.name}
          </Text>
          <Text fontSize="xs" color="textSecondary" fontStyle="italic" mt={0.5}>
            {hunterClass.tagline}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}

function AttributeRow({
  label,
  flavour,
  value,
  accent,
}: {
  label: string;
  flavour: string;
  value: number;
  accent: string;
}) {
  return (
    <Box>
      <HStack justify="space-between" mb={1}>
        <HStack gap={2}>
          <Text fontFamily="var(--font-oswald), var(--font-inter), sans-serif" fontSize="xs" color="textPrimary" fontWeight="700" letterSpacing="0.16em" textTransform="uppercase">
            {label}
          </Text>
          <Text fontSize="2xs" color="textMuted" letterSpacing="wider" textTransform="uppercase">
            {flavour}
          </Text>
        </HStack>
        <Text fontFamily="var(--font-oswald), var(--font-inter), sans-serif" fontSize="sm" color={accent} fontWeight="800" style={{ filter: `drop-shadow(0 0 4px ${accent})` }}>
          {value}
        </Text>
      </HStack>
      <Box position="relative" h="4px" bg="rgba(255,255,255,0.05)" borderRadius="2px" overflow="hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            background: accent,
            boxShadow: `0 0 6px ${accent}, 0 0 14px ${accent}66`,
          }}
        />
      </Box>
    </Box>
  );
}

function Mentor({ hunterClass }: { hunterClass: HunterClassDef }) {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderColor={hunterClass.accent}
      bg="rgba(10,11,14,0.55)"
      className="sys-clip-panel-sm"
      style={{ boxShadow: `0 0 16px ${hunterClass.accent}33` }}
    >
      <SystemLabel accent="epic">Legendary Mentor</SystemLabel>
      <HStack mt={2} gap={3} align="flex-start" flexWrap="wrap">
        <Box>
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontWeight="700" fontSize="lg" color="textPrimary">
            {hunterClass.mentor.name}
          </Text>
          <Text fontSize="xs" color="textMuted" letterSpacing="wider" textTransform="uppercase" fontFamily="var(--font-oswald), var(--font-inter), sans-serif">
            {hunterClass.mentor.era}
          </Text>
        </Box>
        <Text flex={1} fontSize="sm" color="textSecondary" fontStyle="italic" minW={{ base: "full", sm: "240px" }}>
          &ldquo;{hunterClass.mentor.quote}&rdquo;
        </Text>
      </HStack>
    </Box>
  );
}

function Recommendation({
  rec,
}: {
  rec: { attribute: keyof typeof ATTR_META; title: string; href: string };
}) {
  const meta = ATTR_META[rec.attribute];
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderColor="rgba(240,101,149,0.45)"
      bg="rgba(40,8,16,0.55)"
      className="sys-clip-panel-sm"
      style={{ boxShadow: "0 0 18px rgba(240,101,149,0.25)" }}
    >
      <HStack justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
        <Box>
          <SystemLabel accent="threat">System Directive</SystemLabel>
          <Text mt={1.5} fontWeight="700" color="textPrimary" fontFamily="var(--font-playfair), Georgia, serif" fontSize="lg">
            Weakest stat — {meta.label}
          </Text>
          <Text fontSize="sm" color="textSecondary" mt={0.5}>
            {meta.chess}. The System prescribes the <b>{rec.title}</b>.
          </Text>
        </Box>
        <SystemButton accent="threat" size="md" href={rec.href}>
          Enter Dungeon
        </SystemButton>
      </HStack>
    </Box>
  );
}
