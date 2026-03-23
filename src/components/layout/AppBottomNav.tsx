"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, HStack, Text, Button } from "@chakra-ui/react";

const ITEMS: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Home" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/dashboard/tournaments", label: "Tours" },
  { href: "/analysis", label: "Analysis" },
];

export interface AppBottomNavProps {
  onMorePress: () => void;
}

export function AppBottomNav({ onMorePress }: AppBottomNavProps) {
  const pathname = usePathname();

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={30}
      display={{ base: "block", md: "none" }}
      bg="bgCard"
      borderTopWidth="1px"
      borderColor="whiteAlpha.100"
      py={2}
      px={1}
      pb="calc(0.5rem + env(safe-area-inset-bottom))"
    >
      <HStack justify="space-around" gap={0}>
        {ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/")) ||
            (item.href === "/dashboard" && (pathname === "/dashboard" || pathname === "/games"));
          return (
            <Link key={item.href} href={item.href} style={{ flex: 1, textAlign: "center" }}>
              <Box
                py={2}
                px={1}
                borderRadius="soft"
                bg={active ? "whiteAlpha.08" : "transparent"}
                color={active ? "gold" : "textMuted"}
                borderTopWidth={active ? "2px" : "0"}
                borderColor="gold"
              >
                <Text fontSize="10px" fontWeight={active ? "700" : "500"}>
                  {item.label}
                </Text>
              </Box>
            </Link>
          );
        })}
        <Button variant="ghost" flex={1} py={2} h="auto" color="textMuted" onClick={onMorePress}>
          <Text fontSize="10px" fontWeight="500">
            More
          </Text>
        </Button>
      </HStack>
    </Box>
  );
}
