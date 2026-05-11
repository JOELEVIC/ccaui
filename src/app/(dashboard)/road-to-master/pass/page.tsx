"use client";

import { Box } from "@chakra-ui/react";
import { HuntersPass, stubHuntersPassCheckout } from "@/components/system/HuntersPass";
import { useAuth } from "@/lib/auth";
import { tierForRating, xpProgress } from "@/lib/r2m";

export default function PassPage() {
  const { user } = useAuth();
  const username = user?.username ?? "Hunter";
  const rating = user?.rating ?? 1200;
  const xp = user?.profile?.xp ?? 0;
  const tier = tierForRating(rating);
  const level = xpProgress(xp).level;
  return (
    <Box bg="sys.void" minH="100vh" py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
      <Box maxW="980px" mx="auto">
        <HuntersPass
          username={username}
          rank={tier.rank}
          level={level}
          onCheckout={stubHuntersPassCheckout}
        />
      </Box>
    </Box>
  );
}
