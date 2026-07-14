import type { TimelineAnswerResult } from './timeline';

export interface ResultsLocationState {
  result: TimelineAnswerResult;
  caseId: string;
  completionTimeMs: number;
  hintsUsed: number;
  hintBudget: number;
}
