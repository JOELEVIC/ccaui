"use client";

import { useParams } from "next/navigation";
import { CommunityArticle } from "@/components/community/CommunityArticle";

export default function DashboardActivityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  return <CommunityArticle slug={slug} basePath="/dashboard/community" embedded />;
}
