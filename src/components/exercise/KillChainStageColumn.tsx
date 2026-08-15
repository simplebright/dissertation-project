import type { ReactNode } from 'react';
import type { ForensicEvent } from '../../types/case';
import { DroppableContainer } from '../dnd/DroppableContainer';
import { SortableItem } from '../dnd/SortableItem';
import { EvidenceCard } from './EvidenceCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KillChainStageColumnProps {
  containerId: string;
  itemIds: string[];
  eventsById: Record<string, ForensicEvent>;
  emptyMessage?: string;
  showTimestamp?: boolean;
  children?: ReactNode;
}

export function KillChainStageColumn({
  containerId,
  itemIds,
  eventsById,
  emptyMessage = 'Drop evidence here',
  showTimestamp = false,
  children,
}: KillChainStageColumnProps) {
  return (
    <DroppableContainer
      id={containerId}
      className="flex flex-1 flex-col gap-3 rounded-xl"
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {itemIds.length === 0 ? (
          <p className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/60 px-3 py-6 text-center text-xs text-slate-500">
            {emptyMessage}
          </p>
        ) : (
          itemIds.map((id) => {
            const event = eventsById[id];
            if (!event) {
              return null;
            }
            return (
              <SortableItem
                key={id}
                id={id}
                className="cursor-grab rounded-xl transition-transform duration-300 active:cursor-grabbing"
              >
                <EvidenceCard event={event} showTimestamp={showTimestamp} />
              </SortableItem>
            );
          })
        )}
      </SortableContext>
      {children}
    </DroppableContainer>
  );
}
