import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { LevelProvider } from "@/components/LevelContext";
import { EntitlementProvider } from "@/components/Entitlement";
import { ConsentProvider } from "@/components/Consent";
import AuthProvider from "@/components/AuthProvider";
import { auth } from "@/lib/auth";
import { maxLevelFor } from "@/lib/auth/entitlement";

export const metadata: Metadata = {
  title: "kwiKBio — The Fastest Path from Research Question to Breakthrough",
  description: "FastScience!™ v7 · US Patent 11,282,088 · Powered by ARS",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kwikbio.com"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolve the entitlement on the SERVER so the first paint already reflects
  // the account's real ceiling — no flash of anonymous, no client guess.
  // Anonymous visitors resolve to the freemium/anonymous ceiling (Easy), which
  // is the open path; nothing here requires an account.
  const session = await auth().catch(() => null);
  const maxLevel = maxLevelFor(
    session?.user
      ? {
          tier: session.user.tier,
          ageBand: session.user.ageBand,
          guardianConfirmed: session.user.guardianConfirmed,
        }
      : null
  );

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider session={session}>
          <ConsentProvider>
            <EntitlementProvider maxLevel={maxLevel}>
              <LevelProvider>
                <Nav />
                <main className="flex-1">{children}</main>
                <Footer />
              </LevelProvider>
            </EntitlementProvider>
          </ConsentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
