"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth";
import { LandingNav } from "./LandingNav";
import { LandingHeroMinimal } from "./LandingHeroMinimal";
import { LandingRankingsPreview } from "./LandingRankingsPreview";
import { LandingIconFeatures } from "./LandingIconFeatures";
import { LandingCameroonChess } from "./LandingCameroonChess";
import { LandingStats } from "./LandingStats";
import { LandingPlayCompete } from "./LandingPlayCompete";
import { LandingEventsPreview } from "./LandingEventsPreview";
import { LandingCoursesPreview } from "./LandingCoursesPreview";
import { LandingTestimonialsCarousel } from "./LandingTestimonialsCarousel";
import { LandingGallery } from "./LandingGallery";
import { ChessDivider } from "./ChessDivider";
import { LandingAcademy } from "./LandingAcademy";
import { LandingCta } from "./LandingCta";
import { LandingFooter } from "./LandingFooter";
import { LandingRoadToMaster } from "./LandingRoadToMaster";
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

  return (
    <Box minH="100vh" bg="bgDark" color="white">
      <LandingNav />
      <LandingHeroMinimal />
      <LandingIconFeatures />
      <LandingPlayCompete />
      <LandingRoadToMaster />
      <LandingRankingsPreview />
      <LandingCameroonChess />
      <LandingStats />
      <LandingEventsPreview />
      <LandingCoursesPreview />
      <ChessDivider />
      <LandingTestimonialsCarousel />
      <LandingGallery />
      <LandingAcademy />
      <ChessDivider />
      <LandingCta />
      <LandingFooter />
    </Box>
  );
}
