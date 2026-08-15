import { isRecord } from './guards';
import type { KillChainLocationState } from '../types/killChain';
import { isResultsLocationState } from './resultsState';
import { isExerciseLocationState } from './exerciseMode';

export function isKillChainLocationState(
  state: unknown,
): state is KillChainLocationState {
  return (
    isRecord(state) &&
    isExerciseLocationState(state) &&
    isRecord(state.upstreamResults) &&
    isResultsLocationState(state.upstreamResults)
  );
}
