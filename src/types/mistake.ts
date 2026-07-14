import type { EventType } from './case';

export type MistakeCategory =
  | 'event ordering'
  | 'event sequencing'
  | 'placed too early'
  | 'placed too late'
  | 'empty slot'
  | 'event type mismatch'
  | 'download sequencing'
  | 'search sequencing'
  | 'cookie sequencing'
  | 'history sequencing';

export interface MistakeRecord {
  eventId: string;
  position: number;
  expectedEventId: string | null;
  category: MistakeCategory;
  message: string;
}

export const TYPE_SEQUENCING_CATEGORY: Record<EventType, MistakeCategory> = {
  download: 'download sequencing',
  search: 'search sequencing',
  cookie: 'cookie sequencing',
  history: 'history sequencing',
};