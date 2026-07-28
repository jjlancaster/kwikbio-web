"use client";

// U1 — the app-wide Level state (spec §3.4 / §5, NAV-DESIGN-v1).
//
// The Level badge is "persistent, one-tap, no session restart" — so the chosen
// Level must survive navigation and reloads and be shared by every surface that
// queries the Query Manager. This provider is that single source of truth: the
// UI reads/writes `level` here and sends it as the `level` param; it never sets
// graph depth directly (the Query Manager binds `level` → `layer`).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DEFAULT_ANON_LEVEL } from "@/lib/ars-query";
import type { Level } from "@/lib/ars-query";

const STORAGE_KEY = "kb.level";

const LEVELS: Level[] = ["beginner", "novice", "pro"];

function isLevel(value: unknown): value is Level {
  return typeof value === "string" && (LEVELS as string[]).includes(value);
}

interface LevelContextValue {
  level: Level;
  setLevel: (level: Level) => void;
  /** True once the persisted Level has hydrated from localStorage. Lets
   *  consumers avoid a flash of the default before the stored value loads. */
  hydrated: boolean;
}

const LevelContext = createContext<LevelContextValue | null>(null);

export function LevelProvider({ children }: { children: React.ReactNode }) {
  // SSR + first client render use the anon default so markup matches and there
  // is no hydration mismatch; the persisted value loads in the effect below.
  const [level, setLevelState] = useState<Level>(DEFAULT_ANON_LEVEL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLevel(stored)) setLevelState(stored);
    } catch {
      // localStorage unavailable (private mode / SSR edge) → keep default.
    }
    setHydrated(true);
  }, []);

  const setLevel = useCallback((next: Level) => {
    setLevelState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal: the Level still applies for this session.
    }
  }, []);

  // Keep Level in sync across tabs/windows (one-tap, no restart).
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && isLevel(e.newValue)) setLevelState(e.newValue);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <LevelContext.Provider value={{ level, setLevel, hydrated }}>
      {children}
    </LevelContext.Provider>
  );
}

/** Read/write the app-wide Level. Falls back to the anon default when used
 *  outside a provider (e.g. an isolated unit render) rather than throwing. */
export function useLevel(): LevelContextValue {
  const ctx = useContext(LevelContext);
  if (ctx) return ctx;
  return { level: DEFAULT_ANON_LEVEL, setLevel: () => {}, hydrated: true };
}
