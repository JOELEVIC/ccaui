"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, HStack, Text } from "@chakra-ui/react";

/**
 * Mobile bottom navigation — Luxury Academic skin.
 *
 * Obsidian background with a hairline gold-tinted top border, generous
 * touch targets, and a thin gold underline on the active item.
 */

const ITEMS: { href: string; label: string; glyph: string }[] = [
  { href: "/dashboard", label: "Play", glyph: "♚" },
  { href: "/learning", label: "Learn", glyph: "✦" },
  { href: "/road-to-master", label: "Path", glyph: "◇" },
  { href: "/profile", label: "Profile", glyph: "○" },
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
      bg="var(--lux-obsidian)"
      py={2}
      px={2}
      pb="calc(0.5rem + env(safe-area-inset-bottom))"
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 2px 0 rgba(212,175,55,0.06)",
        backdropFilter: "blur(14px) saturate(120%)",
      }}
    >
      <HStack justify="space-around" gap={0}>
        {ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/")) ||
            (item.href === "/dashboard" &&
              (pathname === "/dashboard" || pathname === "/games" || pathname.startsWith("/play/")));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
            >
              <NavItem active={active} label={item.label} glyph={item.glyph} />
            </Link>
          );
        })}
        <Box as="button" flex={1} py={1} onClick={onMorePress} bg="transparent">
          <NavItem active={false} label="More" glyph="⋯" />
        </Box>
      </HStack>
    </Box>
  );
}

function NavItem({ active, label, glyph }: { active: boolean; label: string; glyph: string }) {
  return (
    <Box position="relative" py={1.5}>
      <Text
        fontSize="lg"
        lineHeight="1"
        color={active ? "var(--lux-gold)" : "var(--lux-text-muted)"}
        style={active ? { textShadow: "0 0 6px var(--lux-gold-muted)" } : undefined}
      >
        {glyph}
      </Text>
      <Text
        fontSize="10px"
        fontFamily="var(--font-inter), sans-serif"
        fontWeight={active ? "700" : "500"}
        letterSpacing="0.16em"
        textTransform="uppercase"
        mt={1}
        color={active ? "var(--lux-text-primary)" : "var(--lux-text-muted)"}
      >
        {label}
      </Text>
      {active && (
        <Box
          position="absolute"
          left="50%"
          bottom="-4px"
          w="16px"
          h="1.5px"
          bg="var(--lux-gold)"
          style={{ transform: "translateX(-50%)", boxShadow: "0 0 6px var(--lux-gold-muted)" }}
        />
      )}
    </Box>
  );
}
