import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/** Pages publiques à indexer. Les pages de l'application (après connexion) n'y sont pas. */
const PUBLIC_PAGES = ["/", "/connexion", "/inscription"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((path) => ({ url: `${siteConfig.url}${path === "/" ? "" : path}` }));
}
