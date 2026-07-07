import type { Difficulty } from '../../types/case';
import { DIFFICULTY_BADGE_STYLES } from '../../constants/styles';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${DIFFICULTY_BADGE_STYLES[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
