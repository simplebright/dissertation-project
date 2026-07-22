import type { ForensicEvent } from './case';

export interface EvidenceSelectionResult {
  /** Percentage 0..100 of all events correctly classified as relevant or irrelevant. */
  accuracy: number;
  /** Number of events that were both selected by the user and flagged relevant in the case. */
  truePositiveCount: number;
  /** Number of events the user selected that the case marks as not relevant. */
  falsePositiveCount: number;
  /** Number of relevant events the user failed to select. */
  falseNegativeCount: number;
  /** Number of non-relevant events the user correctly excluded. */
  trueNegativeCount: number;
  /** Total relevant events in the case. */
  totalRelevant: number;
  /** Total non-relevant events in the case. */
  totalIrrelevant: number;
  /** Total events considered (relevant + irrelevant). */
  totalEvaluated: number;
  /** Events the user correctly identified as relevant. */
  correctlySelectedEvents: ForensicEvent[];
  /** Events the user wrongly selected (case marks them as not relevant). */
  falsePositiveEvents: ForensicEvent[];
  /** Relevant events the user missed. */
  falseNegativeEvents: ForensicEvent[];
  /** Human-readable summary line. */
  summary: string;
}