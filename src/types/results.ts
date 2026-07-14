import type { TimelineAnswerResult } from './timeline';
import type { MistakeRecord } from './mistake';

export interface ResultsLocationState {
  result: TimelineAnswerResult;
  caseId: string;
  completionTimeMs: number;
  hintsUsed: number;
  hintBudget: number;
  mistakes: MistakeRecord[];
}
