// Experiment Director — ranks LOPE experiments against a hypothesis via VOI
import type { Hypothesis, LOPEExperiment, RankedExperiment } from './types';
import { calculateVOI } from './voi';

const SSKM_STATE = { voi: 3.490497, confidence: 0.885, knownNodes: 25 };

export function rankExperimentsForHypothesis(
  hypothesis: Hypothesis,
  experiments: LOPEExperiment[],
): RankedExperiment[] {
  return experiments
    .map(exp => {
      const voi = calculateVOI({
        hypothesis: { confidence: hypothesis.confidence, relevance: hypothesis.relevance },
        experiment: {
          estimatedCostUsd:       exp.estimatedCostUsd,
          expectedConfidenceGain: exp.expectedConfidenceGain,
          voiWeight:              exp.voiWeight,
        },
        currentSSKMState: SSKM_STATE,
      });

      const domainBonus = hypothesis.domain === exp.domain ? 0.15 : 0;
      const matchScore  = Math.min(voi.voiScore + domainBonus, 1.0);

      const reasons: string[] = [voi.reasoning];
      if (domainBonus > 0) reasons.push(`domain match: ${exp.domain}`);
      if (exp.complexity === 'low') reasons.push('low complexity');
      if (exp.estimatedCostUsd < 5_000) reasons.push('low cost');

      return { ...exp, voiScore: voi.voiScore, matchScore, rankReason: reasons };
    })
    .sort((a, b) => b.voiScore - a.voiScore);
}

export function selectTopExperiment(ranked: RankedExperiment[]): RankedExperiment | null {
  return ranked.find(e => e.voiScore > 0.05) ?? null;
}
