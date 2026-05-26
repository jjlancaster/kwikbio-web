import fs from "node:fs";
  import path from "node:path";
  import matter from "gray-matter";

  const POSTS_DIR = path.join(process.cwd(), "content", "blog");

  export interface PostMeta {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
  }

  export function listPosts(): PostMeta[] {
    if (!fs.existsSync(POSTS_DIR)) return [];
    return fs.readdirSync(POSTS_DIR)
      .filter(f => f.endsWith(".mdx") || f.endsWith(".md"))
      .map(f => {
        const slug = f.replace(/\.mdx?$/, "");
        const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
        const { data } = matter(raw);
        return {
          slug,
          title: data.title ?? slug,
          date: data.date ?? "",
          excerpt: data.excerpt ?? "",
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  export function getPost(slug: string): (PostMeta & { body: string }) | null {
    const candidates = [`${slug}.mdx`, `${slug}.md`];
    for (const f of candidates) {
      const p = path.join(POSTS_DIR, f);
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
        const { data, content } = matter(raw);
        return {
          slug,
          title: data.title ?? slug,
          date: data.date ?? "",
          excerpt: data.excerpt ?? "",
          body: content,
        };
      }
    }
    return null;
  }
  