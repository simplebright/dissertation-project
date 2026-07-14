import type { ForensicEvent } from '../types/case';
import type { MistakeRecord } from '../types/mistake';
import type {
  PositionFeedback,
  TimelineAnswerResult,
} from '../types/timeline';
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

function categorizePlacement(
  actualEvent: ForensicEvent,
  expectedEvent: ForensicEvent,
  position: number,
): MistakeRecord['category'] {
  if (actualEvent.correctOrder > position) {
    return 'placed too early';
  }
  if (actualEvent.correctOrder < position) {
    return 'placed too late';
  }
  if (actualEvent.type !== expectedEvent.type) {
    return 'event type mismatch';
  }
  return 'event ordering';
}

function buildMistakeMessage(
  category: MistakeRecord['category'],
  actualEvent: ForensicEvent | undefined,
  expectedEvent: ForensicEvent,
  position: number,
): string {
  switch (category) {
    case 'placed too early':
      return actualEvent
        ? `Position ${position} is too early for "${actualEvent.description}". It should appear at step ${actualEvent.correctOrder}.`
        : `An event at position ${position} was placed too early.`;
    case 'placed too late':
      return actualEvent
        ? `Position ${position} is too late for "${actualEvent.description}". It should appear at step ${actualEvent.correctOrder}.`
        : `An event at position ${position} was placed too late.`;
    case 'event type mismatch':
      return actualEvent
        ? `Position ${position} expects a ${expectedEvent.type} event but received a ${actualEvent.type} event ("${actualEvent.description}").`
        : `Position ${position} expects a ${expectedEvent.type} event.`;
    case 'empty slot':
      return `Position ${position} is empty. Step ${position} should be "${expectedEvent.description}".`;
    default:
      return actualEvent
        ? `Event "${actualEvent.description}" is out of order. The expected event at position ${position} is "${expectedEvent.description}".`
        : `Event ordering is incorrect at position ${position}.`;
  }
}

function typeSequencingLabel(type: string): MistakeRecord['category'] {
  switch (type) {
    case 'download':
      return 'download sequencing';
    case 'search':
      return 'search sequencing';
    case 'cookie':
      return 'cookie sequencing';
    case 'history':
      return 'history sequencing';
    default:
      return 'event ordering';
  }
}

function buildMistakeRecords(
  feedback: PositionFeedback[],
  eventsById: Record<string, ForensicEvent>,
): MistakeRecord[] {
  const mistakes: MistakeRecord[] = [];

  for (const item of feedback) {
    if (item.isCorrect) {
      continue;
    }

    const expectedEvent = eventsById[item.expectedEventId];
    const actualEvent =
      item.placedEventId !== null ? eventsById[item.placedEventId] : undefined;

    if (!expectedEvent) {
      continue;
    }

    if (item.placedEventId === null) {
      mistakes.push({
        eventId: expectedEvent.id,
        position: item.position,
        expectedEventId: expectedEvent.id,
        category: 'empty slot',
        message: buildMistakeMessage(
          'empty slot',
          undefined,
          expectedEvent,
          item.position,
        ),
      });
      continue;
    }

    if (!actualEvent) {
      continue;
    }

    const placementCategory = categorizePlacement(
      actualEvent,
      expectedEvent,
      item.position,
    );

    const typeCategory = typeSequencingLabel(actualEvent.type);
    const category: MistakeRecord['category'] =
      placementCategory === 'event ordering' ? typeCategory : placementCategory;

    mistakes.push({
      eventId: actualEvent.id,
      position: item.position,
      expectedEventId: expectedEvent.id,
      category,
      message: buildMistakeMessage(
        category,
        actualEvent,
        expectedEvent,
        item.position,
      ),
    });
  }

  return mistakes;
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
  const mistakes = buildMistakeRecords(feedback, eventsById);

  return {
    score,
    correctCount,
    incorrectCount,
    totalCount,
    isComplete,
    feedback,
    summary: generateSummary(score, correctCount, totalCount, isComplete),
    mistakes,
  };
}