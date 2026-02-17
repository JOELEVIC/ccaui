"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, VStack, Text, Button } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/games", label: "Play" },
  { href: "/rankings", label: "Rankings" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/learning", label: "Training" },
  { href: "/schools", label: "Academy" },
  { href: "/admin", label: "Admin" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  return (
    <Box
      w="240px"
      minH="100vh"
      bg="bgCard"
      borderRightWidth="1px"
      borderColor="goldDark"
      py={4}
      px={3}
      display="flex"
      flexDirection="column"
    >
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
            <Link key={item.href} href={item.href}>
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
            <Text color="textPrimary" fontSize="sm" lineClamp={1}>
              {user.username}
            </Text>
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
  );
}
