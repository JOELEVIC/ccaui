"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, VStack, HStack, Text, Button } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/auth";
import { LevelBadge, XPBar } from "@/components/dashboard";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/games", label: "Play" },
  { href: "/rankings", label: "Rankings" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/learning", label: "Training" },
  { href: "/schools", label: "Academy" },
  { href: "/admin", label: "Admin" },
];

const sidebarContent = (
  pathname: string,
  isAdmin: boolean,
  user: User | null,
  logout: () => void,
  onNavClick?: () => void
) => (
  <>
    <Text
      fontSize="lg"
      fontWeight="bold"
      color="gold"
      mb={6}
      fontFamily="var(--font-playfair), Georgia, serif"
    >
      CCA
    </Text>
    <VStack align="stretch" gap={1} flex={1}>
      {NAV_ITEMS.map((item) => {
        if (item.href === "/admin" && !isAdmin) return null;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} onClick={onNavClick}>
            <Box
              px={3}
              py={2}
              borderRadius="cca"
              bg={isActive ? "whiteAlpha.08" : "transparent"}
              color={isActive ? "gold" : "textSecondary"}
              _hover={{ bg: "whiteAlpha.05", color: "gold" }}
              borderBottomWidth={isActive ? "2px" : "0"}
              borderColor="gold"
              transition="all 0.2s"
            >
              {item.label}
            </Box>
          </Link>
        );
      })}
    </VStack>
    <Box pt={8}>
      {user && (
        <VStack align="stretch" gap={2}>
          <HStack gap={2} flexWrap="wrap">
            <LevelBadge level={user.profile?.level ?? 1} size="sm" />
            <Text color="textPrimary" fontSize="sm" lineClamp={1}>
              {user.username}
            </Text>
          </HStack>
          <XPBar xp={user.profile?.xp ?? 0} showLabel={true} size="sm" />
          <Text color="gold" fontSize="xs" fontWeight="600">
            {user.rating} ELO
          </Text>
          <Button
            size="sm"
            variant="outline"
            borderColor="goldDark"
            color="gold"
            borderRadius="cca"
            onClick={logout}
            _hover={{ bg: "whiteAlpha.05" }}
          >
            Sign out
          </Button>
        </VStack>
      )}
    </Box>
  </>
);

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  return (
    <>
      {/* Desktop: inline sidebar */}
      <Box
        w="240px"
        minW="240px"
        minH="100vh"
        bg="bgCard"
        borderRightWidth="1px"
        borderColor="goldDark"
        py={4}
        px={3}
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
      >
        {sidebarContent(pathname, isAdmin ?? false, user ?? null, logout)}
      </Box>

      {/* Mobile: overlay */}
      {isOpen && (
        <Box
          position="fixed"
          inset={0}
          zIndex={20}
          bg="blackAlpha.600"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Mobile: drawer */}
      <Box
        position="fixed"
        top={0}
        left={0}
        bottom={0}
        w="240px"
        maxW="85vw"
        bg="bgCard"
        borderRightWidth="1px"
        borderColor="goldDark"
        py={4}
        px={3}
        zIndex={21}
        display={{ base: "flex", md: "none" }}
        flexDirection="column"
        transform={isOpen ? "translateX(0)" : "translateX(-100%)"}
        transition="transform 0.2s ease-out"
      >
        <HStack justify="space-between" mb={4}>
          <Text fontSize="lg" fontWeight="bold" color="gold" fontFamily="var(--font-playfair), Georgia, serif">
            CCA
          </Text>
          <Button size="sm" variant="ghost" color="gold" onClick={onClose} aria-label="Close menu">
            ✕
          </Button>
        </HStack>
        <VStack align="stretch" gap={1} flex={1}>
          {NAV_ITEMS.map((item) => {
            if (item.href === "/admin" && !isAdmin) return null;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <Box
                  px={3}
                  py={2}
                  borderRadius="cca"
                  bg={isActive ? "whiteAlpha.08" : "transparent"}
                  color={isActive ? "gold" : "textSecondary"}
                  _hover={{ bg: "whiteAlpha.05", color: "gold" }}
                  borderBottomWidth={isActive ? "2px" : "0"}
                  borderColor="gold"
                >
                  {item.label}
                </Box>
              </Link>
            );
          })}
        </VStack>
        <Box pt={8}>
          {user && (
            <VStack align="stretch" gap={2}>
              <HStack gap={2} flexWrap="wrap">
                <LevelBadge level={user.profile?.level ?? 1} size="sm" />
                <Text color="textPrimary" fontSize="sm" lineClamp={1}>
                  {user.username}
                </Text>
              </HStack>
              <XPBar xp={user.profile?.xp ?? 0} showLabel={true} size="sm" />
              <Text color="gold" fontSize="xs" fontWeight="600">
                {user.rating} ELO
              </Text>
              <Button
                size="sm"
                variant="outline"
                borderColor="goldDark"
                color="gold"
                borderRadius="cca"
                onClick={logout}
                _hover={{ bg: "whiteAlpha.05" }}
              >
                Sign out
              </Button>
            </VStack>
          )}
        </Box>
      </Box>
    </>
  );
}
