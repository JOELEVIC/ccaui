import type { MetadataRoute } from "next";
import { fetchPublishedActivities } from "@/lib/serverActivities";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dchessacademy.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicRoutes = [
    "",
    "/about",
    "/login",
    "/login/email",
    "/register",
    "/rankings",
    "/tournaments",
    "/community",
    "/contact",
    "/regulations",
  ];

  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  // Each published community post gets its own indexable URL.
  const activities = await fetchPublishedActivities(100);
  const activityEntries: MetadataRoute.Sitemap = activities.map((a) => ({
    url: `${baseUrl}/community/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...activityEntries];
}
