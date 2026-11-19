import type { MetadataRoute } from "next";
import { routes } from "@/lib/navigation/routes";
import { siteUrl } from "./site";

const lastModified = new Date("2026-11-19");

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route, index) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: index === 0 ? 1 : 0.8,
  }));
}
