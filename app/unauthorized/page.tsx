import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Not authorized" };

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">Not authorized</h1>
      <p className="mt-2 text-sm text-slate-500">
        Your account doesn&rsquo;t have access to this area. If you think that&rsquo;s wrong,
        contact an administrator.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-bio-teal underline">
        Back to kwiKBio
      </Link>
    </div>
  );
}
