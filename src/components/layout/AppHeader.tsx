"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, HStack, Text, Button, Image, IconButton } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { APP_NAME } from "@/lib/appName";
import { IconSearch, IconBell, IconMail, IconChevronDown } from "@/components/layout/HeaderIcons";

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

        <HStack gap={0} flexShrink={0} alignItems="center">
          <IconButton
            variant="ghost"
            aria-label="Search"
            onClick={onOpenSearch}
            display={{ base: "none", sm: "inline-flex" }}
            size="sm"
            w="40px"
            h="40px"
            minW="40px"
            color="textSecondary"
            _hover={{ color: "gold", bg: "whiteAlpha.06" }}
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
            color="textSecondary"
            _hover={{ color: "gold", bg: "whiteAlpha.06" }}
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
            color="textSecondary"
            _hover={{ color: "gold", bg: "whiteAlpha.06" }}
          >
            <IconMail />
          </IconButton>
          <Link href="/profile">
            <HStack
              gap={2}
              px={2}
              py={1}
              h="40px"
              borderRadius="soft"
              alignItems="center"
              _hover={{ bg: "whiteAlpha.06" }}
            >
              {user?.profile?.avatarUrl ? (
                <Image
                  src={user.profile.avatarUrl}
                  alt=""
                  boxSize="28px"
                  borderRadius="full"
                  objectFit="cover"
                  flexShrink={0}
                />
              ) : (
                <Box
                  w="28px"
                  h="28px"
                  borderRadius="full"
                  bg="goldDark"
                  color="gold"
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="xs"
                  flexShrink={0}
                >
                  {initial}
                </Box>
              )}
              <Text
                display={{ base: "none", md: "block" }}
                fontSize="sm"
                color="textPrimary"
                maxW="100px"
                lineClamp={1}
                fontWeight="500"
              >
                {user?.username ?? "Guest"}
              </Text>
              <Box display={{ base: "none", md: "flex" }} color="textMuted" alignItems="center">
                <IconChevronDown />
              </Box>
            </HStack>
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}
