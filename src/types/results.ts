import type { EvidenceSelectionResult } from './evidenceSelection';
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
}