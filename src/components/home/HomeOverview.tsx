"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { LandingNav } from "./LandingNav";
import { LandingHeroMinimal } from "./LandingHeroMinimal";
import { LandingRankingsPreview } from "./LandingRankingsPreview";
import { LandingIconFeatures } from "./LandingIconFeatures";
import { LandingEventsPreview } from "./LandingEventsPreview";
import { LandingActivitiesPreview } from "./LandingActivitiesPreview";
import { ChessDivider } from "./ChessDivider";
import { LandingStory } from "./LandingStory";
import { LandingCta } from "./LandingCta";
import { LandingFooter } from "./LandingFooter";
import { LandingRoadToMaster } from "./LandingRoadToMaster";
import { LandingChessToday } from "./LandingChessToday";
import { LandingMemory } from "./LandingMemory";
import { ChessLoader } from "@/components/common/ChessLoader";

/**
 * Public marketing landing. Logged-in users are redirected to /dashboard
 * (the canonical authenticated home in the Luxury skin); we no longer show
 * the legacy gold-on-navy "Welcome back" overview here.
 */
export function HomeOverview() {
  const router = useRouter();
  const { user, loading: authLoading, token } = useAuth();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  // We're holding the token but the user record isn't resolved yet — wait.
  if (authLoading && token) {
    return <ChessLoader message="Loading…" />;
  }

  // Authenticated but the redirect hasn't taken effect yet — render the
  // loader so we never flash a marketing page.
  if (user) {
    return <ChessLoader message="Loading your dashboard…" />;
  }

  // One story per section, told once — same page on every screen size.
  // Legends live on their own page (/legends, linked from the nav).
  return (
    <Box minH="100vh" bg="bgDark" color="textPrimary">
      <LandingNav />
      <LandingHeroMinimal />
      <LandingIconFeatures />
      <LandingMemory />
      <LandingRoadToMaster />
      <LandingChessToday />
      <LandingRankingsPreview />
      <LandingEventsPreview />
      <LandingActivitiesPreview />
      <ChessDivider />
      <LandingStory />
      <LandingCta />
      <LandingFooter />
    </Box>
  );
}
