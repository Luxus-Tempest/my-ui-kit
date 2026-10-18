import type { MetadataRoute } from "next";
import { navigationItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/** Les pages de l'application (celles de la navigation) ne sont pas à indexer. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: navigationItems.map((item) => item.href) },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
