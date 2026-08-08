import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/eden-vault",
          "/api/",
          "/profile/",
          "/dashboard/",
          "/_next/",
          "/prisma/",
          "/scripts/"
        ]
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`
  };
}
