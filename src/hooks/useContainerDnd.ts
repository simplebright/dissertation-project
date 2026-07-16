import { useEffect, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { DND_CONTAINER_IDS } from '../constants/dnd';

export type ContainerState = Record<string, string[]>;

function findContainerForItem(
  itemId: string,
  containers: ContainerState,
): string | undefined {
  return Object.entries(containers).find(([, items]) =>
    items.includes(itemId),
  )?.[0];
}

const EMPTY_SLOT_ID_PATTERN = /^empty-slot-(\d+)$/;

function parseEmptySlotId(
  id: string,
): { slotNumber: number } | null {
  const match = EMPTY_SLOT_ID_PATTERN.exec(id);
  if (!match) {
    return null;
  }
  return { slotNumber: Number(match[1]) };
}

function resolveEmptySlotIndex(
  overId: string,
  destinationItems: string[],
): number | null {
  const parsed = parseEmptySlotId(overId);
  if (!parsed) {
    return null;
  }
  const { slotNumber } = parsed;
  if (slotNumber < 1) {
    return 0;
  }
  // Items are stored compactly; slot N corresponds to array index N-1.
  // If N exceeds the current length (gap of empty slots), clamp to append.
  return Math.min(slotNumber - 1, destinationItems.length);
}

export function useContainerDnd(
  initialState: ContainerState,
  resetKey: string,
) {
  const [containers, setContainers] = useState<ContainerState>(initialState);

  useEffect(() => {
    setContainers(initialState);
  }, [resetKey, initialState]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    setContainers((current) => {
      const activeContainer = findContainerForItem(activeId, current);
      let overContainer =
        overId in current ? overId : findContainerForItem(overId, current);
      const overIsEmptySlot = parseEmptySlotId(overId) !== null;

      if (!activeContainer) {
        return current;
      }

      // Empty slot ids aren't registered containers; resolve them to the
      // timeline container explicitly.
      if (!overContainer && overIsEmptySlot) {
        overContainer = DND_CONTAINER_IDS.timeline in current
          ? DND_CONTAINER_IDS.timeline
          : Object.keys(current)[0];
      }

      if (!overContainer) {
        return current;
      }

      if (activeContainer === overContainer) {
        const items = current[activeContainer];
        const oldIndex = items.indexOf(activeId);
        let newIndex = items.indexOf(overId);
        if (newIndex === -1) {
          newIndex = resolveEmptySlotIndex(overId, items) ?? -1;
        }

        if (
          oldIndex === -1 ||
          newIndex === -1 ||
          oldIndex === newIndex
        ) {
          return current;
        }

        return {
          ...current,
          [activeContainer]: arrayMove(items, oldIndex, newIndex),
        };
      }

      const sourceItems = [...current[activeContainer]];
      const destinationItems = [...current[overContainer]];
      const activeIndex = sourceItems.indexOf(activeId);

      if (activeIndex === -1) {
        return current;
      }

      sourceItems.splice(activeIndex, 1);

      let overIndex = destinationItems.indexOf(overId);
      if (overIndex === -1) {
        const emptySlotIndex = resolveEmptySlotIndex(
          overId,
          destinationItems,
        );
        overIndex = emptySlotIndex ?? destinationItems.length;
      }
      const insertIndex = overIndex >= 0 ? overIndex : destinationItems.length;
      destinationItems.splice(insertIndex, 0, activeId);

      return {
        ...current,
        [activeContainer]: sourceItems,
        [overContainer]: destinationItems,
      };
    });
  };

  return { containers, handleDragEnd };
}
