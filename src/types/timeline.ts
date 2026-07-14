export interface PositionFeedback {
  position: number;
  placedEventId: string | null;
  expectedEventId: string;
  isCorrect: boolean;
  headline: string;
  explanation: string;
}

export interface TimelineAnswerResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  isComplete: boolean;
  feedback: PositionFeedback[];
  summary: string;
  mistakes: import('./mistake').MistakeRecord[];
}
