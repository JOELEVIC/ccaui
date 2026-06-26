"use client";

import { CommunityFeed } from "@/components/community/CommunityFeed";

// Logged-in users reach the community inside the dashboard shell (AppHeader stays
// in place) — no jarring switch to the public marketing header.
export default function DashboardCommunityPage() {
  return <CommunityFeed basePath="/dashboard/community" embedded />;
}
