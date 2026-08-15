import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { HINT_BUDGET } from '../constants/hints';
import { DND_CONTAINER_IDS } from '../constants/dnd';
import { getCaseById } from '../data/caseRegistry';
import type { ForensicEvent, InvestigationCase } from '../types/case';
import type { ExerciseMode } from '../types/exercise';
import { checkTimelineAnswer } from '../utils/checkTimelineAnswer';
import { evaluateEvidenceSelection } from '../utils/evaluateEvidenceSelection';
import { buildEventsById } from '../utils/events';
import { isExerciseLocationState } from '../utils/exerciseMode';
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

// Resolves every event on the investigation timeline (all isRelevant events),
// independent of what the learner picked during evidence selection. Decoupling
// the timeline from the prior selection means the grading here measures pure
// sequencing ability — a learner who missed an event during selection still
// gets a chance to place it on the timeline, and timeline scoring is no longer
// contaminated by upstream selection mistakes.
function resolveTimelineEvents(
  investigationCase: InvestigationCase | undefined,
): ForensicEvent[] {
  if (!investigationCase) {
    return [];
  }
  return investigationCase.events.filter((event) => event.isRelevant);
}

function createInitialContainers(
  timelineEvents: ForensicEvent[],
): Record<string, string[]> {
  return {
    [DND_CONTAINER_IDS.evidence]: shuffleArray(timelineEvents).map(
      (event) => event.id,
    ),
    [DND_CONTAINER_IDS.timeline]: [],
  };
}

export function useTimelineExercise(
  caseId: string | undefined,
  selectedEvidenceIds: readonly string[] | undefined,
) {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingExerciseState = isExerciseLocationState(location.state)
    ? location.state
    : undefined;
  const incomingExerciseMode: ExerciseMode | undefined = incomingExerciseState?.mode;
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

  // Timeline inputs come from every relevant event in the case — independent
  // of what the learner chose during evidence selection. Selection accuracy is
  // still graded on submit via `selectedEvidenceIds` against the full event
  // list, but the ordering task itself is no longer bound to the prior stage.
  const timelineEvents = useMemo(
    () => resolveTimelineEvents(investigationCase),
    [investigationCase],
  );

  const eventsById = useMemo<Record<string, ForensicEvent>>(
    () => buildEventsById(timelineEvents),
    [timelineEvents],
  );

  const initialContainers = useMemo(
    () => createInitialContainers(timelineEvents),
    [timelineEvents],
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
      const event = timelineEvents.find((e) => e.id === eventId);
      const totalLevels = event?.hints?.length ?? 0;
      const currentRevealed = revealedByEvent[eventId] ?? 0;
      if (totalLevels > 0 && currentRevealed >= totalLevels) {
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
    [hintsUsed, timelineEvents, revealedByEvent, appendSessionEvent],
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
      timelineEvents,
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

    navigate(`/exercise/${investigationCase.id}/kill-chain`, {
      state: {
        mode: incomingExerciseMode ?? 'beginner',
        selectedEvidenceIds: selectedEvidenceIds ?? [],
        upstreamResults: {
          result,
          selection,
          caseId: investigationCase.id,
          completionTimeMs: completionTime,
          hintsUsed,
          hintBudget: HINT_BUDGET,
          mistakes: result.mistakes,
          completedAt: attempt.completedAt,
        },
      },
      replace: true,
    });
  };

  const activeEvent = activeEventId ? eventsById[activeEventId] : undefined;

  return {
    investigationCase,
    selectedEvents: timelineEvents,
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
