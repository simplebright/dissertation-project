import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { HINT_BUDGET } from '../constants/hints';
import { DND_CONTAINER_IDS } from '../constants/dnd';
import { getCaseById } from '../data/caseRegistry';
import type { ForensicEvent, InvestigationCase } from '../types/case';
import { checkTimelineAnswer } from '../utils/checkTimelineAnswer';
import { evaluateEvidenceSelection } from '../utils/evaluateEvidenceSelection';
import { buildEventsById } from '../utils/events';
import {
  clearHintState,
  loadHintState,
  saveHintState,
} from '../utils/hintStorage';
import {
  clearSessionLog,
  createSessionLog,
  loadSessionLog,
  recordInteraction,
  type PersistedSessionLog,
  type RecordInteractionInput,
} from '../utils/sessionLog';
import { saveAttempt } from '../utils/progressStorage';
import type { AttemptRecord } from '../types/progress';
import { shuffleArray } from '../utils/shuffle';
import { useContainerDnd } from './useContainerDnd';

function createInitialContainers(
  selectedEvents: ForensicEvent[],
): Record<string, string[]> {
  return {
    [DND_CONTAINER_IDS.evidence]: shuffleArray(selectedEvents).map(
      (event) => event.id,
    ),
    [DND_CONTAINER_IDS.timeline]: [],
  };
}

function resolveSelectedEvents(
  investigationCase: InvestigationCase | undefined,
  selectedEvidenceIds: readonly string[] | undefined,
): ForensicEvent[] {
  if (!investigationCase || !selectedEvidenceIds) {
    return [];
  }
  const caseEventIds = new Set(investigationCase.events.map((event) => event.id));
  const seen = new Set<string>();
  const resolved: ForensicEvent[] = [];
  for (const id of selectedEvidenceIds) {
    if (!caseEventIds.has(id) || seen.has(id)) {
      continue;
    }
    const event = investigationCase.events.find((item) => item.id === id);
    if (event) {
      resolved.push(event);
      seen.add(id);
    }
  }
  return resolved;
}

export function useTimelineExercise(
  caseId: string | undefined,
  selectedEvidenceIds: readonly string[] | undefined,
) {
  const navigate = useNavigate();
  const investigationCase = caseId ? getCaseById(caseId) : undefined;
  const startTimeRef = useRef(Date.now());
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [hintEventId, setHintEventId] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState<number>(() => {
    if (!caseId) {
      return 0;
    }
    return loadHintState(caseId)?.hintsUsed ?? 0;
  });
  const [revealedByEvent, setRevealedByEvent] = useState<
    Record<string, number>
  >({});

  const sessionLogRef = useRef<PersistedSessionLog>(
    caseId ? loadSessionLog(caseId) ?? createSessionLog(caseId) : createSessionLog('unknown'),
  );
  const appendSessionEvent = useCallback(
    (input: RecordInteractionInput) => {
      sessionLogRef.current = recordInteraction(sessionLogRef.current, input);
    },
    [],
  );

  useEffect(() => {
    if (!caseId) {
      return;
    }
    saveHintState(caseId, hintsUsed, loadHintState(caseId)?.selectionHintsRevealed ?? 0);
  }, [caseId, hintsUsed]);

  useEffect(() => {
    return () => {
      if (caseId) {
        clearHintState(caseId);
      }
    };
  }, [caseId]);

  useEffect(() => {
    return () => {
      if (caseId) {
        clearSessionLog(caseId);
      }
    };
  }, [caseId]);

  const selectedEvents = useMemo(
    () => resolveSelectedEvents(investigationCase, selectedEvidenceIds),
    [investigationCase, selectedEvidenceIds],
  );

  const eventsById = useMemo<Record<string, ForensicEvent>>(
    () => buildEventsById(selectedEvents),
    [selectedEvents],
  );

  const initialContainers = useMemo(
    () => createInitialContainers(selectedEvents),
    [selectedEvents],
  );

  const { containers, handleDragEnd: onDragEnd } = useContainerDnd(
    initialContainers,
    caseId ?? '',
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveEventId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    onDragEnd(event);
    setActiveEventId(null);
  };

  const handleSelectHintEvent = useCallback((eventId: string | null) => {
    setHintEventId(eventId);
  }, []);

  const handleUseHint = useCallback(
    (eventId: string) => {
      if (hintsUsed >= HINT_BUDGET) {
        return;
      }
      const event = selectedEvents.find((e) => e.id === eventId);
      const totalLevels = event?.hints?.length ?? 0;
      const currentRevealed = revealedByEvent[eventId] ?? 0;
      // Distractor events (and any event with no `hints` array) can't be hinted,
      // and once all levels for an event are already shown, the budget is
      // depleted for that event. Without this guard we would silently increment
      // `hintsUsed` and burn a budget slot for nothing.
      if (totalLevels === 0 || currentRevealed >= totalLevels) {
        return;
      }
      setHintEventId(eventId);
      const nextCount = Math.min(hintsUsed + 1, HINT_BUDGET);
      const nextRevealed = Math.min(currentRevealed + 1, totalLevels);
      setHintsUsed(nextCount);
      setRevealedByEvent((prev) => ({
        ...prev,
        [eventId]: nextRevealed,
      }));
      appendSessionEvent({
        type: 'hint.used',
        stage: 'timeline',
        eventId,
        hintLevel: nextRevealed,
        hintsUsedSoFar: nextCount,
      });
    },
    [hintsUsed, selectedEvents, revealedByEvent, appendSessionEvent],
  );

  const handleTimelineHintOpened = useCallback(() => {
    appendSessionEvent({
      type: 'hint.opened',
      stage: 'timeline',
      hintsUsedSoFar: hintsUsed,
    });
  }, [appendSessionEvent, hintsUsed]);

  const handleSubmit = () => {
    if (!investigationCase) {
      return;
    }

    const result = checkTimelineAnswer(
      containers[DND_CONTAINER_IDS.timeline],
      selectedEvents,
    );
    const selection = evaluateEvidenceSelection(
      selectedEvidenceIds ?? [],
      investigationCase.events,
    );
    const completionTime = Date.now() - startTimeRef.current;
    const accuracy = result.score / 100;

    appendSessionEvent({
      type: 'timeline.submitted',
      stage: 'timeline',
      metadata: {
        score: result.score,
        correctCount: result.correctCount,
        incorrectCount: result.incorrectCount,
        mistakes: result.mistakes.length,
      },
    });

    const attempt: AttemptRecord = {
      caseId: investigationCase.id,
      mode: 'practice',
      score: result.score,
      accuracy,
      completionTime,
      hintsUsed,
      mistakes: result.mistakes.length,
      confidence: 0,
      completedAt: new Date().toISOString(),
      mistakeDetails: result.mistakes,
      selectionAccuracy: selection.accuracy,
      selectionFPIds: selection.falsePositiveEvents.map((e) => e.id),
      selectionFNIds: selection.falseNegativeEvents.map((e) => e.id),
      sessionLog: sessionLogRef.current.events,
    };

    saveAttempt(attempt);

    if (investigationCase.id) {
      clearSessionLog(investigationCase.id);
    }

    navigate('/results', {
      state: {
        result,
        selection,
        caseId: investigationCase.id,
        completionTimeMs: completionTime,
        hintsUsed,
        hintBudget: HINT_BUDGET,
        mistakes: result.mistakes,
        completedAt: attempt.completedAt,
      },
    });
  };

  const activeEvent = activeEventId ? eventsById[activeEventId] : undefined;

  return {
    investigationCase,
    selectedEvents,
    eventsById,
    containers,
    activeEvent,
    handleDragStart,
    handleDragEnd,
    handleSubmit,
    hintsUsed,
    hintBudget: HINT_BUDGET,
    hintEventId,
    handleSelectHintEvent,
    handleUseHint,
    handleTimelineHintOpened,
    revealedByEvent,
    timelineEventIds: containers[DND_CONTAINER_IDS.timeline],
  };
}
