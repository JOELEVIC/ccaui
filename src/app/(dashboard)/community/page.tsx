"use client";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function CommunityPage() {
  return (
    <VStack align="stretch" gap={8}>
      <Heading fontFamily="var(--font-playfair), Georgia, serif" size="xl" color="textPrimary">
        Community
      </Heading>
      <Text color="textSecondary" maxW="2xl">
        Forums, clubs, and social features will appear here. For now this is a placeholder matching the global navigation.
      </Text>
      <Box p={8} borderRadius="soft" bg="bgCard" borderWidth="1px" borderColor="whiteAlpha.100">
        <Text color="textMuted">Coming soon: posts, clubs, and friend activity.</Text>
      </Box>
    </VStack>
  );
}
