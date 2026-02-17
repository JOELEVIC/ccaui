"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";

export function TopBar() {
  const { user } = useAuth();
  if (!user) return null;

  const initial = user.username?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <Box
      w="full"
      py={3}
      px={6}
      borderBottomWidth="1px"
      borderColor="goldDark"
      bg="bgDark"
    >
      <HStack justify="flex-end" gap={4}>
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg="goldDark"
          aria-label="Notifications"
          title="Notifications"
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
    </Box>
  );
}
