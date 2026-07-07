import type { ElementType, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  as: Component = 'div',
  hover = false,
}: CardProps) {
  return (
    <Component
      className={`edu-card p-6 ${hover ? 'edu-card-hover' : ''} ${className}`}
    >
      {children}
    </Component>
  );
}
