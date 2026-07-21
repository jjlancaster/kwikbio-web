# ARS-FS v3 — Architecture from Live State
**Document:** specs/ARS-FS-v3-architecture-from-live-state.md
**Derived from:** Jewel live codebase, branch `claude/ars-fs-v4-recent-032ch8`
**Captured by:** Joule ⚡ 2026-06-26
**Status:** Authoritative — extracted from running system

---

## System Overview

ARS-FS v3 is the live kwiKBio research system deployed on Jewel VPS (187.77.218.210). It is a Next.js 14 application (kwikbio-web, PM2 port 3001) backed by a PostgreSQL quad store (Supabase), a local Ollama LLM (hermes3:8b), and an ARS Gateway (port 5000).

---

## Running Services (PM2 on Jewel)

| PM2 ID | Name | Port | Status |
|--------|------|------|--------|
| 0 | jewel-dashboard | 3000 | online |
| 1 | biounicorn | 3001 | online |
| 3 | kwikbio-api | 3002 | online |
| 4 | ars-gateway | 5000 | online |
| 5 | scicrush-api | — | online |
| 6 | scicrush-frontend | — | online |
| 7 | kwikbio-web (v4) | 3010 | online |
| 8 | devops-api | — | online |

---

## v4 Stack (kwikbio-web, branch claude/ars-fs-v4-recent-032ch8)

### API Routes
- `POST /api/ingest` — text → Ollama → RDF triples → quadstore
- `POST /api/ingest/prism9` — ingest to PRISM-9 graph
- `POST /api/ingest/expand` — expand existing graph node
- `POST /api/ars/query` — ARS query → SLAM → hypotheses
- `POST /api/ars/explain` — SSE explain stream
- `POST /api/slam` — SLAM k-tuple extraction (direct)
- `POST /api/slam/simulate` — pathway simulation
- `POST /api/voi` — Value of Information scoring
- `POST /api/dae` — DAE triple extraction + SSKM update
- `POST /api/hypotheses` — hypothesis generation
- `POST /api/lope` — experiment list + ranking
- `POST /api/marketplace/vendors` — vendor list
- `POST /api/marketplace/experiments/submit` — experiment booking
- `GET  /api/marketplace/bookings` — booking list
- `GET  /api/health` — service health check

### Frontend Pages
- `/` — home + ARS query entry
- `/research` — research dashboard
- `/marketplace` — CRO marketplace
- `/scicrush` — SciCrush social
- `/pricing` — tier pricing
- `/fellows` — fellows program
- `/gateway` — gateway client
- `/blog` — blog

### UI Components
- `ARSResultCard` — hypothesis display with Explain This
- `SlamPanel` — k-tuple visualization
- `DAEPanel` — triple extraction results
- `HypothesisPanel` — hypothesis ranked list
- `ExperimentChooser` — LOPE experiment selector
- `LOPEPanel` — LOPE ranked experiments
- `VendorCard` — CRO vendor display
- `IngestPanel` — text ingest + PRISM-9

---

## Data Layer

### PostgreSQL Tables (Supabase)
- `gs_quads` — RDF quad store (subject, predicate, object, graph_name, metadata)
- `gs_nodes` — causal graph nodes (node_id, label, type, confidence, provenance)
- `gs_edges` — causal graph edges (source, target, relation, confidence, provenance)
- `knowledge_assertions` — legacy triple store
- `hypotheses` — generated hypotheses
- `experiments` — LOPE experiment templates
- `vendors` — CRO marketplace vendors
- `bookings` — experiment bookings

### Indexes
- Quad store: subject, predicate, object, graph_name, composite (s,p,o,g), GIN on metadata
- Nodes: node_type, confidence
- Edges: relation, confidence

---

## Core Library Modules (lib/)

### slam.ts
- `extractKTuples(query, domain)` — ARS → Ollama → k-tuple extraction
- `buildCausalGraph(tuples)` — k-tuples → nodes + edges
- `buildPathwayModel(graph)` — causal graph → pathway model
- `simulatePathway(model, steps)` — ODE simulation
- `runFullSlam(query, domain)` — end-to-end pipeline

### voi.ts
- `computeVOI(input)` — Value of Information scoring
- `recommendExperiment(voi, threshold)` — run/defer/skip

### expdir.ts
- `getExperimentTemplates(domain)` — LOPE template library
- `rankExperiments(hyp, templates, sskm)` — VOI-ranked list

### dae.ts
- `extractTriples(text)` — Ollama → triples
- `computeConfidenceSummary(triples)` — green/yellow/red
- `updateSSKM(triples, session)` — graph update

### marketplace.ts
- `getVendors(filter)` — vendor list
- `matchVendors(experiment, vendors)` — scored matching
- `submitExperiment(request)` — booking creation

---

## Environment Config (.env.local)
```
ARS_GATEWAY_URL=http://localhost:5000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=hermes3:8b
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Known v3 → v4 Gaps (from live inspection)

1. **ARS query returns mock data** — `app/api/ars/query/route.ts` uses MOCK_RESULTS; real ARS gateway integration pending
2. **No auth layer** — pages are public; Clerk + OpenFGA planned for v4
3. **Ollama dependency** — ingest fails gracefully if Ollama unreachable, returns empty triples
4. **Supabase not wired to Jewel PG** — quadstore insert catches errors silently
5. **Neo4j not yet integrated** — async queue planned, not implemented
6. **SSKM state** — in-memory only, not persisted across requests

---

## Last Commit State
```
1ed6986 fix: type alignment + CI workflow
1ab7437 feat: batch 3 — BioUnicorn brand + UI components
751d679 feat: batch 2 — all API routes wired
985b6d1 v4 foundation: DB schema, types, quadstore, SLAM, VOI, ExpDir, DAE, marketplace
0641412 feat: Explain This button + mock explain SSE endpoint
```
