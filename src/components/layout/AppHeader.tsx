"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, HStack, Text, Button, IconButton } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { APP_NAME } from "@/lib/appName";
import { IconSearch, IconBell, IconMail } from "@/components/layout/HeaderIcons";
import { MemberBadge } from "@/components/luxury/MemberBadge";

const CENTER_NAV: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Play" },
  { href: "/learn", label: "Learn" },
  { href: "/watch", label: "Watch" },
  { href: "/community", label: "Community" },
];

export interface AppHeaderProps {
  onOpenMore: () => void;
  onOpenSearch?: () => void;
}

export function AppHeader({ onOpenMore, onOpenSearch }: AppHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <Box
      as="header"
      w="full"
      position="relative"
      bg="var(--lux-obsidian)"
      px={{ base: 4, md: 10 }}
      py={{ base: 3.5, md: 4 }}
      style={{
        // Hairline gradient border that fades toward the edges — feels more
        // premium than a flat 1px line across the full width.
        boxShadow:
          "inset 0 -1px 0 rgba(255,255,255,0.05), inset 0 -2px 0 rgba(212,175,55,0.04)",
      }}
    >
      <Flex align="center" justify="space-between" gap={{ base: 3, md: 6 }} flexWrap="wrap">
        <HStack gap={{ base: 4, md: 10 }} flexShrink={0}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <HStack gap={2.5} align="center">
              {/* Tiny gold rule before the wordmark */}
              <Box w="22px" h="1px" bg="var(--lux-gold)" style={{ boxShadow: "0 0 6px var(--lux-gold-muted)" }} />
              <Text
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize={{ base: "lg", md: "xl" }}
                color="var(--lux-text-primary)"
                fontWeight="600"
                letterSpacing="0.04em"
              >
                {APP_NAME}
              </Text>
            </HStack>
          </Link>
          <HStack gap={{ md: 2, lg: 4 }} display={{ base: "none", md: "flex" }}>
            {CENTER_NAV.map((n) => {
              const active =
                n.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname === "/games" || pathname.startsWith("/game/")
                  : pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link key={n.href} href={n.href} style={{ textDecoration: "none" }}>
                  <Box position="relative" px={3} py={2.5}>
                    <Text
                      fontFamily="var(--font-inter), sans-serif"
                      color={active ? "var(--lux-text-primary)" : "var(--lux-text-secondary)"}
                      fontSize="sm"
                      fontWeight={active ? "600" : "500"}
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                      transition="color 0.2s"
                      _hover={{ color: "var(--lux-gold-bright)" }}
                    >
                      {n.label}
                    </Text>
                    {active && (
                      <Box
                        position="absolute"
                        left="50%"
                        bottom="-2px"
                        w="20px"
                        h="1.5px"
                        bg="var(--lux-gold)"
                        style={{ transform: "translateX(-50%)", boxShadow: "0 0 6px var(--lux-gold-muted)" }}
                      />
                    )}
                  </Box>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              color="var(--lux-text-secondary)"
              _hover={{ color: "var(--lux-gold-bright)", bg: "transparent" }}
              onClick={onOpenMore}
              display={{ base: "none", md: "inline-flex" }}
              fontFamily="var(--font-inter), sans-serif"
              fontSize="sm"
              letterSpacing="0.08em"
              textTransform="uppercase"
              px={3}
            >
              More
            </Button>
          </HStack>
        </HStack>

        <HStack gap={1} flexShrink={0} alignItems="center">
          <IconButton
            variant="ghost"
            aria-label="Search"
            onClick={onOpenSearch}
            display={{ base: "none", sm: "inline-flex" }}
            size="sm"
            w="40px"
            h="40px"
            minW="40px"
            color="var(--lux-text-secondary)"
            _hover={{ color: "var(--lux-gold-bright)", bg: "var(--lux-glass-surface)" }}
            borderRadius="999px"
          >
            <IconSearch />
          </IconButton>
          <IconButton
            variant="ghost"
            aria-label="Notifications"
            display={{ base: "none", sm: "inline-flex" }}
            size="sm"
            w="40px"
            h="40px"
            minW="40px"
            color="var(--lux-text-secondary)"
            _hover={{ color: "var(--lux-gold-bright)", bg: "var(--lux-glass-surface)" }}
            borderRadius="999px"
          >
            <IconBell />
          </IconButton>
          <IconButton
            variant="ghost"
            aria-label="Messages"
            display={{ base: "none", sm: "inline-flex" }}
            size="sm"
            w="40px"
            h="40px"
            minW="40px"
            color="var(--lux-text-secondary)"
            _hover={{ color: "var(--lux-gold-bright)", bg: "var(--lux-glass-surface)" }}
            borderRadius="999px"
          >
            <IconMail />
          </IconButton>
          <Box ml={{ base: 1, md: 2 }}>
            <MemberBadge
              username={user?.username}
              rating={user?.rating}
              avatarUrl={user?.profile?.avatarUrl}
            />
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
}
