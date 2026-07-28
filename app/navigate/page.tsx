"use client";

// U2 — /navigate : the Three.js Navigator flight sim (flight-sim spec target
// path). The WebGL scene is client-only, so it is dynamically imported with
// ssr:false to keep it out of the server prerender.

import dynamic from "next/dynamic";

const FlightSim = dynamic(() => import("@/components/navigator/FlightSim"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-bio-navy text-slate-400">
      Booting Navigator…
    </div>
  ),
});

export default function NavigatePage() {
  return <FlightSim />;
}
