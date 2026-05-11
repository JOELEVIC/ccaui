"use client";

import Link from "next/link";
import { Box, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { tierForRating } from "@/lib/r2m";

/**
 * MemberBadge — premium "Member Badge" pill for the top-right of the
 * AppHeader. Renders a gold-ringed avatar, the user's display name, and a
 * tier line ("C-Rank · 1480") under it. The whole capsule is a single
 * clickable link to /profile.
 *
 * Used in the AppHeader in place of the simple avatar + username pill.
 */

interface MemberBadgeProps {
  username?: string | null;
  rating?: number | null;
  avatarUrl?: string | null;
  /** When true, drops the tier line and shrinks padding (used on mobile). */
  compact?: boolean;
}

export function MemberBadge({ username, rating, avatarUrl, compact = false }: MemberBadgeProps) {
  const tier = tierForRating(rating ?? 1200);
  const initial = (username?.charAt(0) ?? "?").toUpperCase();
  const showTierLine = !compact && username;

  return (
    <Link href="/profile" style={{ textDecoration: "none" }}>
      <HStack
        gap={2.5}
        pl={2}
        pr={compact ? 2 : 3}
        py={1.5}
        borderRadius="999px"
        bg="var(--lux-glass-surface)"
        borderWidth="1px"
        borderColor="var(--lux-glass-border)"
        transition="all 0.2s ease"
        _hover={{
          borderColor: "rgba(212, 175, 55, 0.5)",
          bg: "var(--lux-glass-surface-strong)",
        }}
        style={{
          backdropFilter: "blur(12px) saturate(120%)",
          WebkitBackdropFilter: "blur(12px) saturate(120%)",
        }}
      >
        <AvatarRing tierColor={tier.color}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              boxSize="32px"
              borderRadius="full"
              objectFit="cover"
            />
          ) : (
            <Box
              w="32px"
              h="32px"
              borderRadius="full"
              bg="rgba(212,175,55,0.18)"
              color="var(--lux-gold-bright)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="700"
              fontSize="sm"
              fontFamily="var(--font-playfair), Georgia, serif"
            >
              {initial}
            </Box>
          )}
        </AvatarRing>

        {showTierLine && (
          <VStack align="flex-start" gap={0} pr={1}>
            <Text
              fontSize="sm"
              color="var(--lux-text-primary)"
              fontWeight="600"
              letterSpacing="0.04em"
              lineHeight="1.1"
              maxW="120px"
              lineClamp={1}
            >
              {username}
            </Text>
            <HStack gap={1.5} align="center">
              <Box
                w="6px"
                h="6px"
                borderRadius="full"
                bg={tier.color}
                style={{ boxShadow: `0 0 6px ${tier.color}` }}
              />
              <Text
                fontSize="2xs"
                color="var(--lux-text-secondary)"
                letterSpacing="0.18em"
                textTransform="uppercase"
                fontFamily="var(--font-inter), sans-serif"
              >
                {tier.rank}-Rank · {rating ?? "—"}
              </Text>
            </HStack>
          </VStack>
        )}
        {compact && username && (
          <Text
            fontSize="sm"
            color="var(--lux-text-primary)"
            fontWeight="600"
            letterSpacing="0.04em"
            display={{ base: "none", sm: "inline" }}
            maxW="90px"
            lineClamp={1}
            pr={1}
          >
            {username}
          </Text>
        )}
      </HStack>
    </Link>
  );
}

function AvatarRing({
  tierColor,
  children,
}: {
  tierColor: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      position="relative"
      w="40px"
      h="40px"
      flexShrink={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Gold rim */}
      <Box
        position="absolute"
        inset={0}
        borderRadius="full"
        style={{
          background: `conic-gradient(from 230deg, var(--lux-gold-bright), var(--lux-gold-soft), ${tierColor}, var(--lux-gold-bright))`,
          filter: "drop-shadow(0 0 6px rgba(212,175,55,0.45))",
        }}
      />
      {/* Inner mask */}
      <Box position="absolute" inset="2px" borderRadius="full" bg="var(--lux-obsidian)" />
      {/* Avatar itself */}
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Box>
  );
}
