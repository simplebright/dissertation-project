export type EventRelationshipType = 'before' | 'after' | 'related';

export interface EventRelationship {
  type: EventRelationshipType;
  targetEventId: string;
  label?: string;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type EventType = 'history' | 'search' | 'cookie' | 'download';

export type KillChainStage = 'Reconnaissance' | 'Delivery' | 'Exploitation' | 'Installation' | 'Actions';

export type AttackType = 'Phishing' | 'Malware Download' | 'Credential Theft' | 'Benign Activity';

export interface ForensicEvent {
  id: string;
  timestamp: string;
  type: EventType;
  description: string;
  correctOrder: number;
  isRelevant: boolean;
  killChainStage?: KillChainStage;
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
  investigationObjective: string;
}

export interface InvestigationCase extends CaseSummary {
  attackType: AttackType;
  events: ForensicEvent[];
}
