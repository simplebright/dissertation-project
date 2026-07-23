import { HINT_BUDGET } from '../constants/hints';
import { isRecord } from './guards';

const STORAGE_PREFIX = 'dissertation:hint-budget:';

interface PersistedHintState {
  caseId: string;
  hintsUsed: number;
  selectionHintsRevealed: number;
  updatedAt: string;
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

export function loadHintState(
  caseId: string,
): { hintsUsed: number; selectionHintsRevealed: number } | null {
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
    const hintsUsed =
      typeof parsed.hintsUsed === 'number' && Number.isFinite(parsed.hintsUsed)
        ? Math.max(0, Math.min(Math.floor(parsed.hintsUsed), HINT_BUDGET))
        : 0;
    const selectionHintsRevealed =
      typeof parsed.selectionHintsRevealed === 'number' &&
      Number.isFinite(parsed.selectionHintsRevealed)
        ? Math.max(
            0,
            Math.min(Math.floor(parsed.selectionHintsRevealed), HINT_BUDGET),
          )
        : 0;
    return { hintsUsed, selectionHintsRevealed };
  } catch {
    return null;
  }
}

export function saveHintState(
  caseId: string,
  hintsUsed: number,
  selectionHintsRevealed: number,
): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    const value: PersistedHintState = {
      caseId,
      hintsUsed: Math.max(0, Math.min(Math.floor(hintsUsed), HINT_BUDGET)),
      selectionHintsRevealed: Math.max(
        0,
        Math.min(Math.floor(selectionHintsRevealed), HINT_BUDGET),
      ),
      updatedAt: new Date().toISOString(),
    };
    storage.setItem(STORAGE_PREFIX + caseId, JSON.stringify(value));
  } catch {
    // Ignore quota / disabled-storage errors.
  }
}

export function clearHintState(caseId: string): void {
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
