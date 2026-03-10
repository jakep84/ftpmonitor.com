// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { DOCS } from "@/content/docs";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ftpmonitor.com";

  const staticPages = [
    {
      url: `${base}`,
      lastModified: new Date(),
    },
    {
      url: `${base}/guides`,
      lastModified: new Date(),
    },
  ];

  const docPages = DOCS.map((doc) => ({
    url:
      doc.type === "guide"
        ? `${base}/guides/${doc.slug}`
        : `${base}/errors/${doc.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...docPages];
}
