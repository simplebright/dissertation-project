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
  /**
   * Session-level interaction log captured during the attempt. Used for
   * educational analytics. Stored alongside the attempt in localStorage —
   * never sent off-device.
   */
  sessionLog?: InteractionEvent[];
  /**
   * Stage 3 — Cyber Kill Chain mapping accuracy 0..100. Populated when
   * the learner completes the Kill Chain stage; absent for older attempts.
   */
  killChainAccuracy?: number;
  /**
   * Stage 4 — whether the learner inferred the correct attack type.
   * `true`/`false` indicates a definitive answer; `null` indicates the
   * learner skipped or did not answer the stage.
   */
  attackInferenceCorrect?: boolean | null;
}

/** Recognised learner interaction events during a single exercise session. */
export type InteractionType =
  | 'evidence.selected'
  | 'evidence.removed'
  | 'hint.opened'
  | 'hint.used'
  | 'timeline.submitted';

/** Stage the interaction occurred in. */
export type InteractionStage = 'selection' | 'timeline';

export interface InteractionEvent {
  /** Discriminator for the kind of interaction. */
  type: InteractionType;
  /** ISO-8601 timestamp captured at the moment of interaction. */
  timestamp: string;
  /** Stage of the exercise the interaction belongs to. */
  stage: InteractionStage;
  /** Event ID involved (for evidence selected / removed / hint targets). */
  eventId?: string;
  /** Hint level revealed (1-based index) for hint.used. */
  hintLevel?: number;
  /** Total hints the learner has consumed so far in the session. */
  hintsUsedSoFar?: number;
  /** Total evidence currently selected (for selection-stage events). */
  totalSelected?: number;
  /** Optional free-form context for future analytics expansions. */
  metadata?: Record<string, string | number | boolean>;
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
  /**
   * Stage 3 — average Cyber Kill Chain accuracy across attempts that
   * recorded a `killChainAccuracy` value. Returns 0 when no attempts have
   * recorded one.
   */
  averageKillChainAccuracy: number;
  /**
   * Stage 4 — proportion of attempts where the learner inferred the
   * correct attack type, expressed as a percentage 0..100. Returns 0
   * when no attempts have recorded an answer.
   */
  attackInferenceAccuracy: number;
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
  /**
   * Stage 3 — average Cyber Kill Chain accuracy across attempts that
   * recorded a `killChainAccuracy` value. Returns 0 when no attempts have
   * recorded one.
   */
  averageKillChainAccuracy: number;
  /**
   * Stage 4 — proportion of attempts where the learner inferred the
   * correct attack type, expressed as a percentage 0..100. Returns 0
   * when no attempts have recorded an answer.
   */
  attackInferenceAccuracy: number;
  /**
   * The investigation stage learners performed worst on, computed from
   * the per-stage averages. `null` indicates no stage has enough data
   * to compare, or the learner performed equally across stages.
   */
  weakestStage: WeakestStageEntry | null;
}

/** Investigation stages that can be measured by the dashboard analytics. */
export type InvestigationStage =
  | 'Evidence Selection'
  | 'Timeline Ordering'
  | 'Kill Chain Mapping'
  | 'Attack Inference';

export interface WeakestStageEntry {
  stage: InvestigationStage;
  /** The stage's average accuracy, percentage 0..100. */
  accuracy: number;
  /** Per-attempt count that contributed to the stage's average. */
  sampleCount: number;
}
