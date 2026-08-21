"use client";

// App-wide Research Level state (U1). The Level badge is a persistent, one-tap
// control (NAV-DESIGN: "persistent, one-tap, no session restart") that governs
// the OntologyLayer depth the Query Manager plans (spec §3.4). Backed by
// localStorage so the choice survives navigation and reloads.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DEFAULT_ANON_LEVEL, type Level } from "@/lib/ars-query";

const LEVELS: readonly Level[] = ["beginner", "novice", "pro"];
const STORAGE_KEY = "ars.level";

interface LevelContextValue {
  level: Level;
  setLevel: (level: Level) => void;
}

const LevelContext = createContext<LevelContextValue | null>(null);

export function LevelProvider({ children }: { children: React.ReactNode }) {
  // Server and first client render use the anonymous default, so markup matches
  // (no hydration mismatch); the stored choice is applied right after mount.
  const [level, setLevelState] = useState<Level>(DEFAULT_ANON_LEVEL);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && (LEVELS as readonly string[]).includes(stored)) {
        setLevelState(stored as Level);
      }
    } catch {
      /* localStorage unavailable (private mode, SSR) — keep the default */
    }
  }, []);

  const setLevel = useCallback((next: Level) => {
    setLevelState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore write failures — in-memory state still updates */
    }
  }, []);

  return (
    <LevelContext.Provider value={{ level, setLevel }}>
      {children}
    </LevelContext.Provider>
  );
}

export function useLevel(): LevelContextValue {
  const ctx = useContext(LevelContext);
  if (!ctx) {
    throw new Error("useLevel must be used within <LevelProvider>");
  }
  return ctx;
}
