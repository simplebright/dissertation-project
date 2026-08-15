import type { ForensicEvent, KillChainStage } from '../types/case';
import type {
  KillChainAnswerResult,
  KillChainMappingFeedback,
} from '../types/killChainMapping';

export type KillChainMappingByStage = Record<string, readonly string[]>;

/**
 * Build the user's stage assignment for one event by scanning the
 * stage→eventIds mapping. Returns `null` if the event was never placed
 * into any stage.
 */
function findPlacedStage(
  mapping: KillChainMappingByStage,
  eventId: string,
): KillChainStage | null {
  for (const [stage, ids] of Object.entries(mapping)) {
    if (ids.includes(eventId)) {
      return stage as KillChainStage;
    }
  }
  return null;
}

function generateSummary(
  accuracy: number,
  correctCount: number,
  incorrectCount: number,
  totalCount: number,
  isComplete: boolean,
): string {
  if (!isComplete) {
    return `Mapping incomplete. ${totalCount - (correctCount + incorrectCount)} of ${totalCount} event(s) are still in the evidence pool. Drag every mappable event into a Kill Chain stage before submitting.`;
  }

  if (accuracy === 100) {
    return 'Perfect mapping — every mappable event was placed in its expected Cyber Kill Chain stage. Compare your reasoning to each explanation to reinforce why each step belongs where it does.';
  }

  if (accuracy === 0) {
    return 'None of the mappable events were placed in their expected Kill Chain stage. Read each explanation below to learn how to classify browser artefacts as reconnaissance, delivery, exploitation, installation, or actions.';
  }

  return `Kill Chain Accuracy: ${accuracy}% — you placed ${correctCount} of ${totalCount} events in the correct stage. Read the explanations for incorrect mappings to refine your triage instincts.`;
}

function buildMappingFeedback(
  event: ForensicEvent,
  expectedStage: KillChainStage,
  placedStage: KillChainStage | null,
): KillChainMappingFeedback {
  if (placedStage === null) {
    return {
      eventId: event.id,
      placedStage: null,
      expectedStage,
      isCorrect: false,
      isMapped: false,
      headline: `"${event.description}" was not placed in any Kill Chain stage.`,
      explanation: `Expected stage: ${expectedStage}. ${event.explanation ?? ''}`.trim(),
    };
  }

  const isCorrect = placedStage === expectedStage;

  if (isCorrect) {
    return {
      eventId: event.id,
      placedStage,
      expectedStage,
      isCorrect: true,
      isMapped: true,
      headline: `"${event.description}" is correctly mapped to ${expectedStage}.`,
      explanation: `You correctly placed "${event.description}" in the ${expectedStage} stage. ${event.explanation ?? ''}`.trim(),
    };
  }

  return {
    eventId: event.id,
    placedStage,
    expectedStage,
    isCorrect: false,
    isMapped: true,
    headline: `"${event.description}" was placed in ${placedStage}, but belongs in ${expectedStage}.`,
    explanation: `Your choice: ${placedStage}. Expected stage: ${expectedStage}. ${event.explanation ?? ''}`.trim(),
  };
}

/**
 * Grade the learner's Cyber Kill Chain mapping.
 *
 * - `events` is the universe of forensic events the learner had to consider
 *   (passed in by the page). Only events that declare an expected
 *   `killChainStage` participate in scoring — distractor evidence and any
 *   event without an expected stage are excluded.
 * - `mapping` is the learner's stage→eventIds layout at submission time
 *   (e.g. `{ Reconnaissance: [...ids], Delivery: [...ids], ... }`).
 *
 * The result is independent of Timeline Ordering — this function never
 * inspects correctOrder or any temporal property.
 */
export function checkKillChainAnswer(
  events: readonly ForensicEvent[],
  mapping: KillChainMappingByStage,
): KillChainAnswerResult {
  const mappableEvents = events.filter(
    (event): event is ForensicEvent & { killChainStage: KillChainStage } =>
      event.killChainStage !== undefined,
  );

  const totalCount = mappableEvents.length;

  const feedback: KillChainMappingFeedback[] = mappableEvents.map((event) =>
    buildMappingFeedback(
      event,
      event.killChainStage,
      findPlacedStage(mapping, event.id),
    ),
  );

  const correctCount = feedback.filter((item) => item.isCorrect).length;
  const incorrectCount = feedback.filter((item) => !item.isCorrect).length;
  const mappedCount = feedback.filter((item) => item.isMapped).length;
  const isComplete = totalCount === 0 || mappedCount === totalCount;

  const accuracy =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    accuracy,
    correctCount,
    incorrectCount,
    totalCount,
    isComplete,
    feedback,
    summary: generateSummary(
      accuracy,
      correctCount,
      incorrectCount,
      totalCount,
      isComplete,
    ),
  };
}
