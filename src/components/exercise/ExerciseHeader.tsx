import type { InvestigationCase } from '../../types/case';
import { DifficultyBadge } from '../case/DifficultyBadge';

interface ExerciseHeaderProps {
  investigationCase: InvestigationCase;
}

export function ExerciseHeader({ investigationCase }: ExerciseHeaderProps) {
  return (
    <header className="border-b border-edu-100 bg-white/90 px-4 py-5 shadow-sm shadow-blue-900/5 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-edu-600">Timeline Exercise</p>
          <h1 className="text-2xl font-bold text-edu-900">
            {investigationCase.title}
          </h1>
        </div>
        <DifficultyBadge difficulty={investigationCase.difficulty} />
      </div>
      <p className="mx-auto mt-3 max-w-7xl text-sm leading-relaxed text-slate-600">
        {investigationCase.description}
      </p>
      <div className="mx-auto mt-4 max-w-7xl rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="flex items-start gap-2 text-sm">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium text-blue-900">Learning Objective:</span>
          <span className="text-blue-800">{investigationCase.investigationObjective}</span>
        </p>
      </div>
    </header>
  );
}
