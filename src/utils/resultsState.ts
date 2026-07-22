import { isRecord } from './guards';
import type { ResultsLocationState } from '../types/results';

function isSelectionResult(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.accuracy === 'number' &&
    typeof value.truePositiveCount === 'number' &&
    typeof value.falsePositiveCount === 'number' &&
    typeof value.falseNegativeCount === 'number' &&
    typeof value.trueNegativeCount === 'number' &&
    typeof value.totalRelevant === 'number' &&
    typeof value.totalIrrelevant === 'number' &&
    typeof value.totalEvaluated === 'number' &&
    Array.isArray(value.correctlySelectedEvents) &&
    Array.isArray(value.falsePositiveEvents) &&
    Array.isArray(value.falseNegativeEvents) &&
    typeof value.summary === 'string'
  );
}

export function isResultsLocationState(
  state: unknown,
): state is ResultsLocationState {
  if (!isRecord(state)) {
    return false;
  }

  const result = state.result;
  return (
    typeof state.caseId === 'string' &&
    typeof state.completionTimeMs === 'number' &&
    typeof state.hintsUsed === 'number' &&
    typeof state.hintBudget === 'number' &&
    typeof state.completedAt === 'string' &&
    isRecord(result) &&
    typeof result.score === 'number' &&
    isSelectionResult(state.selection)
  );
}