# HANDOFF: Watt — kwiKBio v4 Build
**Document:** agents/handoff/HANDOFF-WATT-260624-v4-MVP.md
**From:** Joule ⚡ + Hermes ⚡
**To:** Watt 🔧 (Replit)
**Date:** 2026-06-24 (formalized 2026-06-26)
**Status:** ACTIVE — start immediately

---

## What You're Building

kwiKBio v4 MVP — the ARS-powered biomedical research platform.

**Repo:** github.com/jjlancaster/brainfiles (specs) + Jewel deploy
**Branch:** `claude/ars-fs-v4-recent-032ch8`
**Deploy:** Jewel VPS (187.77.218.210), PM2 `kwikbio-web`, port 3010
**URL when live:** kwikbio.com (currently serving v3 shell)

---

## Current State (as of 2026-06-26)

The branch is live on Jewel and passing health checks. The foundation is built:

✅ Next.js 14 app shell  
✅ Database schema (PostgreSQL — gs_quads, gs_nodes, gs_edges, hypotheses, experiments, vendors, bookings)  
✅ All API routes wired (ingest, ARS query, SLAM, VOI, DAE, LOPE, marketplace)  
✅ All UI components (ARSResultCard, SlamPanel, DAEPanel, HypothesisPanel, IngestPanel, ExperimentChooser, LOPEPanel, VendorCard)  
✅ BioUnicorn brand + all pages  
✅ CI workflow  

**What's missing / mock:**
- ARS query returns hardcoded mock data
- Ingest doesn't persist (Supabase not connected to Jewel PG)
- No auth / no signup wall
- No conversion telemetry
- No graph visualization

---

## Your Build Queue (in order)

### 1. Fix Supabase → Jewel PG connection (2h)

The `.env.local.example` shows the vars needed. Wire real Jewel PG credentials:

```
DATABASE_URL=postgresql://root:PASSWORD@localhost:5432/kwikbio
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Ask Hydro for the production credentials. Test with:
```bash
curl -X POST http://localhost:3010/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"text":"BRCA1 inhibits tumor growth via p53 pathway","graphName":"test"}'
# Should return: {"triples":[...],"inserted":N}
# inserted > 0 = Supabase connected
```

### 2. Replace mock ARS query with live gateway (3h)

File: `app/api/ars/query/route.ts`

Replace the MOCK_RESULTS lookup with a real fetch to ARS gateway:

```typescript
import { NextRequest, NextResponse } from "next/server";

const ARS_GATEWAY = process.env.ARS_GATEWAY_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
  const { query, domain } = await req.json();
  
  try {
    const resp = await fetch(`${ARS_GATEWAY}/v1/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, domain }),
      signal: AbortSignal.timeout(30_000),
    });
    
    if (!resp.ok) throw new Error(`ARS gateway ${resp.status}`);
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err) {
    // Fallback to SLAM pipeline if gateway down
    return NextResponse.json({ error: "ARS gateway unavailable", fallback: true }, { status: 503 });
  }
}
```

Test: hit `/api/ars/query` with a real query, verify non-mock response.

### 3. Add 3 conversion telemetry events (1h)

Before any traffic goes live, instrument these 3 events:

```typescript
// In app/page.tsx or wherever the ARS query form lives:
// Event 1: anon_query_submitted
// Event 2: anon_query_result_seen  
// Event 3: signup_initiated_post_query

// Minimal implementation — fire to /api/telemetry or console.log to start
async function trackEvent(name: string, props?: Record<string, unknown>) {
  await fetch('/api/telemetry', {
    method: 'POST',
    body: JSON.stringify({ event: name, ...props, ts: Date.now() }),
    headers: { 'Content-Type': 'application/json' }
  }).catch(() => {}); // never block UI
}
```

Create `app/api/telemetry/route.ts` — log to PG table `telemetry_events` (subject, event_name, props, ts).

### 4. Auth wall — anonymous 1-query gate (4h)

- Use Clerk for identity (Justin approved)
- After 1 anonymous ARS query → show signup modal
- Track anonymous usage via cookie/localStorage counter
- Freemium tier: unlimited basic, $8/$20 for advanced

```typescript
// In ARS result display component:
const queryCount = parseInt(localStorage.getItem('anon_query_count') ?? '0');
if (queryCount >= 1 && !user) {
  setShowSignupModal(true);
  return;
}
localStorage.setItem('anon_query_count', String(queryCount + 1));
```

---

## Who to Talk To

**Hydro** — Jewel credentials, DB migrations, PM2 restarts, Ollama status  
**Lumen** — ARS gateway integration details, graph viz (Reagraph), Neo4j  
**Hermes** — Daily dispatch, strategic decisions, spec clarifications  
**Joule** — Justin comms, brainfiles relay, coordination  

---

## Definition of Done (v4 MVP)

- [ ] `POST /api/ingest` → inserts to PG (verified by `inserted > 0`)
- [ ] `POST /api/ars/query` → returns real results (not mock)
- [ ] 3 telemetry events firing
- [ ] Anonymous user hits signup wall after 1 query
- [ ] All existing tests still pass
- [ ] Deployed on Jewel PM2, accessible at kwikbio.com

---

## Contacts / Access

- **Jewel SSH:** `ssh hydro` from Joule laptop (via Tailscale)
- **Aqua SSH:** `ssh aqua` from Joule laptop
- **brainfiles:** ~/brainfiles (git synced every 20-30 min)
- **Justin direct:** +16176882785 (SMS) / dr.justin.lancaster@gmail.com

---

*Ship it. Quality over speed but don't let perfect block good.*
— Joule ⚡
