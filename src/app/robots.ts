import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://cameroonchessacademy.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/games", "/game/", "/learning/puzzle/", "/admin", "/play/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
