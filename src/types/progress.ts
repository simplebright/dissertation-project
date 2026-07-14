export interface AttemptRecord {
  caseId: string;
  mode: 'practice' | 'assessment';
  score: number;
  accuracy: number;
  completionTime: number;
  hintsUsed: number;
  mistakes: number;
  confidence: number;
  completedAt: string;
  mistakeDetails?: import('./mistake').MistakeRecord[];
}

export interface ProgressData {
  attempts: AttemptRecord[];
}

export interface DashboardStats {
  completedCases: AttemptRecord[];
  completedCount: number;
  totalCases: number;
  averageScore: number;
  highestScore: number;
  averageCompletionTime: number;
  averageAccuracy: number;
  averageHintsUsed: number;
  averageConfidence: number;
  progressPercent: number;
}
