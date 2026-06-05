"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  label: string;
  href?: string;
  icon: string;
  locked?: boolean;
};

const mainItems: Item[] = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "My Research", href: "/dashboard", icon: "🔬" },
  { label: "Courses", href: "/courses", icon: "📚" },
  { label: "My Team", href: "/dashboard", icon: "👥" },
];

const biomedical: Item[] = [
  { label: "kwiKBio", href: "/g/kwikbio", icon: "🔬" },
  { label: "bioNook", icon: "🧬", locked: true },
  { label: "bioUnicorn", icon: "🦄", locked: true },
  { label: "CrowdCure", icon: "💊", locked: true },
  { label: "Vermont Med", icon: "🏥", locked: true },
];

const training: Item[] = [
  { label: "FS! Foundations", href: "/courses", icon: "📘" },
  { label: "Biomedical Track", href: "/courses", icon: "🔬" },
  { label: "Climate Track", icon: "🌍", locked: true },
  { label: "Energy Track", icon: "⚡", locked: true },
];

const footerItems: Item[] = [
  { label: "Settings", href: "/settings", icon: "⚙️" },
  { label: "Help & Docs", href: "/docs", icon: "❓" },
];

function Row({
  item,
  collapsed,
  active,
}: {
  item: Item;
  collapsed: boolean;
  active: boolean;
}) {
  const base = "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors";
  const cls = item.locked
    ? `${base} cursor-not-allowed text-ink-secondary/40`
    : active
      ? `${base} bg-accent/10 text-accent`
      : `${base} text-ink-secondary hover:bg-white/5 hover:text-ink-primary`;

  const content = (
    <>
      <span className="w-5 shrink-0 text-center">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.locked && <span className="ml-auto text-xs">🔒</span>}
    </>
  );

  if (item.locked || !item.href) {
    return (
      <div className={cls} title={item.label} aria-disabled>
        {content}
      </div>
    );
  }
  return (
    <Link href={item.href} className={cls} title={item.label}>
      {content}
    </Link>
  );
}

export default function NavPanel({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href?: string) =>
    !!href && (pathname === href || (href !== "/dashboard" && pathname.startsWith(href)));

  const SectionLabel = ({ title }: { title: string }) =>
    collapsed ? (
      <div className="my-2 border-t border-shell-border" />
    ) : (
      <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-ink-secondary/60">
        {title}
      </div>
    );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}
      <aside
        className={[
          "z-40 shrink-0 border-r border-shell-border bg-shell-surface",
          "fixed inset-y-0 left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto",
          "transition-[width,transform] duration-200 ease-in-out",
          "md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0",
          collapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <nav className="flex h-full flex-col p-2">
          {mainItems.map((i) => (
            <Row key={i.label} item={i} collapsed={collapsed} active={isActive(i.href)} />
          ))}

          <SectionLabel title="Gateways" />
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] uppercase tracking-wide text-ink-secondary/40">
              Biomedical
            </div>
          )}
          {biomedical.map((i) => (
            <Row key={i.label} item={i} collapsed={collapsed} active={isActive(i.href)} />
          ))}

          <SectionLabel title="Training" />
          {training.map((i) => (
            <Row key={i.label} item={i} collapsed={collapsed} active={isActive(i.href)} />
          ))}

          <div className="mt-auto pt-2">
            <div className="my-2 border-t border-shell-border" />
            {footerItems.map((i) => (
              <Row key={i.label} item={i} collapsed={collapsed} active={isActive(i.href)} />
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
