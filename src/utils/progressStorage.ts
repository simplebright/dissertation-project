import { TOTAL_CASE_COUNT } from '../data/caseRegistry';
import { PROGRESS_STORAGE_KEY } from '../constants/storage';
import type {
  CaseCompletion,
  DashboardStats,
  ProgressData,
} from '../types/progress';
import { isRecord } from './guards';

const emptyProgress: ProgressData = { completions: [] };

function isCaseCompletion(value: unknown): value is CaseCompletion {
  if (!isRecord(value)) {
    return false;
  }

  const baseValid =
    typeof value.caseId === 'string' &&
    typeof value.score === 'number' &&
    typeof value.completionTimeMs === 'number' &&
    typeof value.completedAt === 'string';

  if (!baseValid) {
    return false;
  }

  if (value.hintsUsed !== undefined && typeof value.hintsUsed !== 'number') {
    return false;
  }

  return true;
}

function isProgressData(value: unknown): value is ProgressData {
  if (!isRecord(value) || !Array.isArray(value.completions)) {
    return false;
  }

  return value.completions.every(isCaseCompletion);
}

export function getProgress(): ProgressData {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!stored) {
      return emptyProgress;
    }

    const parsed: unknown = JSON.parse(stored);
    return isProgressData(parsed) ? parsed : emptyProgress;
  } catch {
    return emptyProgress;
  }
}

export function saveCaseCompletion(completion: CaseCompletion): void {
  const progress = getProgress();
  const updated: ProgressData = {
    completions: [...progress.completions, completion],
  };

  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
}

function getLatestCompletionsByCase(
  completions: CaseCompletion[],
): CaseCompletion[] {
  const latestByCase = new Map<string, CaseCompletion>();

  for (const completion of completions) {
    const existing = latestByCase.get(completion.caseId);
    if (
      !existing ||
      new Date(completion.completedAt).getTime() >
        new Date(existing.completedAt).getTime()
    ) {
      latestByCase.set(completion.caseId, completion);
    }
  }

  return Array.from(latestByCase.values()).sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

export function getDashboardStats(): DashboardStats {
  const { completions } = getProgress();
  const completedCases = getLatestCompletionsByCase(completions);
  const completedCount = completedCases.length;

  if (completions.length === 0) {
    return {
      completedCases,
      completedCount,
      totalCases: TOTAL_CASE_COUNT,
      averageScore: 0,
      highestScore: 0,
      averageCompletionTimeMs: 0,
      progressPercent: 0,
    };
  }

  const totalScore = completions.reduce(
    (sum, completion) => sum + completion.score,
    0,
  );
  const totalTime = completions.reduce(
    (sum, completion) => sum + completion.completionTimeMs,
    0,
  );

  return {
    completedCases,
    completedCount,
    totalCases: TOTAL_CASE_COUNT,
    averageScore: Math.round(totalScore / completions.length),
    highestScore: Math.max(...completions.map((completion) => completion.score)),
    averageCompletionTimeMs: Math.round(totalTime / completions.length),
    progressPercent: Math.round((completedCount / TOTAL_CASE_COUNT) * 100),
  };
}
