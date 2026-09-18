"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInForm({
  google,
  email,
  callbackUrl,
}: {
  google: boolean;
  email: boolean;
  callbackUrl: string;
}) {
  const [address, setAddress] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!google && !email) {
    return (
      <p className="rounded-md border border-amber-400/40 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Sign-in is not configured on this deployment yet. The open Easy search still works.
      </p>
    );
  }

  if (sent) {
    return (
      <p className="rounded-md border border-emerald-400/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        Check <strong>{address}</strong> for your sign-in link.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {google && (
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Continue with Google
        </button>
      )}

      {google && email && (
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>
      )}

      {email && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            // redirect:false so the "check your email" state renders here
            // instead of bouncing to the provider's own verify page.
            await signIn("nodemailer", { email: address, callbackUrl, redirect: false });
            setBusy(false);
            setSent(true);
          }}
          className="flex flex-col gap-2"
        >
          {/* R3 — explicit text color: inherited white-on-white made typed
              input invisible on the previous site. */}
          <label htmlFor="signin-email" className="text-sm font-medium">
            Email a sign-in link
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="you@example.com"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:border-bio-teal"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-bio-teal px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send link"}
          </button>
        </form>
      )}
    </div>
  );
}
