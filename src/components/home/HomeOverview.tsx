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
import { LandingActivitiesPreview } from "./LandingActivitiesPreview";
import { LandingCoursesPreview } from "./LandingCoursesPreview";
import { LandingTestimonialsCarousel } from "./LandingTestimonialsCarousel";
import { LandingGallery } from "./LandingGallery";
import { ChessDivider } from "./ChessDivider";
import { LandingAcademy } from "./LandingAcademy";
import { LandingCta } from "./LandingCta";
import { LandingFooter } from "./LandingFooter";
import { LandingRoadToMaster } from "./LandingRoadToMaster";
import { LandingLegends } from "./LandingLegends";
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

  return (
    <Box minH="100vh" bg="bgDark" color="textPrimary">
      <LandingNav />
      <LandingHeroMinimal />
      <LandingIconFeatures />
      <LandingPlayCompete />
      <LandingMemory />
      <LandingRoadToMaster />
      {/* Tall legends gallery — desktop/tablet only, to keep mobile lean. */}
      <Box display={{ base: "none", md: "block" }}>
        <LandingLegends />
      </Box>
      <LandingChessToday />
      <LandingRankingsPreview />
      {/* Second "about" band — desktop/tablet only (footer/About covers it on mobile). */}
      <Box display={{ base: "none", md: "block" }}>
        <LandingCameroonChess />
      </Box>
      {/* Stats counters — rankings already show real numbers; hide on mobile. */}
      <Box display={{ base: "none", md: "block" }}>
        <LandingStats />
      </Box>
      <LandingEventsPreview />
      <LandingActivitiesPreview />
      {/* Courses teaser — overlaps Road to Master; desktop/tablet only. */}
      <Box display={{ base: "none", md: "block" }}>
        <LandingCoursesPreview />
      </Box>
      <ChessDivider />
      <LandingTestimonialsCarousel />
      {/* Photo gallery — supplementary; desktop/tablet only. */}
      <Box display={{ base: "none", md: "block" }}>
        <LandingGallery />
      </Box>
      <LandingAcademy />
      <ChessDivider />
      <LandingCta />
      <LandingFooter />
    </Box>
  );
}
