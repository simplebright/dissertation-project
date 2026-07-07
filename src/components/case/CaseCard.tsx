import type { CaseSummary } from '../../types/case';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DifficultyBadge } from './DifficultyBadge';

interface CaseCardProps {
  caseSummary: CaseSummary;
}

export function CaseCard({ caseSummary }: CaseCardProps) {
  const { id, title, difficulty, description } = caseSummary;

  return (
    <Card as="article" hover className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-edu-900">{title}</h2>
        <DifficultyBadge difficulty={difficulty} />
      </div>
      <p className="mt-4 flex-1 leading-relaxed text-slate-600">{description}</p>
      <div className="mt-6">
        <Button to={`/exercise/${id}/mode`} className="w-full sm:w-auto">
          Start Case
        </Button>
      </div>
    </Card>
  );
}
