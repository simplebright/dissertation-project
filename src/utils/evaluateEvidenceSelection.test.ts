import { describe, expect, it } from 'vitest';
import { evaluateEvidenceSelection } from './evaluateEvidenceSelection';
import {
  allRelevantEvents,
  noRelevantEvents,
  sampleEvents,
} from '../test/fixtures/events';

describe('evaluateEvidenceSelection', () => {
  it('returns perfect accuracy when the user identifies every relevant event and excludes every distractor', () => {
    const result = evaluateEvidenceSelection(['e1', 'e3'], sampleEvents);

    expect(result.truePositiveCount).toBe(2);
    expect(result.falsePositiveCount).toBe(0);
    expect(result.falseNegativeCount).toBe(0);
    expect(result.trueNegativeCount).toBe(2);
    expect(result.accuracy).toBe(100);
    expect(result.totalRelevant).toBe(2);
    expect(result.totalIrrelevant).toBe(2);
    expect(result.totalEvaluated).toBe(4);
    expect(result.correctlySelectedEvents.map((e) => e.id)).toEqual(['e1', 'e3']);
    expect(result.falsePositiveEvents).toEqual([]);
    expect(result.falseNegativeEvents).toEqual([]);
    expect(result.summary.toLowerCase()).toContain('perfect');
  });

  it('counts false positives when the user selects an irrelevant event', () => {
    // User selected e1 (relevant), e2 (irrelevant), e3 (relevant).
    const result = evaluateEvidenceSelection(['e1', 'e2', 'e3'], sampleEvents);

    expect(result.truePositiveCount).toBe(2);
    expect(result.falsePositiveCount).toBe(1);
    expect(result.falseNegativeCount).toBe(0);
    expect(result.trueNegativeCount).toBe(1);
    expect(result.accuracy).toBe(75);
    expect(result.falsePositiveEvents.map((e) => e.id)).toEqual(['e2']);
  });

  it('counts false negatives when the user misses a relevant event', () => {
    // User selected only e1, missed e3.
    const result = evaluateEvidenceSelection(['e1'], sampleEvents);

    expect(result.truePositiveCount).toBe(1);
    expect(result.falseNegativeCount).toBe(1);
    expect(result.trueNegativeCount).toBe(2);
    expect(result.falsePositiveCount).toBe(0);
    expect(result.accuracy).toBe(75);
    expect(result.falseNegativeEvents.map((e) => e.id)).toEqual(['e3']);
  });

  it('reports 0% accuracy when the user selects nothing in a case with relevant events', () => {
    const result = evaluateEvidenceSelection([], sampleEvents);

    expect(result.truePositiveCount).toBe(0);
    expect(result.falsePositiveCount).toBe(0);
    expect(result.falseNegativeCount).toBe(2);
    expect(result.trueNegativeCount).toBe(2);
    expect(result.accuracy).toBe(50); // 2 TN out of 4 events
    expect(result.totalRelevant).toBe(2);
  });

  it('reports 0% accuracy when the user selects everything indiscriminately', () => {
    const result = evaluateEvidenceSelection(['e1', 'e2', 'e3', 'e4'], sampleEvents);

    expect(result.truePositiveCount).toBe(2);
    expect(result.falsePositiveCount).toBe(2);
    expect(result.falseNegativeCount).toBe(0);
    expect(result.trueNegativeCount).toBe(0);
    expect(result.accuracy).toBe(50);
  });

  it('ignores selected ids that do not belong to the case', () => {
    const result = evaluateEvidenceSelection(['e1', 'phantom-id', 'e3'], sampleEvents);

    expect(result.truePositiveCount).toBe(2);
    expect(result.falsePositiveCount).toBe(0);
    expect(result.accuracy).toBe(100);
  });

  it('returns zero accuracy and an empty summary when the case has no events', () => {
    const result = evaluateEvidenceSelection([], []);

    expect(result.accuracy).toBe(0);
    expect(result.totalEvaluated).toBe(0);
    expect(result.totalRelevant).toBe(0);
    expect(result.totalIrrelevant).toBe(0);
    expect(result.summary).toContain('No evidence was available');
  });

  it('treats "select none" as the correct answer when no event is relevant', () => {
    const result = evaluateEvidenceSelection([], noRelevantEvents);

    expect(result.totalRelevant).toBe(0);
    expect(result.totalIrrelevant).toBe(5);
    expect(result.trueNegativeCount).toBe(5);
    expect(result.accuracy).toBe(100);
    expect(result.summary.toLowerCase()).toContain('perfect');
  });

  it('reports 0% accuracy when nothing is relevant but the user selects something', () => {
    const result = evaluateEvidenceSelection(['n1'], noRelevantEvents);

    expect(result.truePositiveCount).toBe(0);
    expect(result.falsePositiveCount).toBe(1);
    expect(result.accuracy).toBe(80); // 4 TN out of 5
    expect(result.summary.toLowerCase()).not.toContain('perfect');
  });

  it('correctly handles a case where every event is relevant', () => {
    const result = evaluateEvidenceSelection(
      ['a1', 'a2', 'a3', 'a4', 'a5'],
      allRelevantEvents,
    );

    expect(result.totalRelevant).toBe(5);
    expect(result.totalIrrelevant).toBe(0);
    expect(result.accuracy).toBe(100);
    expect(result.correctlySelectedEvents).toHaveLength(5);
  });

  it('deduplicates the selected ids silently (a set is the source of truth)', () => {
    const result = evaluateEvidenceSelection(['e1', 'e1', 'e3'], sampleEvents);

    expect(result.truePositiveCount).toBe(2);
    expect(result.falsePositiveCount).toBe(0);
  });

  it('produces a summary that mentions precision and recall components', () => {
    const result = evaluateEvidenceSelection(['e1', 'e2'], sampleEvents);

    expect(result.summary).toContain('%');
    expect(result.summary.toLowerCase()).toContain('relevant');
  });

  it('produces immutable event lists (does not leak references to the input)', () => {
    const result = evaluateEvidenceSelection(['e1', 'e3'], sampleEvents);

    // Mutating the returned array should not affect the input.
    result.correctlySelectedEvents.length = 0;
    expect(sampleEvents).toHaveLength(4);
  });
});
