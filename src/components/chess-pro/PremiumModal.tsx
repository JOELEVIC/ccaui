"use client";

import { Box, Text, Button, VStack } from "@chakra-ui/react";

export interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumModal({ open, onClose }: PremiumModalProps) {
  if (!open) return null;
  return (
    <Box position="fixed" inset={0} zIndex={100} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box position="absolute" inset={0} bg="blackAlpha.800" onClick={onClose} aria-hidden />
      <Box
        position="relative"
        maxW="sm"
        w="full"
        borderRadius="soft"
        bg="gold"
        color="bgDark"
        p={8}
        boxShadow="xl"
      >
        <VStack gap={4} align="stretch">
          <Text fontFamily="var(--font-playfair), Georgia, serif" fontSize="2xl" fontWeight="600" textAlign="center">
            Chess Pro Premium
          </Text>
          <Text fontSize="sm" textAlign="center" opacity={0.9}>
            Unlock unlimited analysis and become PRO faster.
          </Text>
          <Text fontSize="lg" fontWeight="700" textAlign="center">
            $7.99/month
          </Text>
          <Button
            bg="bgDark"
            color="gold"
            borderRadius="soft"
            size="lg"
            _hover={{ bg: "#1a2238" }}
            onClick={onClose}
          >
            Subscribe
          </Button>
          <Button variant="ghost" size="sm" color="bgDark" onClick={onClose}>
            Not now
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
