import type { ForensicEvent } from '../types/case';
import type { EvidenceSelectionResult } from '../types/evidenceSelection';

function buildSelectionSummary(
  accuracy: number,
  truePositiveCount: number,
  falsePositiveCount: number,
  falseNegativeCount: number,
  totalRelevant: number,
  totalEvaluated: number,
): string {
  if (totalEvaluated === 0) {
    return 'No evidence was available to evaluate your selection.';
  }

  if (falsePositiveCount === 0 && falseNegativeCount === 0) {
    return `Perfect evidence selection — every relevant event was included and every irrelevant event was excluded (${accuracy}% accuracy across ${totalEvaluated} events).`;
  }

  const precisionPart =
    truePositiveCount + falsePositiveCount > 0
      ? `${truePositiveCount} of ${truePositiveCount + falsePositiveCount} selected events were actually relevant`
      : 'no relevant events were selected';

  const recallPart =
    totalRelevant > 0
      ? `${truePositiveCount} of ${totalRelevant} relevant events were identified`
      : 'the case did not mark any events as relevant';

  return `Selection accuracy: ${accuracy}% (${precisionPart}; ${recallPart}). Review the false positives and false negatives below to refine your triage instincts.`;
}

/**
 * Evaluate the user's evidence selection against the case ground truth.
 *
 * Treats the case as the universe of events: each event is either flagged
 * `isRelevant: true` (positive class) or `isRelevant: false` (negative class).
 * The user's job in Stage 1 is to pick the positives; the user's job in
 * Stage 2 (timeline ordering) is independent and lives in `checkTimelineAnswer`.
 *
 * Selection accuracy here = (true positives + true negatives) / total events,
 * giving equal weight to inclusion of relevant evidence and exclusion of
 * irrelevant distractors. We deliberately do NOT blend this with timeline
 * ordering — the two stages measure different competencies.
 */
export function evaluateEvidenceSelection(
  selectedEvidenceIds: readonly string[],
  events: readonly ForensicEvent[],
): EvidenceSelectionResult {
  const caseEventsById = new Map<string, ForensicEvent>();
  for (const event of events) {
    caseEventsById.set(event.id, event);
  }

  const selectedIds = new Set<string>();
  for (const id of selectedEvidenceIds) {
    if (caseEventsById.has(id)) {
      selectedIds.add(id);
    }
  }

  let truePositiveCount = 0;
  let falsePositiveCount = 0;
  let falseNegativeCount = 0;
  let trueNegativeCount = 0;
  let totalRelevant = 0;
  let totalIrrelevant = 0;

  const correctlySelectedEvents: ForensicEvent[] = [];
  const falsePositiveEvents: ForensicEvent[] = [];
  const falseNegativeEvents: ForensicEvent[] = [];

  for (const event of events) {
    const wasSelected = selectedIds.has(event.id);
    if (event.isRelevant) {
      totalRelevant += 1;
      if (wasSelected) {
        truePositiveCount += 1;
        correctlySelectedEvents.push(event);
      } else {
        falseNegativeCount += 1;
        falseNegativeEvents.push(event);
      }
    } else {
      totalIrrelevant += 1;
      if (wasSelected) {
        falsePositiveCount += 1;
        falsePositiveEvents.push(event);
      } else {
        trueNegativeCount += 1;
      }
    }
  }

  const totalEvaluated = totalRelevant + totalIrrelevant;
  const accuracy =
    totalEvaluated > 0
      ? Math.round(
          ((truePositiveCount + trueNegativeCount) / totalEvaluated) * 100,
        )
      : 0;

  return {
    accuracy,
    truePositiveCount,
    falsePositiveCount,
    falseNegativeCount,
    trueNegativeCount,
    totalRelevant,
    totalIrrelevant,
    totalEvaluated,
    correctlySelectedEvents,
    falsePositiveEvents,
    falseNegativeEvents,
    summary: buildSelectionSummary(
      accuracy,
      truePositiveCount,
      falsePositiveCount,
      falseNegativeCount,
      totalRelevant,
      totalEvaluated,
    ),
  };
}