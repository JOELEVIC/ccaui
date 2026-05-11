"use client";

import { useState } from "react";
import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "@/lib/auth";
import { PremiumModal } from "@/components/chess-pro/PremiumModal";
import { PLATFORM_METRICS } from "@/graphql/queries/chessPro";
import { APP_NAME } from "@/lib/appName";
import { fadeInUp, staggerContainer, staggerChild } from "@/lib/animations";
import {
  ChessWatermark,
  GlassCard,
  LuxuryButton,
  LuxuryEyebrow,
  LuxuryHeading,
  LuxuryStat,
} from "@/components/luxury/LuxuryPrimitives";
import { tierForRating } from "@/lib/r2m";

/**
 * Dashboard — Play-first, near-zero prose.
 *
 * Hierarchy:
 *   1. Salutation (1 line + R2M tier pill)
 *   2. THE ARENA — three large play tiles (glyph + label + meta only)
 *   3. AT THE BOARD — two compact local-play tiles
 *   4. Continue playing (if any)
 *   5. THE PATH — single demoted Road-to-Master row
 *   6. TONIGHT — three-stat ribbon
 *
 * Rule: card body text is a single meta line at most, never a paragraph.
 * The eyebrow + title carries the meaning. Reading should be incidental.
 */

const LIVE_GAMES = gql`
  query LiveGamesHome {
    liveGames {
      id
      white { username }
      black { username }
    }
  }
`;

export default function DashboardPage() {
  const { user } = useAuth();
  const [proOn, setProOn] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const { data: metricsData } = useQuery<{ platformMetrics: { playersTotal: number; playingNow: number } }>(
    PLATFORM_METRICS
  );
  const { data: gamesData } = useQuery<{ liveGames: { id: string; white: { username: string }; black: { username: string } }[] }>(LIVE_GAMES);

  const playersTotal = metricsData?.platformMetrics.playersTotal ?? 0;
  const playingNow = metricsData?.platformMetrics.playingNow ?? 0;
  const liveGames = gamesData?.liveGames ?? [];
  const tier = tierForRating(user?.rating ?? 1200);
  const greeting = greetByHour();
  const displayName = user?.username ?? "Member";

  return (
    <Box position="relative" maxW="1280px" mx="auto">
      {/* Salutation */}
      <Box position="relative" mb={{ base: 6, md: 9 }}>
        <ChessWatermark
          piece="king"
          size={420}
          opacity={0.035}
          position={{ top: "-60px", right: "-40px" }}
        />
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <HStack justify="space-between" align="flex-end" flexWrap="wrap" gap={4} position="relative" zIndex={1}>
            <Box>
              <LuxuryEyebrow>{APP_NAME}</LuxuryEyebrow>
              <Box mt={2}>
                <LuxuryHeading size="2xl">
                  {greeting},{" "}
                  <Text as="span" color="var(--lux-gold)" style={{ fontStyle: "italic" }}>
                    {displayName}
                  </Text>
                  .
                </LuxuryHeading>
              </Box>
            </Box>

            <HStack gap={3} align="center">
              <TierPill rank={tier.rank} rating={user?.rating ?? null} color={tier.color} />
              <ProToggle on={proOn} onToggle={(on) => { setProOn(on); if (on) setPremiumOpen(true); }} />
            </HStack>
          </HStack>
        </motion.div>
      </Box>

      {/* THE ARENA — primary play actions */}
      <Section eyebrow="The Arena" title="Play">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            <motion.div variants={staggerChild}>
              <PlayTile href="/games" eyebrow="Matchmaking" title="Play the field" glyph="♚" />
            </motion.div>
            <motion.div variants={staggerChild}>
              <PlayTile href="/games" eyebrow="Private" title="Friend" glyph="♛" />
            </motion.div>
            <motion.div variants={staggerChild}>
              <PlayTile href="/play/bot" eyebrow="Solo" title="Engine" glyph="♞" />
            </motion.div>
          </SimpleGrid>
        </motion.div>
      </Section>

      {/* AT THE BOARD */}
      <Section eyebrow="At the Board" title="Offline" mt={{ base: 7, md: 9 }}>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          <LocalTile href="/play/local" glyph="♟" title="Two players, one device" />
          <LocalTile href="/play/local" glyph="⏱" title="Chess timer" />
        </SimpleGrid>
      </Section>

      {/* Continue playing — only if any */}
      {liveGames.length > 0 && (
        <Section eyebrow="Resume" title="Continue" mt={{ base: 7, md: 9 }}>
          <VStack align="stretch" gap={3}>
            {liveGames.slice(0, 3).map((g) => (
              <GlassCard key={g.id} href={`/game/${g.id}`}>
                <HStack px={5} py={3.5} justify="space-between" align="center" gap={4}>
                  <HStack gap={3} align="center">
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg="var(--lux-gold)"
                      style={{ boxShadow: "0 0 6px var(--lux-gold)" }}
                    />
                    <Text
                      fontFamily="var(--font-playfair), Georgia, serif"
                      fontSize="md"
                      color="var(--lux-text-primary)"
                      fontWeight="600"
                      letterSpacing="0.03em"
                    >
                      {g.white?.username ?? "—"} vs {g.black?.username ?? "—"}
                    </Text>
                  </HStack>
                  <Text color="var(--lux-gold-muted)" fontSize="md">→</Text>
                </HStack>
              </GlassCard>
            ))}
          </VStack>
        </Section>
      )}

      {/* THE PATH — demoted */}
      <Section eyebrow="The Path" title="Road to Master" mt={{ base: 7, md: 9 }}>
        <GlassCard href="/road-to-master" goldWash>
          <HStack px={{ base: 5, md: 6 }} py={{ base: 4, md: 5 }} justify="space-between" align="center" gap={4}>
            <HStack gap={4} align="center">
              <Box
                w="44px"
                h="44px"
                borderRadius="6px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="rgba(212,175,55,0.1)"
                borderWidth="1px"
                borderColor="var(--lux-gold-muted)"
                color="var(--lux-gold)"
                fontSize="xl"
                flexShrink={0}
              >
                ✦
              </Box>
              <Box>
                <Text
                  fontFamily="var(--font-playfair), Georgia, serif"
                  fontSize="lg"
                  color="var(--lux-text-primary)"
                  fontWeight="600"
                  letterSpacing="0.03em"
                >
                  Hunter status · quests · dungeon
                </Text>
              </Box>
            </HStack>
            <LuxuryButton variant="outline" size="sm" glyph="▸">
              Enter
            </LuxuryButton>
          </HStack>
        </GlassCard>
      </Section>

      {/* TONIGHT — stats ribbon */}
      <Section eyebrow="The Academy" title="Tonight" mt={{ base: 7, md: 10 }}>
        <GlassCard>
          <HStack
            px={{ base: 5, md: 8 }}
            py={{ base: 5, md: 6 }}
            gap={{ base: 6, md: 12 }}
            flexWrap="wrap"
            justify="space-between"
            align="flex-start"
          >
            <LuxuryStat label="Members" value={playersTotal.toLocaleString()} emphasis="gold" />
            <Box display={{ base: "none", md: "block" }} h="60px" w="1px" bg="var(--lux-glass-border)" />
            <LuxuryStat label="Playing now" value={playingNow.toLocaleString()} />
            <Box display={{ base: "none", md: "block" }} h="60px" w="1px" bg="var(--lux-glass-border)" />
            <LuxuryStat label="Your rating" value={String(user?.rating ?? "—")} />
          </HStack>
        </GlassCard>
      </Section>

      <Box my={{ base: 10, md: 14 }} className="lux-divider" />

      <PremiumModal open={premiumOpen} onClose={() => { setPremiumOpen(false); setProOn(false); }} />
    </Box>
  );
}

/* ─────────── Section header (eyebrow + title + gold rule) ─────────── */

function Section({
  eyebrow,
  title,
  mt,
  children,
}: {
  eyebrow: string;
  title: string;
  mt?: { base: number; md?: number };
  children: React.ReactNode;
}) {
  return (
    <Box position="relative" mt={mt}>
      <HStack mb={4} align="center" gap={3}>
        <Box>
          <LuxuryEyebrow>{eyebrow}</LuxuryEyebrow>
          <LuxuryHeading size="sm">{title}</LuxuryHeading>
        </Box>
        <Box flex={1} className="lux-divider" />
      </HStack>
      {children}
    </Box>
  );
}

/* ─────────── PlayTile (primary action, glyph-first, no description) ─────────── */

function PlayTile({
  href,
  eyebrow,
  title,
  glyph,
}: {
  href: string;
  eyebrow: string;
  title: string;
  glyph: string;
}) {
  return (
    <GlassCard href={href}>
      <Box position="relative" p={{ base: 5, md: 6 }} h="full" minH={{ md: "172px" }}>
        {/* Big background glyph */}
        <Box
          position="absolute"
          bottom={-2}
          right={-1}
          fontSize="9xl"
          lineHeight="1"
          color="rgba(212,175,55,0.10)"
          pointerEvents="none"
          fontFamily="serif"
          style={{ filter: "drop-shadow(0 0 18px rgba(212,175,55,0.08))" }}
        >
          {glyph}
        </Box>
        <VStack align="flex-start" gap={2} h="full" justifyContent="space-between" position="relative" zIndex={1}>
          <Box>
            <LuxuryEyebrow>{eyebrow}</LuxuryEyebrow>
            <Box mt={2}>
              <LuxuryHeading size="md">{title}</LuxuryHeading>
            </Box>
          </Box>
          <HStack gap={2} align="center" mt={6}>
            <Text
              fontFamily="var(--font-inter), sans-serif"
              fontSize="2xs"
              color="var(--lux-gold)"
              fontWeight="700"
              letterSpacing="0.22em"
              textTransform="uppercase"
            >
              Enter
            </Text>
            <Text color="var(--lux-gold)" fontSize="md" lineHeight="1">→</Text>
          </HStack>
        </VStack>
      </Box>
    </GlassCard>
  );
}

/* ─────────── LocalTile (compact secondary) ─────────── */

function LocalTile({ href, title, glyph }: { href: string; title: string; glyph: string }) {
  return (
    <GlassCard href={href}>
      <HStack px={5} py={4} gap={4} align="center">
        <Box
          w="40px"
          h="40px"
          borderRadius="6px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="var(--lux-glass-surface-strong)"
          borderWidth="1px"
          borderColor="var(--lux-glass-border)"
          color="var(--lux-gold)"
          fontSize="xl"
          flexShrink={0}
        >
          {glyph}
        </Box>
        <Text
          flex={1}
          fontFamily="var(--font-playfair), Georgia, serif"
          fontSize="md"
          color="var(--lux-text-primary)"
          fontWeight="600"
          letterSpacing="0.03em"
        >
          {title}
        </Text>
        <Text color="var(--lux-gold-muted)" fontSize="lg">→</Text>
      </HStack>
    </GlassCard>
  );
}

/* ─────────── TierPill ─────────── */

function TierPill({ rank, rating, color }: { rank: string; rating: number | null; color: string }) {
  return (
    <Box
      px={3}
      py={2}
      borderRadius="999px"
      bg="var(--lux-glass-surface)"
      borderWidth="1px"
      borderColor="rgba(212, 175, 55, 0.4)"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <HStack gap={2}>
        <Box w="6px" h="6px" borderRadius="full" bg={color} style={{ boxShadow: `0 0 6px ${color}` }} />
        <Text
          fontFamily="var(--font-inter), sans-serif"
          fontSize="2xs"
          letterSpacing="0.22em"
          textTransform="uppercase"
          color="var(--lux-text-primary)"
          fontWeight="700"
        >
          {rank}-Rank · {rating ?? "—"}
        </Text>
      </HStack>
    </Box>
  );
}

/* ─────────── ProToggle ─────────── */

function ProToggle({ on, onToggle }: { on: boolean; onToggle: (on: boolean) => void }) {
  return (
    <Box
      as="button"
      onClick={() => onToggle(!on)}
      px={3}
      py={2}
      borderRadius="999px"
      bg="var(--lux-glass-surface)"
      borderWidth="1px"
      borderColor={on ? "rgba(212, 175, 55, 0.55)" : "var(--lux-glass-border)"}
      transition="all 0.2s ease"
      _hover={{ borderColor: "rgba(212, 175, 55, 0.55)" }}
      style={{ backdropFilter: "blur(12px)" }}
    >
      <HStack gap={2}>
        <Box
          w="6px"
          h="6px"
          borderRadius="full"
          bg={on ? "var(--lux-gold)" : "rgba(255,255,255,0.3)"}
          style={on ? { boxShadow: "0 0 8px var(--lux-gold)" } : undefined}
        />
        <Text
          fontSize="2xs"
          letterSpacing="0.22em"
          textTransform="uppercase"
          fontWeight="700"
          color={on ? "var(--lux-gold)" : "var(--lux-text-secondary)"}
        >
          Pro
        </Text>
      </HStack>
    </Box>
  );
}

function greetByHour(): string {
  if (typeof window === "undefined") return "Good evening";
  const h = new Date().getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
