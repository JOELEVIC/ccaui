"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, Dialog, Text, VStack, HStack } from "@chakra-ui/react";
import { usePlacementStatus } from "@/lib/usePlacement";
import { LuxuryButton, LuxuryEyebrow, GoldRule } from "@/components/luxury/LuxuryPrimitives";
import { PLACEMENT_GAMES } from "@/lib/placement/ladder";

/**
 * Recurring placement prompt. While the player still needs placement, this modal
 * appears on dashboard load. "Later" closes it for the current view but it returns
 * on the next visit — it keeps coming up until placement is done at least once.
 */
export function PlacementGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { required, loading } = usePlacementStatus();
  const [dismissed, setDismissed] = useState(false);

  // Don't nag while they're actually doing the placement.
  const onPlacement = pathname?.startsWith("/placement");
  const open = !loading && required && !dismissed && !onPlacement;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && setDismissed(true)}>
      <Dialog.Backdrop style={{ background: "rgba(8,10,14,0.7)", backdropFilter: "blur(6px)" }} />
      <Dialog.Positioner>
        <Dialog.Content bg="transparent" border="none" boxShadow="none" maxW="460px" w="full" mx={4}>
          <Box
            p={{ base: 6, md: 8 }}
            borderRadius="14px"
            bg="var(--lux-obsidian-elev)"
            borderWidth="1px"
            borderColor="rgba(212,175,55,0.4)"
            style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212,175,55,0.16)" }}
          >
            <VStack gap={4} textAlign="center">
              <LuxuryEyebrow>One quick step</LuxuryEyebrow>
              <Text
                fontFamily="var(--font-playfair), Georgia, serif"
                fontSize={{ base: "3xl", md: "4xl" }}
                color="var(--lux-gold)"
                fontWeight="600"
                lineHeight="1.1"
                style={{ fontStyle: "italic" }}
              >
                Get your rating
              </Text>
              <Box display="flex" justifyContent="center">
                <GoldRule wide />
              </Box>
              <Text color="var(--lux-text-secondary)" fontSize="sm" lineHeight="1.6">
                You&apos;re starting at a placeholder rating. Play {PLACEMENT_GAMES} short games
                against our bots and we&apos;ll estimate your true Elo — it takes just a few minutes.
              </Text>
              <HStack gap={3} mt={2}>
                <LuxuryButton variant="gold" size="md" onClick={() => router.push("/placement")}>
                  Start now
                </LuxuryButton>
                <LuxuryButton variant="ghost" size="md" onClick={() => setDismissed(true)}>
                  Later
                </LuxuryButton>
              </HStack>
            </VStack>
          </Box>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
