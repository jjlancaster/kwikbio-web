// Query Manager lifecycle (spec §3.2):
//   parse → plan → route → execute → assemble → provenance-stamp → return
//
// Self-contained (no kwikbio-* imports). Reads live data from the ARS engine
// (jjlancaster/ars-fs, via engine.ts) for seeded subjects; falls back to a
// deterministic mock for not-yet-seeded subjects and off-Jewel dev.

import { DEFAULT_ANON_LEVEL, planForLevel } from "./levels";
import { fetchEngineSnapshot } from "./engine";
import type {
  EdgeKind,
  Level,
  ProvenanceAvailability,
  ProvenanceEntry,
  QMEdge,
  QMObject,
  QMRoute,
  QueryManagerRequest,
  QueryManagerResponse,
  RelationshipStatus,
} from "./types";

// Subjects with a live SSKM seed in the engine today.
// v4.2.1 (2026-07-31): all 5 disease subjects seeded — engine for MPN, rich-seed for the 4 new ones.
const ENGINE_SUBJECTS = new Set(["rbc-mpn-pv"]);

interface RawEdge {
  source: string;
  target: string;
  relation: string;
  confidence: number;
}
interface RawSnapshot {
  subject: string;
  confidence: number;
  objects: QMObject[];
  edges: RawEdge[];
  routes: QMRoute[];
  provenanceAvailable: boolean;
  source: "gateway" | "mock";
}

// ─── Mock seed (layer-tagged), used off-Jewel / for unseeded subjects ────────
interface SeedObject {
  label: string;
  role: QMObject["role"];
  confidence: number;
  definition: string;
  layer: number;
}
interface Seed {
  subject: string;
  objects: SeedObject[];
  edges: RawEdge[];
  routes?: QMRoute[];
}

const SEEDS: Record<string, Seed> = {
  "cystic-fibrosis": {
    subject: "Cystic Fibrosis",
    objects: [
      { label: "CFTR", role: "goal", confidence: 0.96, definition: "Cystic Fibrosis Transmembrane conductance Regulator — chloride channel whose loss of function causes CF.", layer: 0 },
      { label: "F508del mutation", role: "subsystem", confidence: 0.94, definition: "Most prevalent CFTR variant (~70% of CF alleles); causes misfolding and proteasomal degradation.", layer: 0 },
      { label: "Chloride ion transport", role: "subsystem", confidence: 0.91, definition: "CFTR mediates apical Cl⁻ secretion; loss drives mucus dehydration and thick secretions.", layer: 1 },
      { label: "Mucus viscosity", role: "subsystem", confidence: 0.88, definition: "Elevated mucus viscoelasticity obstructs airways, pancreatic ducts, and intestine.", layer: 1 },
      { label: "FEV1 decline", role: "peer", confidence: 0.84, definition: "Forced expiratory volume in 1 s — primary clinical endpoint tracking lung function progression.", layer: 2 },
      { label: "CFTR modulator therapy", role: "subsystem", confidence: 0.89, definition: "Small-molecule correctors (elexacaftor) and potentiators (ivacaftor) restore CFTR folding and gating.", layer: 2 },
      { label: "Neutrophilic airway inflammation", role: "subsystem", confidence: 0.79, definition: "Self-amplifying IL-8 / neutrophil loop drives bronchiectasis and irreversible lung damage.", layer: 3 },
    ],
    edges: [
      { source: "F508del mutation", target: "CFTR", relation: "disrupts", confidence: 0.94 },
      { source: "CFTR", target: "Chloride ion transport", relation: "mediates", confidence: 0.95 },
      { source: "Chloride ion transport", target: "Mucus viscosity", relation: "regulates", confidence: 0.87 },
      { source: "Mucus viscosity", target: "FEV1 decline", relation: "drives", confidence: 0.82 },
      { source: "CFTR modulator therapy", target: "CFTR", relation: "restores", confidence: 0.9 },
      { source: "Neutrophilic airway inflammation", target: "FEV1 decline", relation: "accelerates", confidence: 0.76 },
    ],
    routes: [
      { id: "A", strategy: "Elexacaftor / tezacaftor / ivacaftor (Trikafta)", successProbability: 0.88, timeMonths: 3, costTier: 4, risk: "low", evidenceStrength: 0.94 },
      { id: "B", strategy: "Airway clearance + inhaled antibiotics (tobramycin)", successProbability: 0.65, timeMonths: 6, costTier: 2, risk: "low", evidenceStrength: 0.82 },
      { id: "C", strategy: "Lumacaftor / ivacaftor (Orkambi) — older modulator", successProbability: 0.51, timeMonths: 6, costTier: 3, risk: "med", evidenceStrength: 0.71 },
      { id: "D", strategy: "mRNA therapy targeting F508del correction", successProbability: 0.38, timeMonths: 36, costTier: 4, risk: "med", evidenceStrength: 0.42 },
      { id: "E", strategy: "Anti-inflammatory (azithromycin) + mucolytics", successProbability: 0.44, timeMonths: 12, costTier: 1, risk: "low", evidenceStrength: 0.68 },
    ],
  },
  "epilepsy": {
    subject: "Epilepsy",
    objects: [
      { label: "SCN1A", role: "goal", confidence: 0.93, definition: "Sodium channel Nav1.1 — loss-of-function variants underlie Dravet syndrome and late-teen-onset epilepsies.", layer: 0 },
      { label: "GABAergic inhibition", role: "subsystem", confidence: 0.91, definition: "Inhibitory interneuron networks whose failure lowers seizure threshold across cortex and hippocampus.", layer: 0 },
      { label: "Seizure threshold", role: "subsystem", confidence: 0.88, definition: "Net excitatory/inhibitory balance determining when hypersynchronous discharge propagates.", layer: 1 },
      { label: "HCN1 channel", role: "peer", confidence: 0.82, definition: "Hyperpolarization-activated channel; loss-of-function mutations linked to late-teen-onset generalized epilepsy.", layer: 1 },
      { label: "Temporal lobe focus", role: "subsystem", confidence: 0.79, definition: "Hippocampal and parahippocampal seizure onset zone most common in adolescent-onset focal epilepsy.", layer: 2 },
      { label: "mTOR pathway", role: "subsystem", confidence: 0.76, definition: "Hyperactivation drives cortical dysplasia and focal cortical epilepsy (TSC, FCDII).", layer: 2 },
      { label: "KCNQ2 / KCNQ3", role: "peer", confidence: 0.73, definition: "M-current potassium channels; gain-of-function variants reduce neuronal excitability; loss-of-function → neonatal/juvenile epilepsy.", layer: 3 },
    ],
    edges: [
      { source: "SCN1A", target: "GABAergic inhibition", relation: "sustains", confidence: 0.91 },
      { source: "GABAergic inhibition", target: "Seizure threshold", relation: "elevates", confidence: 0.89 },
      { source: "HCN1 channel", target: "Seizure threshold", relation: "modulates", confidence: 0.79 },
      { source: "Temporal lobe focus", target: "Seizure threshold", relation: "lowers", confidence: 0.77 },
      { source: "mTOR pathway", target: "Temporal lobe focus", relation: "promotes", confidence: 0.74 },
      { source: "KCNQ2 / KCNQ3", target: "Seizure threshold", relation: "regulates", confidence: 0.72 },
    ],
    routes: [
      { id: "A", strategy: "Sodium valproate / valproic acid (broad-spectrum AED)", successProbability: 0.72, timeMonths: 3, costTier: 1, risk: "med", evidenceStrength: 0.85 },
      { id: "B", strategy: "Levetiracetam (SV2A modulator — good late-teen tolerability)", successProbability: 0.68, timeMonths: 3, costTier: 1, risk: "low", evidenceStrength: 0.81 },
      { id: "C", strategy: "mTOR inhibitor (everolimus) for TSC / FCD-II focal epilepsy", successProbability: 0.55, timeMonths: 6, costTier: 3, risk: "med", evidenceStrength: 0.72 },
      { id: "D", strategy: "Responsive neurostimulation (RNS) / vagal nerve stimulation", successProbability: 0.48, timeMonths: 12, costTier: 4, risk: "med", evidenceStrength: 0.63 },
      { id: "E", strategy: "Resective surgery (temporal lobectomy) for refractory focal", successProbability: 0.64, timeMonths: 18, costTier: 4, risk: "high", evidenceStrength: 0.77 },
    ],
  },
  "huntington-s-disease": {
    subject: "Huntington's Disease",
    objects: [
      { label: "HTT CAG repeat expansion", role: "goal", confidence: 0.97, definition: "CAG repeats > 36 in exon 1 of HTT produce toxic polyglutamine huntingtin; repeat length inversely predicts onset age.", layer: 0 },
      { label: "Mutant huntingtin (mHTT)", role: "subsystem", confidence: 0.95, definition: "Misfolded protein aggregates in striatal and cortical neurons; disrupts transcription, axonal transport, and proteostasis.", layer: 0 },
      { label: "Striatal neurodegeneration", role: "subsystem", confidence: 0.93, definition: "Progressive loss of medium spiny neurons in caudate/putamen drives chorea and bradykinesia.", layer: 1 },
      { label: "BDNF trophic support", role: "peer", confidence: 0.86, definition: "Cortical BDNF supply to striatum is reduced by mHTT; loss of trophic support accelerates MSN death.", layer: 1 },
      { label: "mTOR / autophagy", role: "subsystem", confidence: 0.82, definition: "Autophagy clearance of mHTT aggregates is impaired; mTOR inhibition (rapamycin) enhances clearance in models.", layer: 2 },
      { label: "Cortical glutamate excitotoxicity", role: "subsystem", confidence: 0.79, definition: "Corticostriatal glutamate overflow drives NMDAR-mediated excitotoxic death of striatal neurons.", layer: 2 },
      { label: "PGC-1α / mitochondrial dysfunction", role: "peer", confidence: 0.75, definition: "mHTT impairs PGC-1α transcription; mitochondrial biogenesis deficit drives early energetic failure in MSNs.", layer: 3 },
    ],
    edges: [
      { source: "HTT CAG repeat expansion", target: "Mutant huntingtin (mHTT)", relation: "produces", confidence: 0.97 },
      { source: "Mutant huntingtin (mHTT)", target: "Striatal neurodegeneration", relation: "drives", confidence: 0.92 },
      { source: "Mutant huntingtin (mHTT)", target: "BDNF trophic support", relation: "reduces", confidence: 0.84 },
      { source: "BDNF trophic support", target: "Striatal neurodegeneration", relation: "counteracts", confidence: 0.82 },
      { source: "mTOR / autophagy", target: "Mutant huntingtin (mHTT)", relation: "clears", confidence: 0.78 },
      { source: "Cortical glutamate excitotoxicity", target: "Striatal neurodegeneration", relation: "accelerates", confidence: 0.77 },
      { source: "PGC-1α / mitochondrial dysfunction", target: "Striatal neurodegeneration", relation: "worsens", confidence: 0.73 },
    ],
    routes: [
      { id: "A", strategy: "HTT-lowering ASO / siRNA (tominersen class)", successProbability: 0.61, timeMonths: 24, costTier: 4, risk: "med", evidenceStrength: 0.72 },
      { id: "B", strategy: "Deutetrabenazine / tetrabenazine (chorea suppression)", successProbability: 0.78, timeMonths: 2, costTier: 2, risk: "low", evidenceStrength: 0.88 },
      { id: "C", strategy: "BDNF gene therapy (intrastriatal AAV-BDNF)", successProbability: 0.42, timeMonths: 36, costTier: 4, risk: "high", evidenceStrength: 0.48 },
      { id: "D", strategy: "mTOR inhibition (rapamycin) — autophagy induction", successProbability: 0.38, timeMonths: 18, costTier: 3, risk: "med", evidenceStrength: 0.52 },
      { id: "E", strategy: "Multidisciplinary care (PT/OT/speech + riluzole neuroprotection)", successProbability: 0.55, timeMonths: 6, costTier: 2, risk: "low", evidenceStrength: 0.71 },
    ],
  },
  "cancer": {
    subject: "Cancer",
    objects: [
      { label: "TP53 tumor suppressor", role: "goal", confidence: 0.94, definition: "Guardian of the genome; TP53 loss abrogates apoptosis, DNA repair checkpoints, and is found in >50% of human cancers.", layer: 0 },
      { label: "KRAS oncogene", role: "subsystem", confidence: 0.92, definition: "Constitutively active RAS → RAF/MEK/ERK and PI3K/AKT proliferation; KRAS G12C is the most common actionable mutation.", layer: 0 },
      { label: "Tumor mutation burden (TMB)", role: "subsystem", confidence: 0.89, definition: "High TMB predicts immunotherapy response (anti-PD-1/PD-L1) across tumour types.", layer: 1 },
      { label: "PD-L1 / immune checkpoint", role: "subsystem", confidence: 0.91, definition: "Tumour PD-L1 expression shields cancer cells from T-cell cytotoxicity; anti-PD-1 blockade restores killing.", layer: 1 },
      { label: "EGFR signaling", role: "peer", confidence: 0.86, definition: "EGFR amplification / mutation drives uncontrolled proliferation in NSCLC, colorectal, and breast cancers.", layer: 2 },
      { label: "Angiogenesis (VEGF)", role: "subsystem", confidence: 0.82, definition: "Tumour-secreted VEGF recruits new vasculature; anti-VEGF (bevacizumab) starves tumour growth.", layer: 2 },
      { label: "DNA mismatch repair (MMR)", role: "peer", confidence: 0.79, definition: "MMR-deficiency (dMMR / MSI-H) generates high neo-antigen load and strong immunotherapy sensitivity.", layer: 3 },
    ],
    edges: [
      { source: "TP53 tumor suppressor", target: "KRAS oncogene", relation: "counteracts", confidence: 0.88 },
      { source: "KRAS oncogene", target: "PD-L1 / immune checkpoint", relation: "upregulates", confidence: 0.82 },
      { source: "Tumor mutation burden (TMB)", target: "PD-L1 / immune checkpoint", relation: "correlates_with", confidence: 0.85 },
      { source: "EGFR signaling", target: "KRAS oncogene", relation: "activates", confidence: 0.80 },
      { source: "Angiogenesis (VEGF)", target: "EGFR signaling", relation: "co-amplifies", confidence: 0.72 },
      { source: "DNA mismatch repair (MMR)", target: "Tumor mutation burden (TMB)", relation: "determines", confidence: 0.91 },
    ],
    routes: [
      { id: "A", strategy: "Anti-PD-1 immunotherapy (pembrolizumab / nivolumab)", successProbability: 0.58, timeMonths: 6, costTier: 4, risk: "med", evidenceStrength: 0.87 },
      { id: "B", strategy: "KRAS G12C inhibitor (sotorasib / adagrasib)", successProbability: 0.52, timeMonths: 4, costTier: 4, risk: "med", evidenceStrength: 0.79 },
      { id: "C", strategy: "EGFR-targeted therapy (erlotinib / osimertinib)", successProbability: 0.64, timeMonths: 6, costTier: 3, risk: "low", evidenceStrength: 0.85 },
      { id: "D", strategy: "Anti-VEGF (bevacizumab) + chemotherapy backbone", successProbability: 0.49, timeMonths: 9, costTier: 3, risk: "med", evidenceStrength: 0.76 },
      { id: "E", strategy: "CAR-T cell therapy (haematologic malignancies)", successProbability: 0.67, timeMonths: 3, costTier: 4, risk: "high", evidenceStrength: 0.81 },
    ],
  },
  "rbc-mpn-pv": {
    subject: "RBC / MPN / PV",
    objects: [
      { label: "JAK2 V617F", role: "subsystem", confidence: 0.94, definition: "Driver mutation in the JAK2 kinase; constitutive activation.", layer: 0 },
      { label: "Erythrocytosis", role: "goal", confidence: 0.9, definition: "Elevated red cell mass, the PV phenotype.", layer: 1 },
      { label: "STAT5 signaling", role: "subsystem", confidence: 0.82, definition: "Downstream transcriptional effector of JAK2.", layer: 2 },
      { label: "EPO receptor", role: "peer", confidence: 0.78, definition: "Cytokine receptor scaffolding JAK2.", layer: 3 },
    ],
    edges: [
      { source: "JAK2 V617F", target: "STAT5 signaling", relation: "activates", confidence: 0.88 },
      { source: "STAT5 signaling", target: "Erythrocytosis", relation: "drives", confidence: 0.8 },
      { source: "EPO receptor", target: "JAK2 V617F", relation: "scaffolds", confidence: 0.7 },
    ],
    routes: [
      { id: "A", strategy: "JAK2 inhibition (ruxolitinib)", successProbability: 0.72, timeMonths: 12, costTier: 2, risk: "med", evidenceStrength: 0.8 },
      { id: "B", strategy: "Therapeutic phlebotomy + low-dose aspirin", successProbability: 0.64, timeMonths: 6, costTier: 1, risk: "low", evidenceStrength: 0.7 },
      { id: "C", strategy: "Interferon-α (cytoreduction)", successProbability: 0.58, timeMonths: 18, costTier: 3, risk: "med", evidenceStrength: 0.6 },
      { id: "D", strategy: "Allele-burden-guided combination", successProbability: 0.41, timeMonths: 24, costTier: 4, risk: "high", evidenceStrength: 0.4 },
      { id: "E", strategy: "Watchful waiting (low-risk stratum)", successProbability: 0.5, timeMonths: 36, costTier: 1, risk: "low", evidenceStrength: 0.5 },
    ],
  },
};

function subjectKey(subject: string | undefined): string {
  if (!subject) return "rbc-mpn-pv";
  return subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function fallbackSeed(subject: string): Seed {
  return {
    subject,
    objects: [
      { label: subject, role: "goal", confidence: 0.6, definition: `Studied subject: ${subject}.`, layer: 0 },
      { label: "Candidate mechanism", role: "subsystem", confidence: 0.45, definition: "Placeholder mechanism node pending SSKM seed.", layer: 1 },
    ],
    edges: [{ source: "Candidate mechanism", target: subject, relation: "influences", confidence: 0.4 }],
  };
}

function deriveRoutes(objects: QMObject[]): QMRoute[] {
  return objects
    .filter((o) => o.role !== "goal")
    .slice(0, 4)
    .map((o, i) => ({
      id: String.fromCharCode(65 + i),
      strategy: `Target ${o.label}`,
      successProbability: Math.round(o.confidence * 100) / 100,
      timeMonths: 6 + i * 6,
      costTier: ((i % 4) + 1) as 1 | 2 | 3 | 4,
      risk: (o.confidence > 0.7 ? "low" : o.confidence > 0.5 ? "med" : "high") as QMRoute["risk"],
      evidenceStrength: Math.round(o.confidence * 100) / 100,
    }));
}

// ─── Provenance stamping (honest — never fabricate a chain) ──────────────────
function stampEdge(e: RawEdge, avail: ProvenanceAvailability): QMEdge {
  const status: RelationshipStatus = "candidate";
  const edgeKind: EdgeKind = "influence";
  const provenance: ProvenanceEntry[] =
    avail === "available"
      ? [
          {
            id: `prov-${e.source}-${e.target}`,
            sourceType: "reduction",
            createdAt: new Date().toISOString(),
            createdBy: "ars-engine",
            confidence: e.confidence,
            sourceRefs: ["ars-engine:sskm"],
            note: "SSKM reduction edge; full chain via /api/graph/provenance",
          },
        ]
      : []; // provenance dark → no fabricated entries
  return { source: e.source, target: e.target, relation: e.relation, edgeKind, status, confidence: e.confidence, provenance };
}

async function gatherRaw(subject: string, key: string): Promise<RawSnapshot> {
  if (ENGINE_SUBJECTS.has(key)) {
    const snap = await fetchEngineSnapshot(subject);
    if (snap) {
      return {
        subject: snap.subject,
        confidence: snap.confidence,
        objects: snap.objects,
        edges: snap.edges.map((e) => ({ source: e.source, target: e.target, relation: e.relation, confidence: e.confidence })),
        routes: snap.routes,
        provenanceAvailable: snap.provenanceAvailable,
        source: "gateway",
      };
    }
  }
  const seed = SEEDS[key] ?? fallbackSeed(subject);
  return {
    subject: seed.subject,
    confidence: seed.objects.length ? Math.max(...seed.objects.map((o) => o.confidence)) : 0,
    objects: seed.objects,
    edges: seed.edges,
    routes: seed.routes ?? deriveRoutes(seed.objects),
    provenanceAvailable: false,
    source: "mock",
  };
}

/** Resolve a research query into a Level-bounded, provenance-honest response. */
export async function resolveQuery(req: QueryManagerRequest): Promise<QueryManagerResponse> {
  // 1. Parse
  const level: Level = req.level ?? DEFAULT_ANON_LEVEL;
  const plan = planForLevel(level);
  const subject = req.subject ?? "RBC / MPN / PV";
  const requested = req.requested ?? ["objects", "prism9", "provenance"];
  const key = subjectKey(subject);
  const planNotes: string[] = [`level=${level} layer≤${plan.layerMax}`];

  // 2/3/4. Plan + route + execute (engine, else mock)
  const raw = await gatherRaw(subject, key);
  planNotes.push(raw.source === "gateway" ? "live ARS engine" : "engine unreachable/unseeded → mock");

  // 5. Assemble — Level layer bound + plan cost ceiling.
  const objects: QMObject[] = raw.objects
    .filter((o) => o.layer <= plan.layerMax)
    .slice(0, plan.maxObjects);
  const keepLabels = new Set(objects.map((o) => o.label));

  // 6. Provenance-stamp (honest flag).
  const availability: ProvenanceAvailability = raw.provenanceAvailable ? "available" : "unavailable";
  if (availability === "unavailable") planNotes.push("provenance graph down → provenance:unavailable");

  const edges: QMEdge[] = raw.edges
    .filter((e) => keepLabels.has(e.source) && keepLabels.has(e.target))
    .slice(0, plan.maxEdges)
    .map((e) => stampEdge(e, availability));

  // 7. Return
  const response: QueryManagerResponse = {
    subject: raw.subject,
    confidence: raw.confidence,
    level,
    layerBound: plan.layerMax,
    objects,
    edges,
    provenance: availability,
    planNotes,
    source: raw.source,
  };
  if (requested.includes("lope") && plan.includeLope) response.lope = [];
  if (requested.includes("prism9")) response.prism9Graph = { nodes: objects.length, edges: edges.length };
  response.routes = level === "beginner" ? raw.routes.slice(0, 3) : raw.routes;

  return response;
}
