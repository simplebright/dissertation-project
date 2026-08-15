import type { AttackInferenceResult } from './attackInferenceResult';
import type { EvidenceSelectionResult } from './evidenceSelection';
import type { KillChainAnswerResult } from './killChainMapping';
import type { MistakeRecord } from './mistake';
import type { TimelineAnswerResult } from './timeline';

export interface ResultsLocationState {
  /**
   * Stage 2 — chronological ordering of the user's selected evidence.
   * Computed by `checkTimelineAnswer` against the selected subset.
   */
  result: TimelineAnswerResult;
  /**
   * Stage 1 — relevance classification of every case event against the
   * `isRelevant` ground truth. Computed by `evaluateEvidenceSelection`.
   * Kept separate from `result` so the two stages are never combined into
   * one weighted score.
   */
  selection: EvidenceSelectionResult;
  caseId: string;
  completionTimeMs: number;
  hintsUsed: number;
  hintBudget: number;
  mistakes: MistakeRecord[];
  completedAt: string;
  /**
   * Stage 3 — Cyber Kill Chain mapping accuracy and per-event feedback.
   * Optional so older flows that stop after Stage 2 still validate.
   */
  killChainResult?: KillChainAnswerResult;
  /**
   * Stage 4 — Attack Inference outcome with educational explanation.
   * Optional so older flows that stop after Stage 3 still validate.
   */
  attackInferenceResult?: AttackInferenceResult;
}