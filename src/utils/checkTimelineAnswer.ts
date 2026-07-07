import type { ForensicEvent } from '../types/case';
import type { PositionFeedback, TimelineAnswerResult } from '../types/timeline';
import { buildEventsById } from './events';

export function getCorrectOrder(events: ForensicEvent[]): string[] {
  return [...events]
    .sort((a, b) => a.correctOrder - b.correctOrder)
    .map((event) => event.id);
}

function generateSummary(
  score: number,
  correctCount: number,
  totalCount: number,
  isComplete: boolean,
): string {
  if (!isComplete) {
    return `Timeline incomplete. Place all ${totalCount} events on the timeline before submitting. Review each artefact's timestamp and type to determine the correct sequence.`;
  }

  if (score === 100) {
    return 'Excellent work! Every event is in the correct chronological position. Review the explanations below to reinforce why each step follows logically from the last.';
  }

  if (score === 0) {
    return 'None of the events are in the correct position. Read each explanation below to understand how the browser activity unfolded in time.';
  }

  return `You placed ${correctCount} of ${totalCount} events correctly. Read the explanations for incorrect positions to understand what should have appeared at each step and why.`;
}

function buildMisplacementHeadline(
  actualEvent: ForensicEvent,
  expectedEvent: ForensicEvent,
  position: number,
): string {
  if (actualEvent.correctOrder > position) {
    return `Position ${position} is incorrect. You placed "${actualEvent.description}" too early — it belongs at step ${actualEvent.correctOrder}.`;
  }

  if (actualEvent.correctOrder < position) {
    return `Position ${position} is incorrect. You placed "${actualEvent.description}" too late — it belongs at step ${actualEvent.correctOrder}.`;
  }

  return `Position ${position} is incorrect. You placed "${actualEvent.description}" here, but "${expectedEvent.description}" was expected.`;
}

function buildIncorrectExplanation(
  actualEvent: ForensicEvent,
  expectedEvent: ForensicEvent,
  position: number,
): string {
  const expectedReason = `Step ${position} should be: ${expectedEvent.description}. ${expectedEvent.explanation}`;
  const placedReason = `Your choice: ${actualEvent.description}. ${actualEvent.explanation}`;

  if (actualEvent.correctOrder > position) {
    return `${placedReason} This event occurs later in the investigation timeline. ${expectedReason}`;
  }

  if (actualEvent.correctOrder < position) {
    return `${placedReason} This event occurs earlier in the investigation timeline. ${expectedReason}`;
  }

  return `${placedReason} ${expectedReason}`;
}

function buildPositionFeedback(
  position: number,
  actualEventId: string | undefined,
  expectedEvent: ForensicEvent,
  eventsById: Record<string, ForensicEvent>,
): PositionFeedback {
  if (actualEventId === undefined) {
    return {
      position,
      placedEventId: null,
      expectedEventId: expectedEvent.id,
      isCorrect: false,
      headline: `Position ${position} is empty.`,
      explanation: `This step should be "${expectedEvent.description}". ${expectedEvent.explanation}`,
    };
  }

  const actualEvent = eventsById[actualEventId];

  if (!actualEvent) {
    return {
      position,
      placedEventId: actualEventId,
      expectedEventId: expectedEvent.id,
      isCorrect: false,
      headline: `Position ${position} is incorrect.`,
      explanation: `An unknown event was placed here. ${expectedEvent.explanation}`,
    };
  }

  const isCorrect = actualEventId === expectedEvent.id;

  if (isCorrect) {
    return {
      position,
      placedEventId: actualEventId,
      expectedEventId: expectedEvent.id,
      isCorrect: true,
      headline: `Position ${position} is correct.`,
      explanation: `You correctly identified that "${expectedEvent.description}" belongs at step ${position}. ${expectedEvent.explanation}`,
    };
  }

  return {
    position,
    placedEventId: actualEventId,
    expectedEventId: expectedEvent.id,
    isCorrect: false,
    headline: buildMisplacementHeadline(actualEvent, expectedEvent, position),
    explanation: buildIncorrectExplanation(actualEvent, expectedEvent, position),
  };
}

export function checkTimelineAnswer(
  currentOrder: string[],
  events: ForensicEvent[],
): TimelineAnswerResult {
  const totalCount = events.length;
  const eventsById = buildEventsById(events);
  const correctOrder = getCorrectOrder(events);
  const isComplete = currentOrder.length === totalCount;

  const feedback = correctOrder.map((expectedEventId, index) =>
    buildPositionFeedback(
      index + 1,
      currentOrder[index],
      eventsById[expectedEventId],
      eventsById,
    ),
  );

  const correctCount = feedback.filter((item) => item.isCorrect).length;
  const incorrectCount = totalCount - correctCount;
  const score =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    score,
    correctCount,
    incorrectCount,
    totalCount,
    isComplete,
    feedback,
    summary: generateSummary(score, correctCount, totalCount, isComplete),
  };
}
