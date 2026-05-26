import { NextResponse } from "next/server";

  const TIERS = {
    freemium:   { name: "Freemium",   queries_per_month: 5,     cro_access: false },
    explorer:   { name: "Explorer",   queries_per_month: 50,    cro_access: false },
    researcher: { name: "Researcher", queries_per_month: -1,    cro_access: false },
    pro:        { name: "Pro",        queries_per_month: -1,    cro_access: true  },
    enterprise: { name: "Enterprise", queries_per_month: -1,    cro_access: true  },
  } as const;

  export async function POST(req: Request) {
    let payload: any = {};
    try { payload = await req.json(); } catch {}
    const tier = String(payload?.tier ?? "freemium").toLowerCase() as keyof typeof TIERS;
    const info = TIERS[tier] ?? TIERS.freemium;
    return NextResponse.json({ ok: true, tier, ...info });
  }
  