"use client";

import { useEffect, useState } from "react";
import NavPanel from "./NavPanel";
import TopBar from "./TopBar";

const STORAGE_KEY = "kb_nav_collapsed";

export default function ShellChrome({
  user,
  children,
}: {
  user: { email?: string | null };
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) setCollapsed(saved === "1");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed, mounted]);

  return (
    <div className="dark min-h-screen bg-shell-bg text-ink-primary">
      <TopBar
        user={user}
        onToggleMobile={() => setMobileOpen((v) => !v)}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <div className="flex">
        <NavPanel
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
