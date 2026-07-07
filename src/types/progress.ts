export interface CaseCompletion {
  caseId: string;
  score: number;
  completionTimeMs: number;
  completedAt: string;
}

export interface ProgressData {
  completions: CaseCompletion[];
}

export interface DashboardStats {
  completedCases: CaseCompletion[];
  completedCount: number;
  totalCases: number;
  averageScore: number;
  highestScore: number;
  averageCompletionTimeMs: number;
  progressPercent: number;
}
