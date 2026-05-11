"use client";

import { Box, HStack, Image, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@apollo/client/react";
import { PROFILE_FULL } from "@/graphql/queries/chessPro";
import {
  ChessWatermark,
  GlassCard,
  GoldRule,
  LuxuryButton,
  LuxuryEyebrow,
  LuxuryHeading,
} from "@/components/luxury/LuxuryPrimitives";
import { tierForRating } from "@/lib/r2m";

const VARIANT_LABEL: Record<string, string> = {
  ULTRABULLET: "Ultrabullet",
  BULLET: "Bullet",
  BLITZ: "Blitz",
  RAPID: "Rapid",
  CLASSIC: "Classic",
  CRAZYHOUSE: "Crazyhouse",
  CHESS960: "Chess960",
  KOTH: "King of the Hill",
  THREECHECK: "Three-check",
  ANTICHESS: "Antichess",
  ATOMIC: "Atomic",
  HORDE: "Horde",
  RACING_KINGS: "Racing Kings",
};

function flagEmoji(code: string | undefined): string {
  if (!code || code.length !== 2) return "🌐";
  const A = 0x1f1e6;
  const c = code.toUpperCase();
  return String.fromCodePoint(A + c.charCodeAt(0) - 65, A + c.charCodeAt(1) - 65);
}

type ProfileMe = {
  id: string;
  username: string;
  rating: number;
  createdAt: string;
  totalGamesPlayed: number;
  profile: {
    chessTitle?: string | null;
    avatarUrl?: string | null;
    country?: string;
    followerCount?: number;
    friendCount?: number;
  } | null;
  variantRatings: { variant: string; rating: number; ratingDelta: number; gamesPlayed: number }[];
};

export default function ProfilePage() {
  const { data, loading } = useQuery<{ me: ProfileMe }>(PROFILE_FULL);
  const me = data?.me;

  if (loading || !me) {
    return (
      <Box maxW="1180px" mx="auto" py={10}>
        <Text
          className="lux-text-muted"
          letterSpacing="0.18em"
          textTransform="uppercase"
          fontSize="xs"
        >
          {loading ? "Loading…" : "Sign in to view profile."}
        </Text>
      </Box>
    );
  }

  const p = me.profile;
  const tier = tierForRating(me.rating ?? 1200);
  const joined = new Date(me.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  return (
    <Box position="relative" maxW="1180px" mx="auto">
      <ChessWatermark piece="bishop" size={420} opacity={0.035} position={{ top: "-40px", right: "-60px" }} />

      {/* Member dossier header */}
      <Box mb={{ base: 6, md: 9 }} position="relative" zIndex={1}>
        <LuxuryEyebrow>Member Dossier</LuxuryEyebrow>
        <HStack mt={4} gap={{ base: 5, md: 7 }} align="flex-start" flexWrap="wrap">
          <GoldAvatar size={112} tierColor={tier.color} avatarUrl={p?.avatarUrl} initial={me.username.charAt(0).toUpperCase()} />

          <VStack align="flex-start" gap={2} flex={1} minW={0}>
            <HStack gap={2.5} align="baseline" flexWrap="wrap">
              {p?.chessTitle && (
                <Text
                  fontFamily="var(--font-inter), sans-serif"
                  fontSize="xs"
                  fontWeight="700"
                  color="var(--lux-gold)"
                  letterSpacing="0.18em"
                  textTransform="uppercase"
                  px={2}
                  py={0.5}
                  borderWidth="1px"
                  borderColor="var(--lux-gold-muted)"
                  borderRadius="4px"
                  bg="rgba(212,175,55,0.08)"
                >
                  {p.chessTitle}
                </Text>
              )}
              <LuxuryHeading size="xl">{me.username}</LuxuryHeading>
            </HStack>

            <HStack gap={3} mt={1} align="center" flexWrap="wrap">
              <Box
                px={3}
                py={1.5}
                borderRadius="999px"
                bg="var(--lux-glass-surface)"
                borderWidth="1px"
                borderColor="var(--lux-glass-border)"
                style={{ backdropFilter: "blur(12px)" }}
              >
                <HStack gap={2}>
                  <Box w="6px" h="6px" borderRadius="full" bg={tier.color} style={{ boxShadow: `0 0 6px ${tier.color}` }} />
                  <Text
                    fontFamily="var(--font-inter), sans-serif"
                    fontSize="2xs"
                    fontWeight="700"
                    letterSpacing="0.22em"
                    textTransform="uppercase"
                    color="var(--lux-text-primary)"
                  >
                    {tier.rank}-Rank · {me.rating}
                  </Text>
                </HStack>
              </Box>
              <Text fontSize="sm" className="lux-text-secondary">
                {flagEmoji(p?.country)} {p?.country ?? "—"} · since {joined}
              </Text>
            </HStack>

            <Box mt={2}>
              <GoldRule wide />
            </Box>

            <HStack gap={6} mt={1.5}>
              <KV label="Followers" value={String(p?.followerCount ?? 0)} />
              <KV label="Friends" value={String(p?.friendCount ?? 0)} />
              <KV label="Games" value={String(me.totalGamesPlayed)} />
            </HStack>
          </VStack>

          <Box>
            <LuxuryButton variant="outline" size="sm" glyph="✦" href="/road-to-master/status">
              Status
            </LuxuryButton>
          </Box>
        </HStack>
      </Box>

      {/* Variant ratings */}
      {(me.variantRatings?.length ?? 0) > 0 && (
        <Box mb={{ base: 6, md: 9 }} position="relative" zIndex={1}>
          <HStack mb={4} align="center" gap={3}>
            <LuxuryEyebrow>Variant Cabinet</LuxuryEyebrow>
            <Box flex={1} className="lux-divider" />
          </HStack>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={3}>
            {me.variantRatings.map((vr) => (
              <GlassCard key={vr.variant}>
                <Box px={5} py={4}>
                  <Text
                    fontSize="2xs"
                    color="var(--lux-text-muted)"
                    letterSpacing="0.22em"
                    textTransform="uppercase"
                    fontFamily="var(--font-inter), sans-serif"
                  >
                    {VARIANT_LABEL[vr.variant] ?? vr.variant}
                  </Text>
                  <HStack justify="space-between" align="flex-end" mt={1.5}>
                    <Text
                      fontFamily="var(--font-playfair), Georgia, serif"
                      fontSize="3xl"
                      fontWeight="600"
                      color="var(--lux-gold)"
                      lineHeight="1"
                      letterSpacing="0.02em"
                    >
                      {vr.rating}
                    </Text>
                    <Text
                      fontFamily="var(--font-inter), sans-serif"
                      fontSize="xs"
                      fontWeight="600"
                      color={
                        vr.ratingDelta > 0
                          ? "rgba(163,230,53,0.85)"
                          : vr.ratingDelta < 0
                            ? "rgba(240,101,149,0.85)"
                            : "var(--lux-text-muted)"
                      }
                      letterSpacing="0.04em"
                    >
                      {vr.ratingDelta > 0 ? "▲" : vr.ratingDelta < 0 ? "▼" : "—"}{" "}
                      {Math.abs(vr.ratingDelta)}
                    </Text>
                  </HStack>
                  <Text
                    fontSize="2xs"
                    className="lux-text-muted"
                    letterSpacing="0.16em"
                    textTransform="uppercase"
                    mt={1.5}
                  >
                    {vr.gamesPlayed} games
                  </Text>
                </Box>
              </GlassCard>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Archive entry */}
      <Box position="relative" zIndex={1}>
        <HStack mb={4} align="center" gap={3}>
          <LuxuryEyebrow>Archive</LuxuryEyebrow>
          <Box flex={1} className="lux-divider" />
        </HStack>
        <GlassCard href="/games">
          <HStack px={5} py={4} justify="space-between" align="center" gap={4} flexWrap="wrap">
            <Box>
              <Text
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize="lg"
                color="var(--lux-text-primary)"
                fontWeight="600"
                letterSpacing="0.04em"
              >
                Game history
              </Text>
              <Text fontSize="xs" className="lux-text-muted" letterSpacing="0.16em" textTransform="uppercase" mt={0.5}>
                {me.totalGamesPlayed} games
              </Text>
            </Box>
            <Text color="var(--lux-gold)" fontSize="lg">
              →
            </Text>
          </HStack>
        </GlassCard>
      </Box>
    </Box>
  );
}

function GoldAvatar({
  size,
  tierColor,
  avatarUrl,
  initial,
}: {
  size: number;
  tierColor: string;
  avatarUrl?: string | null;
  initial: string;
}) {
  return (
    <Box position="relative" w={`${size}px`} h={`${size}px`} flexShrink={0}>
      <Box
        position="absolute"
        inset={0}
        borderRadius="full"
        style={{
          background: `conic-gradient(from 230deg, var(--lux-gold-bright), var(--lux-gold-soft), ${tierColor}, var(--lux-gold-bright))`,
          filter: "drop-shadow(0 0 12px rgba(212,175,55,0.45))",
        }}
      />
      <Box position="absolute" inset="3px" borderRadius="full" bg="var(--lux-obsidian)" />
      <Box
        position="absolute"
        inset="3px"
        borderRadius="full"
        overflow="hidden"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" boxSize={`${size - 6}px`} borderRadius="full" objectFit="cover" />
        ) : (
          <Text
            fontFamily="var(--font-playfair), Georgia, serif"
            fontSize="4xl"
            fontWeight="600"
            color="var(--lux-gold-bright)"
            letterSpacing="0.04em"
          >
            {initial}
          </Text>
        )}
      </Box>
    </Box>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text
        fontSize="2xs"
        color="var(--lux-text-muted)"
        letterSpacing="0.22em"
        textTransform="uppercase"
        fontFamily="var(--font-inter), sans-serif"
      >
        {label}
      </Text>
      <Text
        fontFamily="var(--font-playfair), Georgia, serif"
        fontSize="lg"
        color="var(--lux-text-primary)"
        fontWeight="600"
        lineHeight="1.1"
        mt={0.5}
        letterSpacing="0.02em"
      >
        {value}
      </Text>
    </Box>
  );
}
