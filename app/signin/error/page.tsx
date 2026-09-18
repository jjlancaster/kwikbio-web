import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign-in problem" };

export default async function SignInErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">We couldn&rsquo;t sign you in</h1>
      <p className="mt-2 text-sm text-slate-500">
        {error === "Verification"
          ? "That sign-in link has expired or was already used. Request a new one."
          : "Something went wrong during sign-in. Please try again."}
      </p>
      <Link href="/signin" className="mt-6 inline-block text-sm font-medium text-bio-teal underline">
        Back to sign in
      </Link>
    </div>
  );
}
