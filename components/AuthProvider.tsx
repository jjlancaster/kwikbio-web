"use client";

// Bridges the server-resolved session into client components (`useSession`),
// and performs the D-AUTH-4 consent lift: the first time a signed-in visitor
// arrives carrying pre-account localStorage consent, push it onto the account
// record, then adopt whatever the server says. The account wins from then on.

import { SessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect, useRef } from "react";
import { TOU_VERSION } from "./Consent";

const TOU_KEY = "kb.tou.version";
const AGE_KEY = "kb.age.band";
const LIFTED_KEY = "kb.consent.lifted";

function ConsentLift() {
  const { data: session, status, update } = useSession();
  const ran = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || ran.current) return;
    ran.current = true;

    let localTou: string | null = null;
    let localAge: string | null = null;
    let alreadyLifted = false;
    try {
      localTou = window.localStorage.getItem(TOU_KEY);
      localAge = window.localStorage.getItem(AGE_KEY);
      alreadyLifted = window.localStorage.getItem(LIFTED_KEY) === session?.user?.id;
    } catch {
      return; // storage blocked — nothing to lift
    }
    if (alreadyLifted) return;

    const payload: Record<string, unknown> = { migrated: true };
    if (localTou) payload.touVersion = localTou;
    if (localAge === "adult" || localAge === "minor") payload.ageBand = localAge;
    if (!payload.touVersion && !payload.ageBand) return;

    (async () => {
      try {
        const res = await fetch("/api/account/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return;
        const server = (await res.json()) as {
          touVersion: string | null;
          ageBand: string | null;
        };
        // Adopt the server's answer — it may differ from what we sent, because
        // a migration never overwrites consent the account already recorded.
        try {
          window.localStorage.setItem(LIFTED_KEY, session?.user?.id ?? "");
          if (server.touVersion) window.localStorage.setItem(TOU_KEY, server.touVersion);
          if (server.ageBand) window.localStorage.setItem(AGE_KEY, server.ageBand);
        } catch {
          /* ignore */
        }
        await update();
      } catch {
        /* offline / transient — retried on the next load */
      }
    })();
  }, [status, session?.user?.id, update]);

  return null;
}

export default function AuthProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <ConsentLift />
      {children}
    </SessionProvider>
  );
}

export { TOU_VERSION };
