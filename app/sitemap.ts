import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kwikbio.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/gateway", changeFrequency: "monthly", priority: 0.8 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
  ] satisfies Array<{
    path: string;
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
    priority: number;
  }>;

  const staticRoutes: MetadataRoute.Sitemap = routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const postRoutes: MetadataRoute.Sitemap = listPosts().map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
