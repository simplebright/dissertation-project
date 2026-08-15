import type { AttackInferenceResult } from './attackInferenceResult';
import type { ExerciseLocationState } from './exercise';
import type { KillChainAnswerResult } from './killChainMapping';
import type { ResultsLocationState } from './results';

export interface KillChainLocationState extends ExerciseLocationState {
  /**
   * The full pre-computed results payload from Stage 1 + Stage 2 (Evidence
   * Selection + Timeline Reconstruction). Carried through this stage unchanged
   * so the existing Results page keeps working without re-evaluating scoring.
   */
  upstreamResults: ResultsLocationState;
  /**
   * Stage 3 — Cyber Kill Chain mapping result computed by
   * `checkKillChainAnswer` when the learner submits this stage. Optional
   * because the Kill Chain exercise only computes it on submission.
   */
  killChainResult?: KillChainAnswerResult;
  /**
   * Stage 4 — Attack Inference result, populated by the Attack Inference
   * page and forwarded through subsequent navigation. Optional because the
   * Kill Chain exercise doesn't know the answer yet.
   */
  attackInferenceResult?: AttackInferenceResult;
}
