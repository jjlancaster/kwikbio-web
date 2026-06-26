import type { VOIInput, VOIResult } from './types';

// Live SSKM state (Hydro verification 2026-06-24)
const SSKM_VOI        = 3.490497;
const CONGRUENCE_THR  = 0.85;
const MAX_COST_USD    = 50_000;

export function calculateVOI(input: VOIInput): VOIResult {
  const { hypothesis, experiment } = input;

  // Expected information gain
  const confidenceGap    = Math.max(0, 1 - hypothesis.confidence);
  const informationGain  = experiment.expectedConfidenceGain * confidenceGap * Math.max(0, hypothesis.relevance);

  // Normalised cost penalty (0–1)
  const costPenalty = Math.min(experiment.estimatedCostUsd / MAX_COST_USD, 1.0) * 0.3;

  const voiScore = Math.max(0, (informationGain * experiment.voiWeight) - costPenalty);
  const netValue = voiScore * SSKM_VOI;

  let recommendation: VOIResult['recommendation'];
  let reasoning: string;

  if (hypothesis.confidence >= CONGRUENCE_THR) {
    recommendation = 'defer';
    reasoning = `Confidence ${(hypothesis.confidence * 100).toFixed(0)}% already exceeds congruence threshold ${CONGRUENCE_THR * 100}%.`;
  } else if (voiScore < 0.05) {
    recommendation = 'skip';
    reasoning = `VOI ${voiScore.toFixed(3)} too low — expected gain (${(informationGain * 100).toFixed(0)}%) doesn't justify cost.`;
  } else {
    recommendation = 'run';
    reasoning = `VOI ${voiScore.toFixed(3)} — expected +${(informationGain * 100).toFixed(0)}% confidence at $${experiment.estimatedCostUsd.toLocaleString()}.`;
  }

  return { voiScore, informationGain, netValue, recommendation, reasoning };
}

export function rankByVOI<T extends { voiScore: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.voiScore - a.voiScore);
}
