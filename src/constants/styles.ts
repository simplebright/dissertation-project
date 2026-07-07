import type { Difficulty, EventType } from '../types/case';

export const DIFFICULTY_BADGE_STYLES: Record<Difficulty, string> = {
  Beginner: 'bg-edu-100 text-edu-800',
  Intermediate: 'bg-blue-100 text-blue-800',
  Advanced: 'bg-indigo-100 text-indigo-800',
};

export const EVENT_TYPE_BADGE_STYLES: Record<EventType, string> = {
  history: 'bg-edu-100 text-edu-800',
  search: 'bg-blue-100 text-blue-800',
  cookie: 'bg-indigo-100 text-indigo-800',
  download: 'bg-sky-100 text-sky-800',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  history: 'History',
  search: 'Search',
  cookie: 'Cookie',
  download: 'Download',
};

export const FEEDBACK_LIST_STYLES = {
  correct: {
    heading: 'text-emerald-800',
    item: 'rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 transition-colors duration-300',
  },
  incorrect: {
    heading: 'text-rose-800',
    item: 'rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 transition-colors duration-300',
  },
} as const;
