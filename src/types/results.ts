import type { TimelineAnswerResult } from './timeline';

export interface ResultsLocationState {
  result: TimelineAnswerResult;
  caseId: string;
  completionTimeMs: number;
}
