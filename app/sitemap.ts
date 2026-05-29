import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/dashboard", priority: 0.8, changeFrequency: "weekly" as const },
    ...tools.map((tool) => ({
      path: tool.href,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
  ];

  return routes.map((route) => ({
    url: new URL(route.path, siteConfig.url).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
