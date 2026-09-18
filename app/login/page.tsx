import { redirect } from "next/navigation";

// The password form that used to live here posted to /api/auth/login, which was
// never implemented — and that path is now served by the Auth.js catch-all.
// The URL is kept so existing links and bookmarks still land somewhere real.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  redirect(`/signin${returnTo ? `?callbackUrl=${encodeURIComponent(returnTo)}` : ""}`);
}
