import type { Metadata } from "next";
import SignInForm from "@/components/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

// Which providers are actually configured is a server-side fact (secrets never
// reach the browser), so it is resolved here and passed down as plain flags.
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const google = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const email = Boolean(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Sign in to kwiKBio</h1>
        <p className="mt-2 text-sm text-slate-500">
          You don&rsquo;t need an account to search — the Easy level is open to everyone.
          Signing in unlocks deeper research levels.
        </p>
      </div>
      <SignInForm google={google} email={email} callbackUrl={callbackUrl ?? "/"} />
    </div>
  );
}
