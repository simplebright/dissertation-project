import { useMemo, useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DND_CONTAINER_IDS } from '../constants/dnd';
import { getCaseById } from '../data/caseRegistry';
import type { ForensicEvent, InvestigationCase } from '../types/case';
import { buildEventsById } from '../utils/events';
import { shuffleArray } from '../utils/shuffle';
import { useContainerDnd } from './useContainerDnd';

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

function createInitialContainers(selectedEvents: ForensicEvent[]): Record<string, string[]> {
  return {
    [DND_CONTAINER_IDS.killChainEvidence]: shuffleArray(selectedEvents).map(
      (event) => event.id,
    ),
    [DND_CONTAINER_IDS.killChainReconnaissance]: [],
    [DND_CONTAINER_IDS.killChainDelivery]: [],
    [DND_CONTAINER_IDS.killChainExploitation]: [],
    [DND_CONTAINER_IDS.killChainInstallation]: [],
    [DND_CONTAINER_IDS.killChainActions]: [],
  };
}

export function useKillChainExercise(
  caseId: string | undefined,
  selectedEvidenceIds: readonly string[] | undefined,
) {
  const investigationCase = caseId ? getCaseById(caseId) : undefined;
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

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

  const activeEvent = activeEventId ? eventsById[activeEventId] : undefined;

  return {
    investigationCase,
    selectedEvents,
    eventsById,
    containers,
    activeEvent,
    handleDragStart,
    handleDragEnd,
  };
}
