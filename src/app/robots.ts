import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kelajakuylar.uz";
  const baseUrl = siteUrl.replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/profile",
        "/favorites",
        "/add-listing",
        "/edit-listing",
        "/login",
        "/register",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
