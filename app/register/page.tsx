import { redirect } from "next/navigation";

// Registration is the same door as sign-in: the magic link creates the account
// on first use, so there is no separate form to keep. The URL is preserved for
// existing links.
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  redirect(`/signin${returnTo ? `?callbackUrl=${encodeURIComponent(returnTo)}` : ""}`);
}
