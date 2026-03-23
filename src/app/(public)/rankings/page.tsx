"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Text } from "@chakra-ui/react";

/** Legacy URL: full leaderboard lives in the app under /players (requires sign-in). */
export default function RankingsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/players");
  }, [router]);
  return (
    <Box py={8} textAlign="center">
      <Text color="textMuted">Redirecting to Players…</Text>
    </Box>
  );
}
