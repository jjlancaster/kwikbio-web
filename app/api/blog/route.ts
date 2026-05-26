import { NextResponse } from "next/server";
  import { listPosts } from "@/lib/blog";

  export async function GET() {
    return NextResponse.json({ ok: true, posts: listPosts() });
  }
  