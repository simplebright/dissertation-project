import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { HINT_BUDGET } from '../constants/hints';
import { DND_CONTAINER_IDS } from '../constants/dnd';
import { getCaseById } from '../data/caseRegistry';
import type { ForensicEvent, InvestigationCase } from '../types/case';
import { checkTimelineAnswer } from '../utils/checkTimelineAnswer';
import { buildEventsById } from '../utils/events';
import { saveAttempt } from '../utils/progressStorage';
import type { AttemptRecord } from '../types/progress';
import { shuffleArray } from '../utils/shuffle';
import { useContainerDnd } from './useContainerDnd';

function createInitialContainers(
  investigationCase: InvestigationCase,
): Record<string, string[]> {
  return {
    [DND_CONTAINER_IDS.evidence]: shuffleArray(investigationCase.events).map(
      (event) => event.id,
    ),
    [DND_CONTAINER_IDS.timeline]: [],
  };
}

export function useTimelineExercise(caseId: string | undefined) {
  const navigate = useNavigate();
  const investigationCase = caseId ? getCaseById(caseId) : undefined;
  const startTimeRef = useRef(Date.now());
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [hintEventId, setHintEventId] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedByEvent, setRevealedByEvent] = useState<
    Record<string, number>
  >({});

  const eventsById = useMemo<Record<string, ForensicEvent>>(
    () =>
      investigationCase
        ? buildEventsById(investigationCase.events)
        : {},
    [investigationCase],
  );

  const initialContainers = useMemo(
    () =>
      investigationCase
        ? createInitialContainers(investigationCase)
        : {
            [DND_CONTAINER_IDS.evidence]: [],
            [DND_CONTAINER_IDS.timeline]: [],
          },
    [investigationCase],
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
      const event = investigationCase?.events.find((e) => e.id === eventId);
      const totalLevels = event?.hints?.length ?? 0;
      const currentRevealed = revealedByEvent[eventId] ?? 0;
      if (totalLevels > 0 && currentRevealed >= totalLevels) {
        return;
      }
      setHintEventId(eventId);
      setHintsUsed((count) => Math.min(count + 1, HINT_BUDGET));
      setRevealedByEvent((prev) => ({
        ...prev,
        [eventId]: Math.min(currentRevealed + 1, totalLevels),
      }));
    },
    [hintsUsed, investigationCase, revealedByEvent],
  );

  const handleSubmit = () => {
    if (!investigationCase) {
      return;
    }

    const result = checkTimelineAnswer(
      containers[DND_CONTAINER_IDS.timeline],
      investigationCase.events,
    );
    const completionTime = Date.now() - startTimeRef.current;
    const accuracy = result.score / 100;
    const mistakes = result.feedback.filter((item) => !item.isCorrect).length;

    const attempt: AttemptRecord = {
      caseId: investigationCase.id,
      mode: 'practice',
      score: result.score,
      accuracy,
      completionTime,
      hintsUsed,
      mistakes,
      confidence: 0,
      completedAt: new Date().toISOString(),
    };

    saveAttempt(attempt);

    navigate('/results', {
      state: {
        result,
        caseId: investigationCase.id,
        completionTimeMs: completionTime,
        hintsUsed,
        hintBudget: HINT_BUDGET,
      },
    });
  };

  const activeEvent = activeEventId ? eventsById[activeEventId] : undefined;

  return {
    investigationCase,
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
    revealedByEvent,
    timelineEventIds: containers[DND_CONTAINER_IDS.timeline],
  };
}
