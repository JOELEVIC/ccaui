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
  GoldRule,
  LuxuryButton,
  LuxuryDivider,
  LuxuryEyebrow,
  LuxuryHeading,
  LuxuryStat,
} from "@/components/luxury/LuxuryPrimitives";
import { tierForRating } from "@/lib/r2m";

/**
 * Dashboard — Luxury Academic redesign.
 *
 * The "Member Lounge" hierarchy:
 *   1.  Salutation row     — serif greeting + thin gold rule + tier badge
 *   2.  Hero: Road to Master — full-width glass card with gold wash + king
 *   3.  Primary Actions    — three spacious glass tiles (vs others / link / bot)
 *   4.  Local Play         — secondary glass row (offline timer / one device)
 *   5.  Continue Playing   — glass list of in-flight games (if any)
 *   6.  Member Metrics     — two stats inside one wide glass strip
 *
 * Watermark chess pieces sit at the back of sections at 0.04 opacity to
 * add depth without competing with content. All cards use the floating-
 * glass treatment: rgba(255,255,255,0.05) bg, 1px rgba(255,255,255,0.1)
 * border, 14px backdrop-blur, deep drop-shadow.
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
      <Box position="relative" mb={{ base: 8, md: 12 }}>
        <ChessWatermark
          piece="king"
          size={420}
          opacity={0.035}
          position={{ top: "-60px", right: "-40px" }}
        />
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <HStack justify="space-between" align="flex-end" flexWrap="wrap" gap={4} position="relative" zIndex={1}>
            <Box>
              <LuxuryEyebrow>{APP_NAME} · Member Lounge</LuxuryEyebrow>
              <Box mt={2.5}>
                <LuxuryHeading size="2xl">
                  {greeting},{" "}
                  <Text as="span" color="var(--lux-gold)" style={{ fontStyle: "italic" }}>
                    {displayName}
                  </Text>
                  .
                </LuxuryHeading>
              </Box>
              <Box mt={4}>
                <GoldRule wide />
              </Box>
            </Box>

            <HStack gap={3} align="center" pt={1}>
              <Box
                px={4}
                py={2.5}
                borderRadius="999px"
                bg="var(--lux-glass-surface)"
                borderWidth="1px"
                borderColor="rgba(212, 175, 55, 0.4)"
                style={{ backdropFilter: "blur(12px)" }}
              >
                <HStack gap={2.5}>
                  <Box w="8px" h="8px" borderRadius="full" bg={tier.color} style={{ boxShadow: `0 0 8px ${tier.color}` }} />
                  <Text
                    fontFamily="var(--font-inter), sans-serif"
                    fontSize="xs"
                    letterSpacing="0.2em"
                    textTransform="uppercase"
                    color="var(--lux-text-primary)"
                    fontWeight="600"
                  >
                    {tier.rank}-Rank · {user?.rating ?? "—"}
                  </Text>
                </HStack>
              </Box>
              <ProToggle on={proOn} onToggle={(on) => { setProOn(on); if (on) setPremiumOpen(true); }} />
            </HStack>
          </HStack>
        </motion.div>
      </Box>

      {/* Hero: Road to Master */}
      <Box mb={{ base: 8, md: 10 }}>
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard hero href="/road-to-master" goldWash>
            <Box position="relative" px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }} minH={{ md: "200px" }}>
              <ChessWatermark
                piece="queen"
                size={280}
                opacity={0.06}
                position={{ top: "-40px", right: "8px" }}
              />
              <HStack justify="space-between" align="center" flexWrap="wrap" gap={6} position="relative" zIndex={1}>
                <VStack align="flex-start" gap={3} maxW="2xl">
                  <LuxuryEyebrow>Road to Master</LuxuryEyebrow>
                  <LuxuryHeading size="xl">
                    From <Text as="span" color="var(--lux-gold)">apprentice</Text> to{" "}
                    <Text as="span" color="var(--lux-gold)">monarch</Text>.
                  </LuxuryHeading>
                </VStack>
                <Box flexShrink={0}>
                  <LuxuryButton variant="gold" size="lg" glyph="▸" href="/road-to-master">
                    Enter
                  </LuxuryButton>
                </Box>
              </HStack>
            </Box>
          </GlassCard>
        </motion.div>
      </Box>

      {/* Primary Actions */}
      <Section eyebrow="The Arena" title="Sit down to a game">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            <motion.div variants={staggerChild}>
              <ActionTile
                href="/games"
                eyebrow="Matchmaking"
                title="Play with the field"
                description="Rated game, opponent at your level."
                glyph="♚"
                cta="Find Match"
              />
            </motion.div>
            <motion.div variants={staggerChild}>
              <ActionTile
                href="/games"
                eyebrow="Private"
                title="Play a friend"
                description="Share a link, start a challenge."
                glyph="♛"
                cta="Invite"
              />
            </motion.div>
            <motion.div variants={staggerChild}>
              <ActionTile
                href="/play/bot"
                eyebrow="Solo"
                title="Spar the engine"
                description="Stockfish · 230 to 3200 Elo."
                glyph="♞"
                cta="Begin"
              />
            </motion.div>
          </SimpleGrid>
        </motion.div>
      </Section>

      {/* Local play */}
      <Section eyebrow="At the Board" title="Play offline" mt={{ base: 8, md: 10 }}>
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          <LocalPlayTile
            href="/play/local"
            title="Two players · one device"
            description="Pass and play."
            glyph="♟"
          />
          <LocalPlayTile
            href="/play/local"
            title="Chess timer"
            description="OTB clock."
            glyph="⏱"
          />
        </SimpleGrid>
      </Section>

      {/* Continue playing */}
      {liveGames.length > 0 && (
        <Section eyebrow="Resume" title="Continue playing" mt={{ base: 8, md: 10 }}>
          <VStack align="stretch" gap={3}>
            {liveGames.slice(0, 3).map((g) => (
              <GlassCard key={g.id} href={`/game/${g.id}`}>
                <HStack
                  px={5}
                  py={4}
                  justify="space-between"
                  align="center"
                  gap={4}
                  flexWrap="wrap"
                >
                  <HStack gap={4}>
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
                    >
                      <Text fontSize="xl" color="var(--lux-gold)">
                        ◯
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontFamily="var(--font-playfair), Georgia, serif"
                        fontSize="lg"
                        color="var(--lux-text-primary)"
                        fontWeight="600"
                        letterSpacing="0.03em"
                      >
                        {g.white?.username ?? "White"} vs {g.black?.username ?? "Black"}
                      </Text>
                      <Text fontSize="xs" className="lux-text-muted" letterSpacing="0.16em" textTransform="uppercase" mt={0.5}>
                        Active · in progress
                      </Text>
                    </Box>
                  </HStack>
                  <LuxuryButton variant="ghost" size="sm" glyph="▸" href={`/game/${g.id}`}>
                    Resume
                  </LuxuryButton>
                </HStack>
              </GlassCard>
            ))}
          </VStack>
        </Section>
      )}

      {/* Member Metrics */}
      <Section eyebrow="The Academy" title="Tonight" mt={{ base: 8, md: 12 }}>
        <GlassCard>
          <HStack
            px={{ base: 5, md: 8 }}
            py={{ base: 6, md: 7 }}
            gap={{ base: 6, md: 12 }}
            flexWrap="wrap"
            justify="space-between"
            align="flex-start"
          >
            <LuxuryStat
              label="Members"
              value={playersTotal.toLocaleString()}
              emphasis="gold"
            />
            <Box display={{ base: "none", md: "block" }} h="60px" w="1px" bg="var(--lux-glass-border)" />
            <LuxuryStat
              label="Playing now"
              value={playingNow.toLocaleString()}
            />
            <Box display={{ base: "none", md: "block" }} h="60px" w="1px" bg="var(--lux-glass-border)" />
            <LuxuryStat
              label="Your rating"
              value={String(user?.rating ?? "—")}
              hint={`${tier.label} · ${tier.rank}-Rank`}
            />
          </HStack>
        </GlassCard>
      </Section>

      <Box my={{ base: 10, md: 14 }}>
        <LuxuryDivider />
      </Box>

      <PremiumModal open={premiumOpen} onClose={() => { setPremiumOpen(false); setProOn(false); }} />
    </Box>
  );
}

/* ─────────── Section header ─────────── */

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
      <Box mb={5}>
        <LuxuryEyebrow>{eyebrow}</LuxuryEyebrow>
        <HStack mt={2} gap={4} align="center">
          <LuxuryHeading size="md">{title}</LuxuryHeading>
          <GoldRule />
        </HStack>
      </Box>
      {children}
    </Box>
  );
}

/* ─────────── ActionTile (primary action card) ─────────── */

function ActionTile({
  href,
  eyebrow,
  title,
  description,
  glyph,
  cta,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  glyph: string;
  cta: string;
}) {
  return (
    <GlassCard href={href}>
      <Box position="relative" p={{ base: 5, md: 6 }} h="full">
        <Box
          position="absolute"
          top={5}
          right={5}
          fontSize="5xl"
          color="rgba(212,175,55,0.18)"
          lineHeight="1"
          pointerEvents="none"
          style={{ transition: "color 0.3s ease, transform 0.3s ease" }}
        >
          {glyph}
        </Box>
        <VStack align="flex-start" gap={3} minH={{ md: "180px" }} justifyContent="space-between">
          <Box>
            <LuxuryEyebrow>{eyebrow}</LuxuryEyebrow>
            <Box mt={2}>
              <LuxuryHeading size="sm">{title}</LuxuryHeading>
            </Box>
            <Text mt={2.5} fontSize="sm" className="lux-text-secondary" lineHeight="1.55">
              {description}
            </Text>
          </Box>
          <HStack mt={4} gap={2.5} align="center">
            <Text
              fontFamily="var(--font-inter), sans-serif"
              fontSize="xs"
              color="var(--lux-gold)"
              fontWeight="600"
              letterSpacing="0.18em"
              textTransform="uppercase"
            >
              {cta}
            </Text>
            <Text color="var(--lux-gold)" fontSize="lg" lineHeight="1">
              →
            </Text>
          </HStack>
        </VStack>
      </Box>
    </GlassCard>
  );
}

/* ─────────── LocalPlayTile (secondary tile, more compact) ─────────── */

function LocalPlayTile({
  href,
  title,
  description,
  glyph,
}: {
  href: string;
  title: string;
  description: string;
  glyph: string;
}) {
  return (
    <GlassCard href={href}>
      <HStack px={5} py={4} gap={4} align="center">
        <Box
          w="44px"
          h="44px"
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
        <Box flex={1} minW={0}>
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize="md"
            color="var(--lux-text-primary)"
            fontWeight="600"
            letterSpacing="0.03em"
          >
            {title}
          </Text>
          <Text fontSize="xs" className="lux-text-muted" mt={0.5}>
            {description}
          </Text>
        </Box>
        <Text color="var(--lux-gold-muted)" fontSize="lg">
          →
        </Text>
      </HStack>
    </GlassCard>
  );
}

/* ─────────── ProToggle (subtle Pro switch) ─────────── */

function ProToggle({ on, onToggle }: { on: boolean; onToggle: (on: boolean) => void }) {
  return (
    <Box
      as="button"
      onClick={() => onToggle(!on)}
      px={3}
      py={2.5}
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
          fontSize="xs"
          letterSpacing="0.2em"
          textTransform="uppercase"
          fontWeight="600"
          color={on ? "var(--lux-gold)" : "var(--lux-text-secondary)"}
        >
          {on ? "Pro · On" : "Pro"}
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
