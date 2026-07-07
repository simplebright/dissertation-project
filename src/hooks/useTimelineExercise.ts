import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DND_CONTAINER_IDS } from '../constants/dnd';
import { getCaseById } from '../data/caseRegistry';
import type { ForensicEvent, InvestigationCase } from '../types/case';
import { checkTimelineAnswer } from '../utils/checkTimelineAnswer';
import { buildEventsById } from '../utils/events';
import { saveCaseCompletion } from '../utils/progressStorage';
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

  const handleSubmit = () => {
    if (!investigationCase) {
      return;
    }

    const result = checkTimelineAnswer(
      containers[DND_CONTAINER_IDS.timeline],
      investigationCase.events,
    );
    const completionTimeMs = Date.now() - startTimeRef.current;

    saveCaseCompletion({
      caseId: investigationCase.id,
      score: result.score,
      completionTimeMs,
      completedAt: new Date().toISOString(),
    });

    navigate('/results', {
      state: {
        result,
        caseId: investigationCase.id,
        completionTimeMs,
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
  };
}
