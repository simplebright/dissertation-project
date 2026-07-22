export type EventRelationshipType = 'before' | 'after' | 'related';

export interface EventRelationship {
  type: EventRelationshipType;
  targetEventId: string;
  label?: string;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type EventType = 'history' | 'search' | 'cookie' | 'download';

export interface ForensicEvent {
  id: string;
  timestamp: string;
  type: EventType;
  description: string;
  correctOrder: number;
  isRelevant: boolean;
  explanation?: string;
  relationships?: EventRelationship[];
  hints?: string[];
  visibleInAdvanced?: boolean;
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
