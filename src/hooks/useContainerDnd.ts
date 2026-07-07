import { useEffect, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';

export type ContainerState = Record<string, string[]>;

function findContainerForItem(
  itemId: string,
  containers: ContainerState,
): string | undefined {
  return Object.entries(containers).find(([, items]) =>
    items.includes(itemId),
  )?.[0];
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
      const overContainer =
        overId in current ? overId : findContainerForItem(overId, current);

      if (!activeContainer || !overContainer) {
        return current;
      }

      if (activeContainer === overContainer) {
        const items = current[activeContainer];
        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
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

      const overIndex = destinationItems.indexOf(overId);
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
