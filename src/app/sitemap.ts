import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://cameroonchessacademy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    "",
    "/about",
    "/login",
    "/register",
    "/rankings",
    "/contact",
    "/regulations",
  ];

  return publicRoutes.map((path) => ({
    url: `${baseUrl}${path === "" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : ("weekly" as const),
    priority: path === "" ? 1 : 0.8,
  }));
}
