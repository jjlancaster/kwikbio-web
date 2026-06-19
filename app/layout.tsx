import type { Metadata } from "next";
  import "./globals.css";
  import Nav from "@/components/Nav";
  import Footer from "@/components/Footer";

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kwikbio.com";
  const DEFAULT_TITLE = "kwiKBio — The Fastest Path from Research Question to Breakthrough";
  const DESCRIPTION = "FastScience!™ v7 · US Patent 11,282,088 · Powered by ARS";

  export const metadata: Metadata = {
    title: {
      default: DEFAULT_TITLE,
      template: "%s · kwiKBio",
    },
    description: DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: "/" },
    keywords: [
      "FastScience",
      "ARS",
      "Automated Research System",
      "research acceleration",
      "knowledge graph",
      "hypothesis generation",
      "CRO matching",
      "kwiKBio",
    ],
    openGraph: {
      type: "website",
      siteName: "kwiKBio",
      url: SITE_URL,
      title: DEFAULT_TITLE,
      description: DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
    },
  };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    );
  }
  