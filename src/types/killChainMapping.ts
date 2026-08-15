import type { KillChainStage } from './case';

export interface KillChainMappingFeedback {
  eventId: string;
  placedStage: KillChainStage | null;
  expectedStage: KillChainStage;
  isCorrect: boolean;
  isMapped: boolean;
  headline: string;
  explanation: string;
}

export interface KillChainAnswerResult {
  /** Percentage (0..100) of correctly mapped events out of the events that have an expected stage. */
  accuracy: number;
  /** Number of events correctly assigned to their expected stage. */
  correctCount: number;
  /** Number of events assigned to the wrong stage (or never mapped at all). */
  incorrectCount: number;
  /** Total number of events considered (i.e. events that have an expected stage). */
  totalCount: number;
  /** True only when every mappable event has been placed into a stage. */
  isComplete: boolean;
  /** Per-event feedback. One entry per event with an expected stage. */
  feedback: KillChainMappingFeedback[];
  /** Human-readable summary line. */
  summary: string;
}
