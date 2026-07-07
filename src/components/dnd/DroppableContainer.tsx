import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableContainerProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function DroppableContainer({
  id,
  children,
  className = '',
}: DroppableContainerProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} rounded-2xl transition-all duration-300 ${
        isOver
          ? 'bg-edu-50 ring-2 ring-edu-400 ring-offset-2'
          : ''
      }`}
    >
      {children}
    </div>
  );
}
