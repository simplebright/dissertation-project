export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type EventType = 'history' | 'search' | 'cookie' | 'download';

export interface ForensicEvent {
  id: string;
  timestamp: string;
  type: EventType;
  description: string;
  correctOrder: number;
  explanation: string;
}

export interface CaseSummary {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
}

export interface InvestigationCase extends CaseSummary {
  events: ForensicEvent[];
}
