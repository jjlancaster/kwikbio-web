import { notFound } from "next/navigation";
  import { listPosts, getPost } from "@/lib/blog";
  import { MDXRemote } from "next-mdx-remote/rsc";

  export async function generateStaticParams() {
    return listPosts().map(p => ({ slug: p.slug }));
  }

  export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPost(slug);
    return { title: post ? `${post.title} — kwiKBio` : "Post not found" };
  }

  export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) notFound();
    return (
      <article className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1>{post.title}</h1>
        <div className="text-xs text-slate-500 not-prose">{post.date}</div>
        <MDXRemote source={post.body} />
      </article>
    );
  }
  