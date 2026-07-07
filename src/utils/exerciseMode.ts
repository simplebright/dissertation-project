import type { ExerciseLocationState, ExerciseMode } from '../types/exercise';
import { isRecord } from './guards';

const EXERCISE_MODES: ExerciseMode[] = ['beginner', 'advanced'];

export function isExerciseMode(value: unknown): value is ExerciseMode {
  return typeof value === 'string' && EXERCISE_MODES.includes(value as ExerciseMode);
}

export function isExerciseLocationState(
  state: unknown,
): state is ExerciseLocationState {
  return isRecord(state) && isExerciseMode(state.mode);
}
