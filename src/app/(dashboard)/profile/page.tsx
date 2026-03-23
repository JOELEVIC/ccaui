"use client";

import { Box, Heading, Text, VStack, SimpleGrid, HStack, Image } from "@chakra-ui/react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { PROFILE_FULL } from "@/graphql/queries/chessPro";

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
    return <Text color="textMuted">{loading ? "Loading…" : "Sign in to view profile."}</Text>;
  }

  const p = me.profile;
  const joined = new Date(me.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  return (
    <VStack align="stretch" gap={8}>
      <HStack align="flex-start" gap={6} flexWrap="wrap">
        {p?.avatarUrl ? (
          <Image src={p.avatarUrl} alt="" boxSize="88px" borderRadius="full" objectFit="cover" />
        ) : (
          <Box
            boxSize="88px"
            borderRadius="full"
            bg="goldDark"
            color="gold"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="2xl"
            fontWeight="bold"
          >
            {me.username.charAt(0).toUpperCase()}
          </Box>
        )}
        <VStack align="start" gap={1}>
          <Heading size="lg" fontFamily="var(--font-playfair), Georgia, serif" color="textPrimary">
            {p?.chessTitle ? `${p.chessTitle} ` : ""}
            {me.username}
          </Heading>
          <Text color="textSecondary" fontSize="sm">
            Member since {joined} · {flagEmoji(p?.country)} {p?.country}
          </Text>
          <HStack gap={6} mt={2}>
            <Text fontSize="sm" color="textMuted">
              Followers <strong style={{ color: "var(--chakra-colors-gold)" }}>{p?.followerCount ?? 0}</strong>
            </Text>
            <Text fontSize="sm" color="textMuted">
              Friends <strong style={{ color: "var(--chakra-colors-gold)" }}>{p?.friendCount ?? 0}</strong>
            </Text>
          </HStack>
        </VStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={3}>
        {(me.variantRatings ?? []).map(
          (vr: { variant: string; rating: number; ratingDelta: number; gamesPlayed: number }) => (
            <Box
              key={vr.variant}
              p={4}
              borderRadius="soft"
              bg="bgCard"
              borderWidth="1px"
              borderColor="whiteAlpha.080"
            >
              <Text fontSize="xs" color="textMuted" textTransform="uppercase">
                {VARIANT_LABEL[vr.variant] ?? vr.variant}
              </Text>
              <Text fontSize="2xl" fontWeight="800" color="gold">
                {vr.rating}
              </Text>
              <Text fontSize="sm" color={vr.ratingDelta >= 0 ? "accentGreen" : "red.300"}>
                {vr.ratingDelta >= 0 ? "↑" : "↓"} {Math.abs(vr.ratingDelta)} · {vr.gamesPlayed} games
              </Text>
            </Box>
          )
        )}
      </SimpleGrid>

      <Link href="/games">
        <Box
          py={4}
          px={5}
          borderRadius="soft"
          bg="bgSurface"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          <Text fontWeight="700" color="textPrimary">
            {me.totalGamesPlayed} games played
          </Text>
          <Text fontSize="sm" color="textMuted">
            View history →
          </Text>
        </Box>
      </Link>
    </VStack>
  );
}
