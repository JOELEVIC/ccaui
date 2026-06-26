import type { Metadata } from "next";
import { CommunityFeed } from "@/components/community/CommunityFeed";

const description =
  "Tournaments, recaps, photos and announcements from the chess community across Cameroon.";

export const metadata: Metadata = {
  title: "Community — Events & stories",
  description,
  alternates: { canonical: "/community" },
  openGraph: {
    type: "website",
    title: "Community — Events & stories",
    description,
    url: "/community",
  },
  twitter: { card: "summary_large_image", title: "Community — Events & stories", description },
};

export default function CommunityPage() {
  return <CommunityFeed basePath="/community" />;
}
