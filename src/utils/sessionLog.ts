import type {
  InteractionEvent,
  InteractionStage,
  InteractionType,
} from '../types/progress';
import { isRecord } from './guards';

const STORAGE_PREFIX = 'dissertation:session-log:';

interface PersistedSessionLog {
  caseId: string;
  startedAt: string;
  events: InteractionEvent[];
}

function getStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function createSessionLog(caseId: string): PersistedSessionLog {
  return {
    caseId,
    startedAt: new Date().toISOString(),
    events: [],
  };
}

function persistLog(log: PersistedSessionLog): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_PREFIX + log.caseId, JSON.stringify(log));
  } catch {
    // Ignore quota / disabled-storage errors.
  }
}

export function loadSessionLog(caseId: string): PersistedSessionLog | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(STORAGE_PREFIX + caseId);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return null;
    }
    if (parsed.caseId !== caseId) {
      return null;
    }
    if (typeof parsed.startedAt !== 'string' || !Array.isArray(parsed.events)) {
      return null;
    }
    return {
      caseId,
      startedAt: parsed.startedAt,
      events: parsed.events.filter(isInteractionEvent),
    };
  } catch {
    return null;
  }
}

function isInteractionEvent(value: unknown): value is InteractionEvent {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.type !== 'string') {
    return false;
  }
  if (typeof value.timestamp !== 'string') {
    return false;
  }
  if (value.stage !== 'selection' && value.stage !== 'timeline') {
    return false;
  }
  if (
    value.eventId !== undefined &&
    typeof value.eventId !== 'string'
  ) {
    return false;
  }
  if (
    value.hintLevel !== undefined &&
    (typeof value.hintLevel !== 'number' || !Number.isFinite(value.hintLevel))
  ) {
    return false;
  }
  if (
    value.hintsUsedSoFar !== undefined &&
    (typeof value.hintsUsedSoFar !== 'number' ||
      !Number.isFinite(value.hintsUsedSoFar))
  ) {
    return false;
  }
  if (
    value.totalSelected !== undefined &&
    (typeof value.totalSelected !== 'number' ||
      !Number.isFinite(value.totalSelected))
  ) {
    return false;
  }
  return true;
}

export function clearSessionLog(caseId: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(STORAGE_PREFIX + caseId);
  } catch {
    // Ignore.
  }
}

export interface RecordInteractionInput {
  type: InteractionType;
  stage: InteractionStage;
  eventId?: string;
  hintLevel?: number;
  hintsUsedSoFar?: number;
  totalSelected?: number;
  metadata?: Record<string, string | number | boolean>;
}

export function recordInteraction(
  log: PersistedSessionLog,
  input: RecordInteractionInput,
): PersistedSessionLog {
  const event: InteractionEvent = {
    type: input.type,
    timestamp: new Date().toISOString(),
    stage: input.stage,
  };
  if (input.eventId !== undefined) {
    event.eventId = input.eventId;
  }
  if (input.hintLevel !== undefined) {
    event.hintLevel = input.hintLevel;
  }
  if (input.hintsUsedSoFar !== undefined) {
    event.hintsUsedSoFar = input.hintsUsedSoFar;
  }
  if (input.totalSelected !== undefined) {
    event.totalSelected = input.totalSelected;
  }
  if (input.metadata) {
    event.metadata = input.metadata;
  }
  const updated: PersistedSessionLog = {
    ...log,
    events: [...log.events, event],
  };
  persistLog(updated);
  return updated;
}

export function getSessionLogEvents(
  log: PersistedSessionLog,
): InteractionEvent[] {
  return log.events;
}

export type { PersistedSessionLog };
