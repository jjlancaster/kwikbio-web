import Link from "next/link";
  import type { ReactNode } from "react";

  type Variant = "primary" | "secondary" | "ghost";

  const styles: Record<Variant, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-white text-brand-700 border border-brand-600 hover:bg-brand-50",
    ghost: "text-slate-700 hover:text-brand-700",
  };

  export default function CTAButton({
    href, variant = "primary", children,
  }: { href: string; variant?: Variant; children: ReactNode }) {
    return (
      <Link href={href} className={`inline-block px-5 py-3 rounded-md font-medium transition ${styles[variant]}`}>
        {children}
      </Link>
    );
  }
  