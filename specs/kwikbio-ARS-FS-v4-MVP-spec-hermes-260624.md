# kwiKBio ARS-FS v4 MVP Spec — Hermes 2026-06-24
**Document:** specs/kwikbio-ARS-FS-v4-MVP-spec-hermes-260624.md
**Source:** Hermes ⚡ synthesis from V4-BUILD-SPEC-FOR-WATT-DRAFT + STRATEGY docs on Aqua
**Compiled by:** Joule ⚡ 2026-06-26 (relay from Hermes)
**Status:** LOCKED — all pre-build decisions made

---

## Locked Decisions

| Decision | Resolution | Locked by |
|----------|-----------|-----------|
| Auth pattern | Magic link + Google OAuth (v3); Clerk + OpenFGA (v3.5) | JJL 2026-06-22 |
| Graph renderer | **Reagraph** (React-native, WebGL, force-directed + DAG) | JJL 2026-06-22 |
| Data layer | Renderer-agnostic adapter pattern — no Reagraph coupling in business logic | Architecture mandate |
| Pre-v4 gate | Text Ingest module (`/api/ingest` → RDF triple → PRISM-9) | Hermes 2026-06-26 |
| Database | PostgreSQL on Jewel (Neo4j async queue) | Hydro |
| Local LLM | Ollama `hermes3:8b` at `http://localhost:11434` (Jewel) | Hydro |
| ARS Gateway | `http://localhost:5000` (Jewel) | Hydro |
| Branch | `claude/ars-fs-v4-recent-032ch8` | Lumen 2026-06-24 |
| Deploy target | Jewel, PM2 `kwikbio-web`, port 3010 | Hydro |

---

## v4 Scope — What Ships

### PRE-V4 GATE (Build first — prerequisite for v4)

**Text Ingest → RDF Triple → PRISM-9 Module**

- UI: `IngestPanel` component (✅ exists)
- API: `POST /api/ingest` → Ollama → triples → quadstore (✅ wired)
- API: `POST /api/ingest/prism9` (✅ wired)
- API: `POST /api/ingest/expand` (✅ wired)
- Gap: Supabase connection needs Jewel PG credentials in .env.local
- Gap: Ollama hermes3:8b must be running on Jewel

### PHASE 1 — ARS Query → Real Results (v4.0)

Replace mock data in `app/api/ars/query/route.ts` with live ARS gateway call:

```typescript
// Replace MOCK_RESULTS lookup with:
const arsResp = await fetch(`${ARS_GATEWAY}/v1/query`, {
  method: 'POST',
  body: JSON.stringify({ query, domain }),
  headers: { 'Content-Type': 'application/json' }
});
```

Required: ARS gateway at port 5000 serving `/v1/query` with real SLAM pipeline.

### PHASE 2 — Auth (v4.1)

- Clerk for user identity
- OpenFGA for permission model (freemium / $8 / $20 tiers)
- Gate: anonymous gets 1 free ARS query, then signup wall
- Conversion events: `anon_query_submitted` → `anon_query_result_seen` → `signup_initiated_post_query`

### PHASE 3 — Graph Visualization (v4.2)

- Install Reagraph: `npm install reagraph`
- Replace `VizSim` component with Reagraph canvas
- Data source: gs_nodes + gs_edges from quadstore
- Force-directed layout for causal graphs
- DAG layout for pathway models

### PHASE 4 — Neo4j Async Queue (v4.3)

- Background worker: quadstore insert → Neo4j queue
- Neo4j at `bolt://localhost:7687`
- Use for complex graph traversal queries
- PostgreSQL remains primary, Neo4j is read-optimized

### PHASE 5 — SSKM Persistence (v4.4)

- Persist SSKM state in PostgreSQL (new table: `sskm_sessions`)
- Session-keyed: userId + researchContext
- DAE updates persist across requests
- SSKM v20 checkpoint from Lumen (2026-06-26)

---

## Current Live State (2026-06-26)

```
GET https://kwikbio.com/api/health
→ {"ok":true,"service":"kwikbio-web","version":"0.1.0","ts":"2026-06-26T12:00:46Z"}
```

All PM2 services online. Branch at commit `1ed6986`.

---

## Build Priority Order for Watt

1. Wire real Supabase/PG connection (unblock ingest persistence)
2. Replace mock ARS query with live gateway call
3. Add conversion telemetry (3 events before any traffic)
4. Auth wall (Clerk + free tier gate)
5. Reagraph visualization
6. Neo4j async queue
7. SSKM persistence

---

## Agent Assignments

| Agent | Responsibility |
|-------|---------------|
| Watt 🔧 | Auth, ingest persistence, conversion telemetry |
| Lumen 🕯️ | ARS gateway integration, graph viz, Neo4j queue |
| Hydro 💧 | Jewel ops, PM2, DB migration, Ollama |
| Hermes ⚡ | Spec synthesis, daily dispatch, Aqua coordination |
| Joule ⚡ | Coordination, brainfiles relay, Justin comms |

---

## Success Criteria for v4 MVP

- [ ] Real ARS query returns real hypotheses (not mock)
- [ ] Ingest panel stores triples in PG
- [ ] Anonymous user hits signup wall after 1 query
- [ ] 3 conversion events firing to analytics
- [ ] Reagraph causal graph renders for a result
- [ ] 10 beta users can complete full flow
