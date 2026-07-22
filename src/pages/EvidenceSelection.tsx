import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { ForensicEvent } from '../types/case';
import type { ExerciseMode } from '../types/exercise';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/PageLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EventTypeBadge } from '../components/case/EventTypeBadge';
import { getCaseById } from '../data/caseRegistry';
import {
  clearPersistedSelection,
  loadPersistedSelection,
  savePersistedSelection,
} from '../utils/evidenceSelectionStorage';
import { isExerciseMode } from '../utils/exerciseMode';

interface EvidencePanelProps {
  title: string;
  emptyMessage: string;
  eventIds: string[];
  eventsById: Record<string, ForensicEvent>;
  variant: 'available' | 'selected';
  onToggle: (eventId: string) => void;
}

interface IncomingState {
  mode: ExerciseMode;
  selectedEvidenceIds?: string[];
}

const PANEL_EMPTY_STYLES: Record<EvidencePanelProps['variant'], string> = {
  available:
    'border-2 border-dashed border-edu-200 bg-edu-50/60 text-slate-500',
  selected:
    'border-2 border-dashed border-emerald-200 bg-emerald-50/60 text-emerald-700',
};

const PANEL_HEADER_STYLES: Record<EvidencePanelProps['variant'], string> = {
  available: 'text-edu-900',
  selected: 'text-emerald-900',
};

const PANEL_BADGE_STYLES: Record<EvidencePanelProps['variant'], string> = {
  available: 'bg-edu-100 text-edu-800',
  selected: 'bg-emerald-100 text-emerald-800',
};

const ACTION_LABEL: Record<EvidencePanelProps['variant'], string> = {
  available: 'Select',
  selected: 'Remove',
};

const ACTION_ICON: Record<EvidencePanelProps['variant'], string> = {
  available: '+',
  selected: '−',
};

function EvidencePanel({
  title,
  emptyMessage,
  eventIds,
  eventsById,
  variant,
  onToggle,
}: EvidencePanelProps) {
  const isAvailable = variant === 'available';
  return (
    <Card as="section" className="flex h-full flex-col" aria-labelledby={`panel-${variant}`}>
      <div className="flex items-center justify-between">
        <h2
          id={`panel-${variant}`}
          className={`edu-section-title mb-0 ${PANEL_HEADER_STYLES[variant]}`}
        >
          {title}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PANEL_BADGE_STYLES[variant]}`}
        >
          {eventIds.length} {eventIds.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        {eventIds.length === 0 ? (
          <p
            className={`flex flex-1 items-center justify-center rounded-2xl px-4 py-12 text-center text-sm ${PANEL_EMPTY_STYLES[variant]}`}
          >
            {emptyMessage}
          </p>
        ) : (
          <ul className="flex flex-1 flex-col gap-3">
            {eventIds.map((id) => {
              const event = eventsById[id];
              if (!event) {
                return null;
              }
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onToggle(id)}
                    aria-pressed={!isAvailable}
                    aria-label={`${ACTION_LABEL[variant]} ${event.description}`}
                    className={`edu-card group flex w-full flex-col gap-2 rounded-xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isAvailable
                        ? 'hover:border-edu-300 focus-visible:ring-edu-500'
                        : 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-300 focus-visible:ring-emerald-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <EventTypeBadge type={event.type} />
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                          isAvailable
                            ? 'bg-edu-100 text-edu-700 group-hover:bg-edu-600 group-hover:text-white'
                            : 'bg-emerald-200 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white'
                        }`}
                        aria-hidden="true"
                      >
                        {ACTION_ICON[variant]}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {event.description}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}

export function EvidenceSelection() {
  const { caseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const investigationCase = caseId ? getCaseById(caseId) : undefined;

  const incomingState = useMemo<IncomingState | null>(() => {
    const state = location.state as { mode?: unknown; selectedEvidenceIds?: unknown } | null;
    if (!state || !isExerciseMode(state.mode)) {
      return null;
    }
    const ids = Array.isArray(state.selectedEvidenceIds)
      ? state.selectedEvidenceIds.filter(
          (id): id is string => typeof id === 'string',
        )
      : [];
    return { mode: state.mode, selectedEvidenceIds: ids };
  }, [location.state]);

  const eventsById = useMemo(() => {
    if (!investigationCase) {
      return {} as Record<string, ForensicEvent>;
    }
    return investigationCase.events.reduce<Record<string, ForensicEvent>>(
      (acc, event) => {
        acc[event.id] = event;
        return acc;
      },
      {},
    );
  }, [investigationCase]);

  const knownEventIds = useMemo(
    () => new Set(Object.keys(eventsById)),
    [eventsById],
  );

  const allEventIds = useMemo(
    () => investigationCase?.events.map((event) => event.id) ?? [],
    [investigationCase],
  );

  const restoreFromCache = useMemo(() => {
    if (!caseId) {
      return null;
    }
    return loadPersistedSelection(caseId, knownEventIds);
  }, [caseId, knownEventIds]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (incomingState?.selectedEvidenceIds) {
      return incomingState.selectedEvidenceIds.filter((id) =>
        knownEventIds.has(id),
      );
    }
    if (restoreFromCache) {
      return restoreFromCache.selectedEvidenceIds;
    }
    return [];
  });

  const [mode] = useState<ExerciseMode | null>(() => {
    if (incomingState) {
      return incomingState.mode;
    }
    if (restoreFromCache) {
      return restoreFromCache.mode;
    }
    return null;
  });

  const restoredFromCache =
    !incomingState?.selectedEvidenceIds?.length &&
    Boolean(restoreFromCache?.selectedEvidenceIds.length);

  useEffect(() => {
    if (!caseId || !mode) {
      return;
    }
    if (selectedIds.length === 0) {
      clearPersistedSelection(caseId);
      return;
    }
    savePersistedSelection({
      caseId,
      mode,
      selectedEvidenceIds: selectedIds,
    });
  }, [caseId, mode, selectedIds]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const availableIds = useMemo(
    () => allEventIds.filter((id) => !selectedIdSet.has(id)),
    [allEventIds, selectedIdSet],
  );

  if (!investigationCase) {
    return (
      <EmptyState
        title="Case not found"
        description="The selected case could not be loaded."
        actionLabel="Return to case selection"
        actionTo="/cases"
      />
    );
  }

  if (!mode) {
    return <Navigate to={`/exercise/${caseId}/mode`} replace />;
  }

  const toggleEvent = (eventId: string) => {
    setSelectedIds((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId],
    );
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleContinue = () => {
    navigate(`/exercise/${caseId}`, {
      state: { mode, selectedEvidenceIds: selectedIds },
    });
  };

  const handleBack = () => {
    navigate(`/exercise/${caseId}/mode`, {
      state: { mode, selectedEvidenceIds: selectedIds },
    });
  };

  const progressValue = Math.round(
    (selectedIds.length / Math.max(allEventIds.length, 1)) * 100,
  );

  const canContinue = selectedIds.length > 0;

  return (
    <main className="edu-page">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          label="Evidence Selection"
          title={investigationCase.title}
          description="Review the available evidence and click each card you believe is relevant to the investigation. Click a selected card again to remove it."
        />

        <div className="mt-8">
          <ProgressBar
            value={progressValue}
            label={`Selected ${selectedIds.length} evidence item${selectedIds.length === 1 ? '' : 's'}.`}
          />
        </div>

        {restoredFromCache && (
          <div
            role="status"
            className="mt-4 flex items-start gap-3 rounded-xl border border-edu-200 bg-edu-50/70 p-4 text-sm text-slate-700"
          >
            <span aria-hidden="true" className="text-base leading-none">↻</span>
            <div className="flex-1">
              <p className="font-semibold text-edu-900">
                Selection restored from your last session.
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Your choices are also saved locally so they survive a page refresh.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-edu-700 underline decoration-edu-300 underline-offset-4 transition-colors duration-300 hover:text-edu-900"
            >
              Clear selection
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <EvidencePanel
            title="Available Evidence"
            emptyMessage="All evidence items have been selected."
            eventIds={availableIds}
            eventsById={eventsById}
            variant="available"
            onToggle={toggleEvent}
          />
          <EvidencePanel
            title="Selected Evidence"
            emptyMessage="No evidence selected yet. Click cards on the left to add them."
            eventIds={selectedIds}
            eventsById={eventsById}
            variant="selected"
            onToggle={toggleEvent}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button onClick={handleBack} variant="secondary">
            Back to Mode Selection
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!canContinue}
          >
            Continue to Timeline
          </Button>
        </div>
      </div>
    </main>
  );
}