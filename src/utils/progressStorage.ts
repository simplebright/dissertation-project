import { TOTAL_CASE_COUNT } from '../data/caseRegistry';
import { getCaseById } from '../data/caseRegistry';
import { PROGRESS_STORAGE_KEY } from '../constants/storage';
import type {
  AttemptHistoryEntry,
  AttemptRecord,
  DashboardStats,
  LearningInsights,
  ProgressData,
} from '../types/progress';
import { isRecord } from './guards';

const emptyProgress: ProgressData = { attempts: [] };

function isAttemptRecord(value: unknown): value is AttemptRecord {
  if (!isRecord(value)) {
    return false;
  }

  const baseValid =
    typeof value.caseId === 'string' &&
    typeof value.mode === 'string' &&
    typeof value.score === 'number' &&
    typeof value.accuracy === 'number' &&
    typeof value.completionTime === 'number' &&
    typeof value.hintsUsed === 'number' &&
    typeof value.mistakes === 'number' &&
    typeof value.confidence === 'number' &&
    typeof value.completedAt === 'string';

  if (!baseValid) {
    return false;
  }

  return true;
}

function isProgressData(value: unknown): value is ProgressData {
  if (!isRecord(value) || !Array.isArray(value.attempts)) {
    return false;
  }

  return value.attempts.every(isAttemptRecord);
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function migrateLegacyProgress(stored: unknown): ProgressData {
  if (isProgressData(stored)) {
    return stored;
  }

  if (isRecord(stored) && Array.isArray(stored.completions)) {
    const attempts: AttemptRecord[] = stored.completions
      .filter((entry) =>
        isRecord(entry) &&
        typeof entry.caseId === 'string' &&
        typeof entry.score === 'number' &&
        typeof entry.completionTimeMs === 'number' &&
        typeof entry.completedAt === 'string',
      )
      .map((completion) => {
        const record = completion as {
          caseId: string;
          score: number;
          completionTimeMs: number;
          completedAt: string;
          hintsUsed?: number;
        };

        const score = toNumber(record.score);
        const accuracy = Math.min(Math.max(score / 100, 0), 1);
        const completionTime = toNumber(record.completionTimeMs);

        return {
          caseId: record.caseId,
          mode: 'practice',
          score,
          accuracy,
          completionTime,
          hintsUsed: toNumber(record.hintsUsed),
          mistakes: 0,
          confidence: 0,
          completedAt: record.completedAt,
        };
      });

    if (attempts.length > 0) {
      return { attempts };
    }
  }

  return emptyProgress;
}

export function getProgress(): ProgressData {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!stored) {
      return emptyProgress;
    }

    const parsed: unknown = JSON.parse(stored);
    return migrateLegacyProgress(parsed);
  } catch {
    return emptyProgress;
  }
}

export function saveAttempt(attempt: AttemptRecord): void {
  const progress = getProgress();
  const updated: ProgressData = {
    attempts: [...progress.attempts, attempt],
  };

  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
}

function getLatestAttemptsByCase(
  attempts: AttemptRecord[],
): AttemptRecord[] {
  const latestByCase = new Map<string, AttemptRecord>();

  for (const attempt of attempts) {
    const existing = latestByCase.get(attempt.caseId);
    if (
      !existing ||
      new Date(attempt.completedAt).getTime() >
        new Date(existing.completedAt).getTime()
    ) {
      latestByCase.set(attempt.caseId, attempt);
    }
  }

  return Array.from(latestByCase.values()).sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

export function getDashboardStats(): DashboardStats {
  const { attempts } = getProgress();
  const completedCases = getLatestAttemptsByCase(attempts);
  const completedCount = completedCases.length;

  if (attempts.length === 0) {
    return {
      completedCases,
      completedCount,
      totalCases: TOTAL_CASE_COUNT,
      averageScore: 0,
      highestScore: 0,
      averageCompletionTime: 0,
      averageAccuracy: 0,
      averageHintsUsed: 0,
      averageConfidence: 0,
      progressPercent: 0,
    };
  }

  const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const totalTime = attempts.reduce(
    (sum, attempt) => sum + attempt.completionTime,
    0,
  );
  const totalAccuracy = attempts.reduce(
    (sum, attempt) => sum + attempt.accuracy,
    0,
  );
  const totalHints = attempts.reduce(
    (sum, attempt) => sum + attempt.hintsUsed,
    0,
  );
  const totalConfidence = attempts.reduce(
    (sum, attempt) => sum + attempt.confidence,
    0,
  );

  return {
    completedCases,
    completedCount,
    totalCases: TOTAL_CASE_COUNT,
    averageScore: Math.round(totalScore / attempts.length),
    highestScore: Math.max(...attempts.map((attempt) => attempt.score)),
    averageCompletionTime: Math.round(totalTime / attempts.length),
    averageAccuracy: totalAccuracy / attempts.length,
    averageHintsUsed: totalHints / attempts.length,
    averageConfidence: totalConfidence / attempts.length,
    progressPercent: Math.round((completedCount / TOTAL_CASE_COUNT) * 100),
  };
}

export function getAttemptHistory(): AttemptHistoryEntry[] {
  const { attempts } = getProgress();

  return [...attempts]
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )
    .map((attempt, index) => ({
      attemptId: `${attempt.caseId}-${new Date(attempt.completedAt).getTime()}-${index}`,
      caseId: attempt.caseId,
      caseTitle: getCaseById(attempt.caseId)?.title ?? attempt.caseId,
      mode: attempt.mode,
      score: attempt.score,
      completionTime: attempt.completionTime,
      completedAt: attempt.completedAt,
    }));
}

export function getLearningInsights(): LearningInsights {
  const { attempts } = getProgress();

  if (attempts.length === 0) {
    return {
      mostCommonMistakes: [],
      averageScore: 0,
      improvementDelta: null,
    };
  }

  const categoryCounts = new Map<string, number>();
  for (const attempt of attempts) {
    const details = attempt.mistakeDetails;
    if (!Array.isArray(details)) {
      continue;
    }
    for (const detail of details) {
      if (isRecord(detail) && typeof detail.category === 'string') {
        categoryCounts.set(
          detail.category,
          (categoryCounts.get(detail.category) ?? 0) + 1,
        );
      }
    }
  }

  const mostCommonMistakes = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const averageScore = Math.round(totalScore / attempts.length);

  const sortedByDate = [...attempts].sort(
    (a, b) =>
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
  );

  const half = Math.max(1, Math.floor(sortedByDate.length / 2));
  const firstHalf = sortedByDate.slice(0, half);
  const secondHalf = sortedByDate.slice(half);

  let improvementDelta: number | null = null;
  if (secondHalf.length > 0) {
    const firstAvg =
      firstHalf.reduce((sum, attempt) => sum + attempt.score, 0) /
      firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, attempt) => sum + attempt.score, 0) /
      secondHalf.length;
    improvementDelta = Math.round(secondAvg - firstAvg);
  }

  return {
    mostCommonMistakes,
    averageScore,
    improvementDelta,
  };
}
