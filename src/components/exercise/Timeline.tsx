import type { ForensicEvent } from '../../types/case';
import { DroppableEmptySlot } from './DroppableEmptySlot';
import { SortableEvidenceList } from './SortableEvidenceList';

interface TimelineProps {
  containerId: string;
  itemIds: string[];
  eventsById: Record<string, ForensicEvent>;
  slotCount: number;
  showTimestamp?: boolean;
  mode?: 'beginner' | 'advanced';
}

export function Timeline({
  containerId,
  itemIds,
  eventsById,
  slotCount,
  showTimestamp = true,
  mode = 'beginner',
}: TimelineProps) {
  const emptySlotCount = Math.max(slotCount - itemIds.length, 0);

  return (
      <SortableEvidenceList
        containerId={containerId}
        itemIds={itemIds}
        eventsById={eventsById}
        title="Timeline"
        emptyMessage="Drag evidence here to build your timeline"
        showTimestamp={showTimestamp}
        mode={mode}
        footer={
        emptySlotCount > 0 ? (
          <div className="mt-1 flex flex-col gap-3" aria-label="Empty timeline slots">
            {Array.from({ length: emptySlotCount }, (_, index) => {
              const slotNumber = itemIds.length + index + 1;
              return (
                <DroppableEmptySlot
                  key={`empty-${slotNumber}`}
                  id={`empty-slot-${slotNumber}`}
                  className="flex min-h-20 items-center rounded-xl border-2 border-dashed border-edu-200 bg-edu-50/50 px-4"
                >
                  <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-edu-200 text-xs font-semibold text-edu-800">
                    {slotNumber}
                  </span>
                  <p className="text-sm text-slate-500">Empty slot</p>
                </DroppableEmptySlot>
              );
            })}
          </div>
        ) : null
      }
    />
  );
}
