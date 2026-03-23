"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, HStack, Text, Button, Image } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { APP_NAME } from "@/lib/appName";

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
  const initial = user?.username?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <Box
      as="header"
      w="full"
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
      bg="bgDark"
      px={{ base: 3, md: 6 }}
      py={3}
    >
      <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
        <HStack gap={{ base: 2, md: 8 }} flexShrink={0}>
          <Link href="/dashboard">
            <Text
              fontFamily="var(--font-playfair), Georgia, serif"
              fontSize={{ base: "lg", md: "xl" }}
              color="gold"
              fontWeight="600"
              letterSpacing="tight"
            >
              {APP_NAME}
            </Text>
          </Link>
          <HStack gap={1} display={{ base: "none", md: "flex" }}>
            {CENTER_NAV.map((n) => {
              const active =
                n.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname === "/games" || pathname.startsWith("/game/")
                  : pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link key={n.href} href={n.href}>
                  <Box
                    px={3}
                    py={1.5}
                    borderRadius="soft"
                    color={active ? "gold" : "textSecondary"}
                    bg={active ? "whiteAlpha.06" : "transparent"}
                    fontSize="sm"
                    fontWeight={active ? "600" : "500"}
                    _hover={{ color: "gold" }}
                  >
                    {n.label}
                  </Box>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              color="textSecondary"
              _hover={{ color: "gold" }}
              onClick={onOpenMore}
              display={{ base: "none", md: "inline-flex" }}
            >
              More ▾
            </Button>
          </HStack>
        </HStack>

        <HStack gap={{ base: 1, md: 3 }} flexShrink={0}>
          <Button
            variant="ghost"
            size="sm"
            color="textSecondary"
            aria-label="Search"
            onClick={onOpenSearch}
            display={{ base: "none", sm: "inline-flex" }}
          >
            ⌕
          </Button>
          <Box display={{ base: "none", sm: "block" }} color="textMuted" aria-hidden>
            🔔
          </Box>
          <Box display={{ base: "none", sm: "block" }} color="textMuted" aria-hidden>
            ✉
          </Box>
          <Link href="/profile">
            <HStack gap={2} px={2} py={1} borderRadius="soft" _hover={{ bg: "whiteAlpha.06" }}>
              {user?.profile?.avatarUrl ? (
                <Image
                  src={user.profile.avatarUrl}
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
                  bg="goldDark"
                  color="bgDark"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  {initial}
                </Box>
              )}
              <Text display={{ base: "none", md: "block" }} fontSize="sm" color="textPrimary" maxW="120px" lineClamp={1}>
                {user?.username ?? "Guest"}
              </Text>
              <Text display={{ base: "none", md: "block" }} color="textMuted" fontSize="xs">
                ▾
              </Text>
            </HStack>
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}
