"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, HStack, Text, Button } from "@chakra-ui/react";

const BOTTOM_NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/games", label: "Play" },
  { href: "/dashboard/rankings", label: "Rankings" },
  { href: "/learning", label: "Training" },
];

export interface BottomNavProps {
  onMorePress: () => void;
}

export function BottomNav({ onMorePress }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={15}
      display={{ base: "block", md: "none" }}
      bg="bgCard"
      borderTopWidth="1px"
      borderColor="goldDark"
      py={2}
      px={2}
    >
      <HStack justify="space-around" gap={1}>
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <Box
                px={3}
                py={2}
                borderRadius="cca"
                bg={isActive ? "whiteAlpha.08" : "transparent"}
                color={isActive ? "gold" : "textSecondary"}
                _active={{ bg: "whiteAlpha.05" }}
                borderBottomWidth={isActive ? "2px" : "0"}
                borderColor="gold"
              >
                <Text fontSize="xs" fontWeight={isActive ? "600" : "500"}>
                  {item.label}
                </Text>
              </Box>
            </Link>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          px={3}
          py={2}
          borderRadius="cca"
          color="textSecondary"
          _active={{ bg: "whiteAlpha.05" }}
          onClick={onMorePress}
        >
          <Text fontSize="xs" fontWeight="500">
            More
          </Text>
        </Button>
      </HStack>
    </Box>
  );
}
