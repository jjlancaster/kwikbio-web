import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// State A — public/unauthenticated chrome (white marketing surface).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
