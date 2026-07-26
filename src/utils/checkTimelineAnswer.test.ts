import { describe, expect, it } from 'vitest';
import { checkTimelineAnswer, getCorrectOrder } from './checkTimelineAnswer';
import {
  allRelevantFourEvents,
  noRelevantEvents,
  makeEvent,
} from '../test/fixtures/events';

describe('getCorrectOrder', () => {
  it('sorts events by correctOrder ascending', () => {
    const shuffled = [
      allRelevantFourEvents[3],
      allRelevantFourEvents[0],
      allRelevantFourEvents[2],
      allRelevantFourEvents[1],
    ];
    expect(getCorrectOrder(shuffled)).toEqual(['r1', 'r2', 'r3', 'r4']);
  });

  it('returns an empty array when no events are provided', () => {
    expect(getCorrectOrder([])).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const original = [...allRelevantFourEvents];
    getCorrectOrder(allRelevantFourEvents);
    expect(allRelevantFourEvents).toEqual(original);
  });

  it('excludes irrelevant distractor events so they never appear in the correct sequence', () => {
    // Mirrors case-003: distractor events with correctOrder 0 alongside
    // relevant events with correctOrder 1+. Even when every event is passed
    // in, only the relevant ones define the investigation timeline.
    const mixed = [
      makeEvent({ id: 'd1', correctOrder: 0, isRelevant: false }),
      makeEvent({ id: 'r1', correctOrder: 1, isRelevant: true }),
      makeEvent({ id: 'd2', correctOrder: 0, isRelevant: false }),
      makeEvent({ id: 'r2', correctOrder: 2, isRelevant: true }),
      makeEvent({ id: 'd3', correctOrder: 0, isRelevant: false }),
    ];
    expect(getCorrectOrder(mixed)).toEqual(['r1', 'r2']);
  });

  it('returns the same order if events are already sorted and all relevant', () => {
    expect(getCorrectOrder(allRelevantFourEvents)).toEqual(['r1', 'r2', 'r3', 'r4']);
  });
});

describe('checkTimelineAnswer', () => {
  it('scores 100% when the user places every event in the correct position', () => {
    const result = checkTimelineAnswer(
      ['r1', 'r2', 'r3', 'r4'],
      allRelevantFourEvents,
    );

    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(4);
    expect(result.incorrectCount).toBe(0);
    expect(result.totalCount).toBe(4);
    expect(result.isComplete).toBe(true);
    expect(result.feedback.every((item) => item.isCorrect)).toBe(true);
    expect(result.mistakes).toEqual([]);
  });

  it('treats an empty timeline as incomplete and produces an instructive summary', () => {
    const result = checkTimelineAnswer([], allRelevantFourEvents);

    expect(result.isComplete).toBe(false);
    expect(result.score).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.feedback).toHaveLength(4);
    expect(result.feedback.every((item) => !item.isCorrect)).toBe(true);
    expect(result.summary.toLowerCase()).toContain('incomplete');
  });

  it('marks partial placements correctly and produces a partial score', () => {
    // r3 placed at position 2 (should be position 3 → "too early").
    const result = checkTimelineAnswer(
      ['r1', 'r3', 'r2', 'r4'],
      allRelevantFourEvents,
    );

    expect(result.correctCount).toBe(2);
    expect(result.incorrectCount).toBe(2);
    expect(result.score).toBe(50);
    expect(result.isComplete).toBe(true);

    const position1 = result.feedback[0];
    expect(position1.isCorrect).toBe(true);
    expect(position1.placedEventId).toBe('r1');
    expect(position1.expectedEventId).toBe('r1');

    const position2 = result.feedback[1];
    expect(position2.isCorrect).toBe(false);
    expect(position2.placedEventId).toBe('r3');
    expect(position2.expectedEventId).toBe('r2');
    // r3 has correctOrder 3, placed at position 2 → "too early"
    expect(position2.headline.toLowerCase()).toContain('too early');
  });

  it('classifies a "placed too early" mistake when the user drags an event up', () => {
    // r3 dragged to position 1. r1 pushed to position 2.
    const result = checkTimelineAnswer(
      ['r3', 'r1', 'r2', 'r4'],
      allRelevantFourEvents,
    );

    const position1 = result.feedback[0];
    expect(position1.isCorrect).toBe(false);
    expect(position1.placedEventId).toBe('r3');
    expect(position1.expectedEventId).toBe('r1');
    expect(position1.headline.toLowerCase()).toContain('too early');
  });

  it('records an empty-slot mistake when the timeline is shorter than the case', () => {
    // Only 3 events placed; totalCount is 4.
    const result = checkTimelineAnswer(
      ['r1', 'r2', 'r3'],
      allRelevantFourEvents,
    );

    expect(result.isComplete).toBe(false);
    const lastPosition = result.feedback[3];
    expect(lastPosition.placedEventId).toBeNull();
    expect(lastPosition.isCorrect).toBe(false);

    const emptySlotMistake = result.mistakes.find((m) => m.category === 'empty slot');
    expect(emptySlotMistake).toBeDefined();
    expect(emptySlotMistake?.position).toBe(4);
    expect(emptySlotMistake?.expectedEventId).toBe('r4');
  });

  it('returns a 0 score with no score-divide-by-zero when no events exist', () => {
    const result = checkTimelineAnswer([], []);
    expect(result.score).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.isComplete).toBe(true);
  });

  it('attaches a type-sequencing mistake for misplaced events of a known type', () => {
    // Place r3 (download) at position 2 — wrong type mismatch with r2 (search).
    const result = checkTimelineAnswer(
      ['r1', 'r3', 'r2', 'r4'],
      allRelevantFourEvents,
    );

    const mistake = result.mistakes.find((m) => m.eventId === 'r3');
    expect(mistake).toBeDefined();
    // r3 placed at position 2, but its correctOrder is 3 → "placed too early"
    expect(mistake?.category).toBe('placed too early');
    expect(mistake?.message.toLowerCase()).toContain('too early');
  });

  it('produces a summary that varies between perfect, partial, and zero scores', () => {
    const perfect = checkTimelineAnswer(
      ['r1', 'r2', 'r3', 'r4'],
      allRelevantFourEvents,
    );
    const partial = checkTimelineAnswer(
      ['r1', 'r3', 'r2', 'r4'],
      allRelevantFourEvents,
    );
    const empty = checkTimelineAnswer([], allRelevantFourEvents);

    expect(perfect.summary.toLowerCase()).toContain('excellent');
    expect(partial.summary).toMatch(/placed 2 of 4/i);
    expect(empty.summary.toLowerCase()).toContain('incomplete');
  });

  it('handles a case with no relevant events without exploding', () => {
    // All 5 events are distractors. The grader has nothing to grade, so the
    // score is 0 — placing distractors on the timeline never earns credit.
    const result = checkTimelineAnswer(
      ['n1', 'n2', 'n3', 'n4', 'n5'],
      noRelevantEvents,
    );

    expect(result.score).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.isComplete).toBe(true);
    expect(result.feedback).toEqual([]);
    expect(result.mistakes).toEqual([]);
  });

  it('marks an unknown placed event as incorrect with a recoverable explanation', () => {
    // Inject a phantom event id that isn't in the case.
    const result = checkTimelineAnswer(
      ['r1', 'r2', 'phantom', 'r4'],
      allRelevantFourEvents,
    );

    const position3 = result.feedback[2];
    expect(position3.isCorrect).toBe(false);
    expect(position3.placedEventId).toBe('phantom');
    expect(position3.expectedEventId).toBe('r3');
    expect(position3.explanation.toLowerCase()).toContain('unknown');
  });

  it('produces exactly one mistake per incorrect position', () => {
    // User's placement: r3 at slot 1, r1 at slot 2, r2 at slot 3, r4 at slot 4.
    // Expected:     r1 at slot 1, r2 at slot 2, r3 at slot 3, r4 at slot 4.
    // Slot 4 is correct. Slots 1, 2, and 3 are all incorrect.
    const result = checkTimelineAnswer(
      ['r3', 'r1', 'r2', 'r4'],
      allRelevantFourEvents,
    );

    expect(result.mistakes).toHaveLength(3);
    expect(result.mistakes.map((m) => m.position).sort()).toEqual([1, 2, 3]);
  });

  it('uses correctOrder even when events are passed in descending order', () => {
    // Provide events in reverse order; the function should still use correctOrder.
    const reversed = [...allRelevantFourEvents].reverse();
    const result = checkTimelineAnswer(['r4', 'r3', 'r2', 'r1'], reversed);

    // Correct answer is r1, r2, r3, r4 — user answered the reverse, so the
    // slot-1 placement (r4 where r1 is expected) is wrong, slot-2 (r3 where
    // r2 is expected) is wrong, slot-3 (r2 where r3 is expected) is wrong,
    // slot-4 (r1 where r4 is expected) is wrong: 0 correct.
    expect(result.score).toBe(0);
    expect(result.correctCount).toBe(0);
  });

  it('gives a relevant event description in the explanation to maximise learning value', () => {
    const result = checkTimelineAnswer(
      ['r1', 'r2', 'r3', 'r4'],
      allRelevantFourEvents,
    );

    const position1 = result.feedback[0];
    expect(position1.explanation).toContain('example.com');
    expect(position1.explanation).toContain('First history entry');
  });

  it('handles a single-event case (edge case)', () => {
    const singleEvent = [
      makeEvent({ id: 'only', correctOrder: 1, isRelevant: true, type: 'history' }),
    ];

    const correct = checkTimelineAnswer(['only'], singleEvent);
    expect(correct.score).toBe(100);
    expect(correct.isComplete).toBe(true);

    const empty = checkTimelineAnswer([], singleEvent);
    expect(empty.isComplete).toBe(false);
    expect(empty.score).toBe(0);
  });

  it('correctly ignores distractor events when scoring (case-003 regression)', () => {
    // Reproduces case-003: a mix of distractors (correctOrder: 0) and 3
    // relevant events. The student places only the relevant events in the
    // correct order; distractors should not be expected in the timeline.
    const distractors = [
      makeEvent({ id: 'd1', correctOrder: 0, isRelevant: false, type: 'history' }),
      makeEvent({ id: 'd2', correctOrder: 0, isRelevant: false, type: 'search' }),
      makeEvent({ id: 'd3', correctOrder: 0, isRelevant: false, type: 'history' }),
    ];
    const relevant = [
      makeEvent({ id: 'r1', correctOrder: 1, isRelevant: true, type: 'history' }),
      makeEvent({ id: 'r2', correctOrder: 2, isRelevant: true, type: 'search' }),
      makeEvent({ id: 'r3', correctOrder: 3, isRelevant: true, type: 'download' }),
    ];
    const all = [...distractors, ...relevant];
    // Student only places the 3 relevant events on the timeline.
    const result = checkTimelineAnswer(['r1', 'r2', 'r3'], all);

    expect(result.totalCount).toBe(3); // Distractors are excluded from the count.
    expect(result.isComplete).toBe(true);
    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(3);
  });

  it('flaging distractor placement in a relevant slot as incorrect (the timeline app only knows about relevant positions)', () => {
    // The student placed a distractor first then the 2 relevant events in
    // order. The grader maps grading positions 1..N to relevant events in
    // their correctOrder; the distractor at slot 1 means r1 was NOT placed at
    // position 1 (where r1 is expected), so that grading position is wrong.
    const distractors = [
      makeEvent({ id: 'd1', correctOrder: 0, isRelevant: false, type: 'history' }),
    ];
    const relevant = [
      makeEvent({ id: 'r1', correctOrder: 1, isRelevant: true, type: 'history' }),
      makeEvent({ id: 'r2', correctOrder: 2, isRelevant: true, type: 'search' }),
    ];
    const all = [...distractors, ...relevant];
    const result = checkTimelineAnswer(['d1', 'r1', 'r2'], all);

    // The 2 relevant positions are graded. Slot 1 expects r1 but got d1 → wrong.
    // Slot 2 expects r2 but got r1 (the r2 ended up at slot 3, beyond the
    // grader's range) → wrong. So the distractor cascadingly shifts the
    // remaining events and loses all positions. Completeness is true because
    // both relevant events are placed somewhere — just in the wrong slots.
    expect(result.totalCount).toBe(2);
    expect(result.correctCount).toBe(0);
    expect(result.score).toBe(0);
    expect(result.isComplete).toBe(true);
    expect(result.feedback[0].isCorrect).toBe(false);
    expect(result.feedback[0].placedEventId).toBe('d1');
    expect(result.feedback[1].isCorrect).toBe(false);
    expect(result.feedback[1].placedEventId).toBe('r1');
    expect(result.feedback[1].expectedEventId).toBe('r2');
  });

  it('counts a distractor placed in a "relevant" slot as incorrect', () => {
    // The student accidentally placed a distractor in slot 1 (where the
    // relevant event r1 was expected). The position is graded as wrong.
    const distractors = [
      makeEvent({ id: 'd1', correctOrder: 0, isRelevant: false, type: 'history' }),
    ];
    const relevant = [
      makeEvent({ id: 'r1', correctOrder: 1, isRelevant: true, type: 'history' }),
      makeEvent({ id: 'r2', correctOrder: 2, isRelevant: true, type: 'search' }),
    ];
    const all = [...distractors, ...relevant];
    const result = checkTimelineAnswer(['d1', 'r2'], all);

    expect(result.totalCount).toBe(2);
    expect(result.correctCount).toBe(1); // Only slot 2 is correct.
    expect(result.score).toBe(50);
    expect(result.feedback[0].isCorrect).toBe(false);
    expect(result.feedback[0].placedEventId).toBe('d1');
    expect(result.feedback[0].expectedEventId).toBe('r1');
  });

  it('treats a fully-correct placement as complete even if distractors are also dragged onto the timeline', () => {
    // The student wisely only dragged the relevant events to the timeline
    // but accidentally left a distractor on the timeline. Both relevant
    // positions are correct, the distractor placement is irrelevant to the
    // grading (it's not part of the investigation narrative).
    const distractors = [
      makeEvent({ id: 'd1', correctOrder: 0, isRelevant: false, type: 'history' }),
    ];
    const relevant = [
      makeEvent({ id: 'r1', correctOrder: 1, isRelevant: true, type: 'history' }),
      makeEvent({ id: 'r2', correctOrder: 2, isRelevant: true, type: 'search' }),
    ];
    const all = [...distractors, ...relevant];
    const result = checkTimelineAnswer(['r1', 'r2', 'd1'], all);

    expect(result.totalCount).toBe(2);
    expect(result.correctCount).toBe(2);
    expect(result.score).toBe(100);
    expect(result.isComplete).toBe(true);
  });
});
