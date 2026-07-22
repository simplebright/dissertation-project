import type { ExerciseMode } from '../types/exercise';
import { isExerciseMode } from './exerciseMode';
import { isRecord } from './guards';

const STORAGE_PREFIX = 'dissertation:evidence-selection:';

export interface PersistedEvidenceSelection {
  caseId: string;
  mode: ExerciseMode;
  selectedEvidenceIds: string[];
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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function loadPersistedSelection(
  caseId: string,
  knownEventIds: ReadonlySet<string>,
): PersistedEvidenceSelection | null {
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
    if (!isExerciseMode(parsed.mode)) {
      return null;
    }
    if (!isStringArray(parsed.selectedEvidenceIds)) {
      return null;
    }
    const filteredIds = parsed.selectedEvidenceIds.filter((id) =>
      knownEventIds.has(id),
    );
    return {
      caseId,
      mode: parsed.mode,
      selectedEvidenceIds: filteredIds,
    };
  } catch {
    return null;
  }
}

export function savePersistedSelection(value: PersistedEvidenceSelection): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_PREFIX + value.caseId, JSON.stringify(value));
  } catch {
    // Ignore quota / disabled-storage errors.
  }
}

export function clearPersistedSelection(caseId: string): void {
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