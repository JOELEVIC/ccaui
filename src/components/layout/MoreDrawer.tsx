"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, VStack, Text, Button, HStack } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { APP_NAME } from "@/lib/appName";

const MORE_LINKS: { href: string; label: string }[] = [
  { href: "/puzzles", label: "Puzzles" },
  { href: "/learn", label: "Learn" },
  { href: "/analysis", label: "Analysis" },
  { href: "/dashboard/tournaments", label: "Tournaments" },
  { href: "/watch", label: "Watch" },
  { href: "/community", label: "Community" },
  { href: "/players", label: "Players" },
  { href: "/profile", label: "Profile" },
  { href: "/schools", label: "Schools" },
];

export interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreDrawer({ isOpen, onClose }: MoreDrawerProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <Box position="fixed" inset={0} zIndex={40} bg="blackAlpha.700" onClick={onClose} aria-hidden />
      <Box
        position="fixed"
        top={0}
        right={0}
        bottom={0}
        w={{ base: "min(320px, 88vw)", md: "360px" }}
        zIndex={41}
        bg="bgCard"
        borderLeftWidth="1px"
        borderColor="whiteAlpha.200"
        py={6}
        px={4}
        boxShadow="xl"
      >
        <HStack justify="space-between" mb={6}>
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="xl" color="gold" fontWeight="600">
            {APP_NAME}
          </Text>
          <Button size="sm" variant="ghost" color="textSecondary" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </HStack>
        <VStack align="stretch" gap={1}>
          {MORE_LINKS.map((item) => {
            if (item.href === "/schools" && !user) return null;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <Box
                  px={3}
                  py={2.5}
                  borderRadius="soft"
                  bg={active ? "whiteAlpha.08" : "transparent"}
                  color={active ? "gold" : "textSecondary"}
                  borderLeftWidth={active ? "3px" : "0"}
                  borderColor="gold"
                  _hover={{ bg: "whiteAlpha.06", color: "gold" }}
                >
                  {item.label}
                </Box>
              </Link>
            );
          })}
          {isAdmin && (
            <Link href="/admin" onClick={onClose}>
              <Box px={3} py={2.5} borderRadius="soft" color="textSecondary" _hover={{ color: "gold" }}>
                Admin
              </Box>
            </Link>
          )}
        </VStack>
        {user && (
          <Box mt={8} pt={6} borderTopWidth="1px" borderColor="whiteAlpha.100">
            <Text fontSize="sm" color="textMuted" mb={2}>
              Signed in as {user.username}
            </Text>
            <Button size="sm" variant="outline" borderColor="goldDark" color="gold" borderRadius="soft" onClick={() => { logout(); onClose(); }}>
              Sign out
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}
