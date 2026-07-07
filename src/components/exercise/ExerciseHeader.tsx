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
    </header>
  );
}
