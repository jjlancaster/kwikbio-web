// kwiKBio v4 — shared TypeScript types

export interface RDFQuad {
  subject: string;
  predicate: string;
  object: string;
  graphName?: string;
  metadata?: QuadMetadata;
}

export interface QuadMetadata {
  confidence?: number;
  source_type?: 'paper' | 'experiment' | 'llm_inference' | 'user' | 'ars';
  source_id?: string;
  user_id?: string;
  evidence?: string[];
}

export interface KTuple {
  subject: string;
  relation: string;
  object: string;
  confidence: number;
}

export interface CausalNode {
  id: string;
  label: string;
  type: 'gene' | 'protein' | 'pathway' | 'compound' | 'phenotype' | 'concept';
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface CausalEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
  confidence: number;
}

export interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}

export interface PathwayModel {
  nodes: CausalNode[];
  edges: CausalEdge[];
  params: Record<string, number>;
}

export interface SimulationTrajectory {
  timepoints: number[];
  states: Record<string, number[]>;
}

export interface SlamResult {
  sessionId: string;
  kTuples: KTuple[];
  causalGraph: CausalGraph;
  pathwayModel: PathwayModel;
  simulation: {
    trajectory: SimulationTrajectory;
    steadyState: Record<string, number>;
    converged: boolean;
  };
  confidence: number;
}

export interface Hypothesis {
  id: string;
  queryText: string;
  domain: string;
  title: string;
  statement: string;
  confidence: number;
  voiScore: number;
  relevance: number;
  evidenceCount: number;
  sources: string[];
  status: 'generated' | 'ranked' | 'selected' | 'testing' | 'complete';
  arsResponse?: ARSQueryResponse;
}

export interface ARSQueryResponse {
  confidence: number;
  deep_job_id?: string;
  subject?: string;
  objects?: Array<{
    label: string;
    role: 'subsystem' | 'goal' | 'peer';
    confidence: number;
    definition: string;
  }>;
  prism9_graph?: Record<string, unknown>;
}

export interface LOPEExperiment {
  id: string;
  templateId: string;
  name: string;
  description: string;
  domain: string;
  nodeTypes: string[];
  edgeTypes: string[];
  requiredServices: string[];
  estimatedCostUsd: number;
  estimatedDays: number;
  complexity: 'low' | 'medium' | 'high';
  expectedConfidenceGain: number;
  informationType: 'causal' | 'associative' | 'mechanistic' | 'screening';
  voiWeight: number;
}

export interface RankedExperiment extends LOPEExperiment {
  voiScore: number;
  matchScore: number;
  rankReason: string[];
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  vendorType: 'cro' | 'medical' | 'biomedical' | 'storage' | 'simulation';
  description: string;
  logoUrl?: string;
  website?: string;
  geography?: string;
  onlineCapable: boolean;
  specializations: string[];
  serviceTags: string[];
  certifications: string[];
  turnaroundDays?: number;
  minOrderUsd?: number;
  trustScore: number;
  reviewCount: number;
  isVerified: boolean;
  kbkgNodeId?: string;
  contactEmail?: string;
}

export interface VendorMatch {
  vendor: Vendor;
  matchScore: number;
  matchReasons: string[];
  rank: number;
}

export interface DAEResult {
  sessionId: string;
  extractedTriples: KTuple[];
  confidenceSummary: { green: number; yellow: number; red: number; mean: number };
  anomalies: string[];
  voiDelta: number;
  sskmUpdate: { newNodes: string[]; updatedEdges: string[]; confidenceDelta: number };
}

export interface VOIInput {
  hypothesis: { confidence: number; relevance: number };
  experiment: { estimatedCostUsd: number; expectedConfidenceGain: number; voiWeight: number };
  currentSSKMState: { voi: number; confidence: number; knownNodes: number };
}

export interface VOIResult {
  voiScore: number;
  informationGain: number;
  netValue: number;
  recommendation: 'run' | 'defer' | 'skip';
  reasoning: string;
}
