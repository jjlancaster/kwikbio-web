# `ars-query` — the Query Manager (ARS Core module)

Patent figure **206**. The bridge between the user surface (`205`), the graph
stores (Neo4j / quad-store / provenance), and the live ARS runtime (`:5000`).

Spec of record: `brainfiles/ars-42-spec/spec/ARS-FS4.2-SPEC-DRAFT-1-260716.md` §3
Provenance contract: PRISM Spec Amendment rev 1.1 (§A2/§A3).

## Boundary-map contract

This module is **arena-general ARS Core** (`ARS-V3-NAMING-AND-BOUNDARY-MAP`).
It **must not import from any `kwikbio-*` code**. `kwikbio-web` calls it; it does
not own it. Keeping this directory self-contained lets it extract to an
`ars-core` package later without a rewrite.

## Lifecycle (spec §3.2)

```
parse → plan → route → execute → assemble → provenance-stamp → return
```

- **Level → layer** is bound at **plan time** (`levels.ts`), so shallow Levels
  are cheaper/faster, not just visually simpler. `maxObjects`/`maxEdges` are the
  per-query plan cost ceiling (Jewel/Hostinger CPU guard).
- **Provenance honesty** (`resolve.ts`): when `GRAPH_AVAILABLE` is false (P0
  `gs_nodes`/`gs_edges` not yet created), the response is flagged
  `provenance: "unavailable"` and edges carry **no** fabricated provenance.
- **Edges are `influence`** until a validation/simulation step promotes them to
  `causal` (Rule 4). Status starts at `candidate`.

## Provenance contract (`provenance.ts`)

Implements *"Correlation proposes. Evidence promotes. The ledger records."*
- `validateTransition` enforces the Amendment §A3.1 transition table.
- **Correlation/legacy-only provenance can never reach `assumed`/`active`** — the
  executable form of rev 1.0 §26.
- `runProvenanceInvariantChecks()` is the runnable acceptance surface
  (Amendment §A6.1), exposed at `GET /api/ars-query/selfcheck`.

## Endpoints (in kwikbio-web)

- `POST /api/ars-query/resolve` — resolve a research query (§3.5 contract).
- `GET  /api/ars-query/selfcheck` — run provenance invariants; 200 if all pass.

## Env

- `ARS_GATEWAY_URL` (default `http://localhost:5000`)
- `GRAPH_AVAILABLE` (`"true"` once P0 tables exist on Jewel)

## Deferred to v4.2.1 (CEM)

Correlation ingestion, entity resolution, promotion engine, and UI live in the
Correlation Edge Module spec — **not** built here. This module ships only the
Query Manager + the provenance *contract* they depend on.
