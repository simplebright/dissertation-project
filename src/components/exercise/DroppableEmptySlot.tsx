import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface DroppableEmptySlotProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function DroppableEmptySlot({
  id,
  children,
  className = '',
}: DroppableEmptySlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-colors duration-300 ${
        isOver ? 'bg-edu-100 ring-2 ring-edu-400 ring-offset-2' : ''
      }`}
    >
      {children}
    </div>
  );
}