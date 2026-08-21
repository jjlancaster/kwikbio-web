"use client";

// R2 — Terms of Use + age gate. Separate from R1 entitlement (which gates
// research DEPTH); this gates LEGAL access:
//   • ToU/disclaimer accepted before first substantive use (first-page gate)
//   • Age band (18+ vs <18) captured at the moments that legally require it
//     (account / purchase / SciCrush) — NOT on the open Easy search path
//   • Minors cannot self-purchase (parental/classroom approval); SciCrush
//     (dating) is 18+ adult-only, a hard block for minors.
//
// DRAFT: the legal copy in ToUGate/AgeGate is placeholder pending counsel.
// Persistence is client-side (localStorage) until accounts exist; once auth
// lands, move ToU acceptance + age band onto the account record AND enforce the
// SciCrush/purchase gates server-side (client gating alone is not enforcement).

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import ToUGate from "./ToUGate";
import AgeGate from "./AgeGate";

export type AgeBand = "adult" | "minor" | "unknown";

// Bump when the ToU text changes materially → users re-accept.
export const TOU_VERSION = "2026-07-30-draft";
const TOU_KEY = "kb.tou.version";
const AGE_KEY = "kb.age.band";

interface ConsentValue {
  hydrated: boolean;
  touAccepted: boolean;
  acceptTou: () => void;
  ageBand: AgeBand;
  setAgeBand: (b: AgeBand) => void;
  /** True only for a confirmed adult (18+) — gates SciCrush and self-purchase. */
  isAdult: boolean;
  /** Open the age gate for a gated action (returns immediately; gate resolves). */
  requireAge: (reason?: string) => void;
}

const Ctx = createContext<ConsentValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [touAccepted, setTouAccepted] = useState(false);
  const [ageBand, setAgeBandState] = useState<AgeBand>("unknown");
  const [ageGateReason, setAgeGateReason] = useState<string | null>(null);

  // Hydrate from localStorage after mount (SSR-safe: server renders un-accepted).
  useEffect(() => {
    try {
      setTouAccepted(window.localStorage.getItem(TOU_KEY) === TOU_VERSION);
      const b = window.localStorage.getItem(AGE_KEY);
      if (b === "adult" || b === "minor") setAgeBandState(b);
    } catch {
      /* storage blocked — treat as fresh visitor */
    }
    setHydrated(true);
  }, []);

  const acceptTou = useCallback(() => {
    setTouAccepted(true);
    try {
      window.localStorage.setItem(TOU_KEY, TOU_VERSION);
    } catch {
      /* ignore */
    }
  }, []);

  const setAgeBand = useCallback((b: AgeBand) => {
    setAgeBandState(b);
    try {
      if (b === "unknown") window.localStorage.removeItem(AGE_KEY);
      else window.localStorage.setItem(AGE_KEY, b);
    } catch {
      /* ignore */
    }
  }, []);

  const requireAge = useCallback((reason?: string) => setAgeGateReason(reason ?? ""), []);

  return (
    <Ctx.Provider
      value={{
        hydrated,
        touAccepted,
        acceptTou,
        ageBand,
        setAgeBand,
        isAdult: ageBand === "adult",
        requireAge,
      }}
    >
      {children}
      {/* First-page ToU gate — blocks first substantive use until accepted. */}
      {hydrated && !touAccepted && <ToUGate onAccept={acceptTou} />}
      {/* Age gate — opened on demand for account / purchase / SciCrush. */}
      {ageGateReason !== null && (
        <AgeGate
          reason={ageGateReason}
          onAdult={() => {
            setAgeBand("adult");
            setAgeGateReason(null);
          }}
          onMinor={() => setAgeBand("minor")}
          onClose={() => setAgeGateReason(null)}
        />
      )}
    </Ctx.Provider>
  );
}

export function useConsent(): ConsentValue {
  const c = useContext(Ctx);
  if (!c) throw new Error("useConsent must be used within <ConsentProvider>");
  return c;
}
