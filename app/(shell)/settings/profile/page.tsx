import Link from "next/link";
import ProfileForm from "@/components/shell/ProfileForm";
import { getSession } from "@/lib/session";

export const metadata = { title: "SciCrush profile — kwiKBio" };

export default async function ProfilePage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/settings" className="text-sm text-ink-secondary hover:text-accent">
        ← Settings
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">SciCrush profile</h1>
      <p className="mt-2 text-ink-secondary">
        This shapes how the ARS engine matches research directions and CROs to
        you. Nothing here is public.
      </p>

      <div className="mt-8">
        <ProfileForm initialEmail={session?.email} />
      </div>
    </div>
  );
}
