import type { ForensicEvent } from '../../types/case';

/**
 * Build a deterministic forensic event for use in tests.
 * Tests that don't care about the explanation / hints / relationships
 * can call this with just the fields that matter for the assertion.
 */
export function makeEvent(overrides: Partial<ForensicEvent> & Pick<ForensicEvent, 'id'>): ForensicEvent {
  return {
    timestamp: '2024-01-01T00:00:00.000Z',
    type: 'history',
    description: `event ${overrides.id}`,
    correctOrder: 1,
    isRelevant: true,
    explanation: `Explanation for ${overrides.id}.`,
    ...overrides,
  };
}

/**
 * A canonical 4-event case dataset.
 * Ordering: e1 < e2 < e3 < e4.
 * Relevant events: e1, e3 (distractors are e2, e4).
 */
export const sampleEvents: ForensicEvent[] = [
  makeEvent({
    id: 'e1',
    correctOrder: 1,
    isRelevant: true,
    type: 'history',
    description: 'User visited example.com',
    explanation: 'First history entry.',
  }),
  makeEvent({
    id: 'e2',
    correctOrder: 2,
    isRelevant: false,
    type: 'search',
    description: 'Searched for "weather"',
    explanation: 'Unrelated search.',
  }),
  makeEvent({
    id: 'e3',
    correctOrder: 3,
    isRelevant: true,
    type: 'download',
    description: 'Downloaded report.pdf',
    explanation: 'Relevant download.',
  }),
  makeEvent({
    id: 'e4',
    correctOrder: 4,
    isRelevant: false,
    type: 'cookie',
    description: 'Cookie set by ad-tracker',
    explanation: 'Distractor cookie.',
  }),
];

/**
 * A 5-event case where every event is relevant — useful for testing
 * "perfect selection" paths.
 */
export const allRelevantEvents: ForensicEvent[] = [
  makeEvent({ id: 'a1', correctOrder: 1, isRelevant: true, type: 'history' }),
  makeEvent({ id: 'a2', correctOrder: 2, isRelevant: true, type: 'search' }),
  makeEvent({ id: 'a3', correctOrder: 3, isRelevant: true, type: 'download' }),
  makeEvent({ id: 'a4', correctOrder: 4, isRelevant: true, type: 'cookie' }),
  makeEvent({ id: 'a5', correctOrder: 5, isRelevant: true, type: 'history' }),
];

/**
 * A clean 4-event dataset in which every event is relevant (correctOrder 1..4).
 * Used by timeline tests that need to grade without distractor filtering.
 */
export const allRelevantFourEvents: ForensicEvent[] = [
  makeEvent({
    id: 'r1',
    correctOrder: 1,
    isRelevant: true,
    type: 'history',
    description: 'User visited example.com',
    explanation: 'First history entry.',
  }),
  makeEvent({
    id: 'r2',
    correctOrder: 2,
    isRelevant: true,
    type: 'search',
    description: 'Searched for "weather"',
    explanation: 'Related search.',
  }),
  makeEvent({
    id: 'r3',
    correctOrder: 3,
    isRelevant: true,
    type: 'download',
    description: 'Downloaded report.pdf',
    explanation: 'Relevant download.',
  }),
  makeEvent({
    id: 'r4',
    correctOrder: 4,
    isRelevant: true,
    type: 'cookie',
    description: 'Cookie set by app',
    explanation: 'App cookie.',
  }),
];

/**
 * A 5-event case where no event is relevant — useful for testing
 * "select none" extremes.
 */
export const noRelevantEvents: ForensicEvent[] = [
  makeEvent({ id: 'n1', correctOrder: 1, isRelevant: false, type: 'history' }),
  makeEvent({ id: 'n2', correctOrder: 2, isRelevant: false, type: 'search' }),
  makeEvent({ id: 'n3', correctOrder: 3, isRelevant: false, type: 'download' }),
  makeEvent({ id: 'n4', correctOrder: 4, isRelevant: false, type: 'cookie' }),
  makeEvent({ id: 'n5', correctOrder: 5, isRelevant: false, type: 'history' }),
];
