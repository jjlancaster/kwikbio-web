import type { Metadata } from "next";
  import "./globals.css";
  import Nav from "@/components/Nav";
  import Footer from "@/components/Footer";
  import { LevelProvider } from "@/components/LevelProvider";

  export const metadata: Metadata = {
    title: "kwiKBio — The Fastest Path from Research Question to Breakthrough",
    description: "FastScience!™ v7 · US Patent 11,282,088 · Powered by ARS",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kwikbio.com"),
  };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body className="min-h-screen flex flex-col">
          <LevelProvider>
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </LevelProvider>
        </body>
      </html>
    );
  }
  