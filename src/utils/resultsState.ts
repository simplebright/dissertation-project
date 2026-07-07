import { isRecord } from '../utils/guards';
import type { ResultsLocationState } from '../types/results';

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
    isRecord(result) &&
    typeof result.score === 'number'
  );
}
