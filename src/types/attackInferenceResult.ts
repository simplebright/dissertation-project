import type { AttackType } from './case';

export interface AttackInferenceResult {
  /** The attack type the learner selected on the inferrence page. */
  selectedAttackType: AttackType | null;
  /** The attack type defined as the ground truth for the case. */
  expectedAttackType: AttackType;
  /** True when the learner chose the attack type that matches the case ground truth. */
  isCorrect: boolean;
  /** Short headline summarising the outcome (e.g. "Correct", "Incorrect"). */
  headline: string;
  /** Educational explanation describing why the evidence sequence supports the expected attack type. */
  explanation: string;
  /** Suggested reasoning — a forensic checklist the learner can apply on future cases. */
  suggestedReasoning: string;
  /** The ordered forensic events that drove the explanation. */
  evidenceSequence: readonly AttackInferenceEvidenceStep[];
  /** Whether the learner provided any answer at all. */
  isAnswered: boolean;
}

export interface AttackInferenceEvidenceStep {
  /** Order of this event in the relevant event sequence (1-based). */
  order: number;
  /** Event ID for cross-reference with other stages of the case. */
  eventId: string;
  /** The kill chain stage this event was assigned to, if any. */
  stage: string | null;
  /** The event description (the text of the browser artefact). */
  description: string;
  /** The event's own forensic explanation if defined in the case. */
  explanation: string;
}
