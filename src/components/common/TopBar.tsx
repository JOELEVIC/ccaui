"use client";

import { Box, HStack, Text, Button } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { StreakCounter } from "@/components/dashboard";

export interface TopBarProps {
  onMenuPress?: () => void;
}

export function TopBar({ onMenuPress }: TopBarProps) {
  const { user } = useAuth();
  if (!user) return null;

  const initial = user.username?.charAt(0)?.toUpperCase() ?? "?";
  const streak = user.profile?.puzzleStreakCount ?? 0;

  return (
    <Box
      w="full"
      py={3}
      px={{ base: 3, md: 6 }}
      borderBottomWidth="1px"
      borderColor="goldDark"
      bg="bgDark"
    >
      <HStack justify="space-between" gap={2} flexWrap="wrap">
        {/* Mobile menu button */}
        <Button
          size="sm"
          variant="ghost"
          color="gold"
          onClick={onMenuPress}
          aria-label="Open menu"
          display={{ base: "flex", md: "none" }}
          minW="40px"
        >
          ☰
        </Button>
        <HStack justify="flex-end" gap={{ base: 2, md: 4 }} flex={1}>
          <StreakCounter count={streak} size="sm" />
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="goldDark"
            aria-label="Notifications"
            title="Notifications"
            display={{ base: "none", sm: "block" }}
          />
          <Text color="gold" fontWeight="600" fontSize="sm">
            {user.rating}
          </Text>
          <Box
            w="32px"
            h="32px"
            borderRadius="full"
            bg="goldDark"
            color="gold"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="bold"
            fontSize="sm"
          >
            {initial}
          </Box>
        </HStack>
      </HStack>
    </Box>
  );
}
