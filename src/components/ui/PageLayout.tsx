import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  return (
    <main className="edu-page flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-edu-900">{title}</h1>
      <p className="mt-2 text-slate-600">{description}</p>
      <Link
        to={actionTo}
        className="mt-4 text-sm font-semibold text-edu-600 underline decoration-edu-200 underline-offset-4 transition-colors duration-300 hover:text-edu-800"
      >
        {actionLabel}
      </Link>
    </main>
  );
}

interface PageActionsProps {
  children: ReactNode;
}

export function PageActions({ children }: PageActionsProps) {
  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
      {children}
    </div>
  );
}
