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
  /** Stage 1 — evidence selection accuracy 0..100. */
  selectionAccuracy: number;
  /** Stage 1 — event IDs selected but not relevant. */
  selectionFPIds: string[];
  /** Stage 1 — event IDs relevant but not selected. */
  selectionFNIds: string[];
}

export type ConfidenceLevel = 1 | 2 | 3;

export const CONFIDENCE_OPTIONS: {
  value: ConfidenceLevel;
  label: string;
}[] = [
  { value: 1, label: 'Guessing' },
  { value: 2, label: 'Somewhat confident' },
  { value: 3, label: 'Very confident' },
];

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
  averageSelectionAccuracy: number;
}

export interface AttemptHistoryEntry {
  attemptId: string;
  caseId: string;
  caseTitle: string;
  mode: AttemptRecord['mode'];
  score: number;
  completionTime: number;
  completedAt: string;
}

export interface SelectionErrorEntry {
  eventId: string;
  count: number;
  type: 'FP' | 'FN';
}

export interface LearningInsights {
  mostCommonMistakes: { category: string; count: number }[];
  averageScore: number;
  improvementDelta: number | null;
  averageConfidence: number | null;
  ratedAttemptCount: number;
  averageSelectionAccuracy: number;
  averageSelectionFP: number;
  averageSelectionFN: number;
  mostCommonSelectionErrors: SelectionErrorEntry[];
}
