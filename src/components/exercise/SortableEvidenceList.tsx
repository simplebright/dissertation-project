import type { ReactNode } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { ForensicEvent } from '../../types/case';
import { DroppableContainer } from '../dnd/DroppableContainer';
import { SortableItem } from '../dnd/SortableItem';
import { EvidenceCard } from './EvidenceCard';

interface SortableEvidenceListProps {
  containerId: string;
  itemIds: string[];
  eventsById: Record<string, ForensicEvent>;
  title: string;
  emptyMessage?: string;
  footer?: ReactNode;
  showTimestamp?: boolean;
  mode?: 'beginner' | 'advanced';
}

export function SortableEvidenceList({
  containerId,
  itemIds,
  eventsById,
  title,
  emptyMessage = 'No evidence items',
  footer,
  showTimestamp = true,
  mode = 'beginner',
}: SortableEvidenceListProps) {
  return (
    <div className="flex h-full flex-col">
      <h2 className="edu-section-title mb-4">{title}</h2>
      <DroppableContainer
        id={containerId}
        className="flex flex-1 flex-col gap-3 rounded-2xl"
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {itemIds.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-edu-200 bg-edu-50/60 px-4 py-8 text-center text-sm text-slate-500">
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
                  <EvidenceCard event={event} showTimestamp={showTimestamp} mode={mode} />
                </SortableItem>
              );
            })
          )}
        </SortableContext>
        {footer}
      </DroppableContainer>
    </div>
  );
}
