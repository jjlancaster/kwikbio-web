import Link from "next/link";
  import { listPosts } from "@/lib/blog";

  export const metadata = {
    title: "Blog",
    description: "Notes from the FastScience! frontier — research acceleration, graph AI, and ARS case studies.",
  };

  export default function BlogIndex() {
    const posts = listPosts();
    return (
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="text-slate-600 mt-3">Notes from the FastScience! frontier.</p>
        <ul className="mt-10 space-y-6">
          {posts.map(p => (
            <li key={p.slug} className="border-b border-slate-200 pb-6">
              <Link href={`/blog/${p.slug}`} className="text-2xl font-semibold text-brand-700 hover:underline">
                {p.title}
              </Link>
              <div className="text-xs text-slate-500 mt-1">{p.date}</div>
              <p className="text-sm text-slate-600 mt-2">{p.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  