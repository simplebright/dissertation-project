import { useState } from 'react';
import type { ForensicEvent } from '../../types/case';

interface HintPanelProps {
  events: ForensicEvent[];
  totalAvailable: number;
  totalUsed: number;
  onUseHint: (eventId: string) => void;
  activeEventId: string | null;
  onSelectEvent: (eventId: string | null) => void;
}

export function HintPanel({
  events,
  totalAvailable,
  totalUsed,
  onUseHint,
  activeEventId,
  onSelectEvent,
}: HintPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const remaining = Math.max(totalAvailable - totalUsed, 0);
  const budgetExhausted = totalUsed >= totalAvailable;
  const activeEvent = events.find((event) => event.id === activeEventId) ?? null;
  const hintQueue = activeEvent?.hints ?? [];
  const revealedLevels = hintQueue.slice(0, totalUsed);

  const handleOpen = () => {
    if (budgetExhausted) {
      return;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    onSelectEvent(null);
  };

  const handleRevealNext = () => {
    if (!activeEvent || budgetExhausted) {
      return;
    }
    onUseHint(activeEvent.id);
  };

  return (
    <section
      aria-label="Progressive hints"
      className="fixed bottom-24 right-4 z-30 sm:bottom-28 sm:right-6"
    >
      {isOpen ? (
        <div className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-edu-200 bg-white shadow-xl shadow-blue-900/15 sm:w-96">
          <div className="flex items-center justify-between border-b border-edu-100 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-edu-600">
                Hint Panel
              </p>
              <p className="text-sm font-semibold text-edu-900">
                {totalUsed} / {totalAvailable} hints used
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close hint panel"
              className="rounded-full p-1.5 text-slate-500 transition-colors duration-300 hover:bg-edu-50 hover:text-edu-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edu-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4 p-4">
            <div>
              <label
                htmlFor="hint-event-select"
                className="text-xs font-medium text-slate-600"
              >
                Choose an event to get a hint
              </label>
              <select
                id="hint-event-select"
                value={activeEventId ?? ''}
                onChange={(event) =>
                  onSelectEvent(event.target.value || null)
                }
                className="mt-1 w-full rounded-lg border border-edu-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edu-500"
              >
                <option value="">Select an event…</option>
                {events.map((event, index) => (
                  <option key={event.id} value={event.id}>
                    Event {index + 1} — {event.type}
                  </option>
                ))}
              </select>
            </div>

            <div
              aria-live="polite"
              aria-label="Revealed hints"
              className="min-h-[3rem] space-y-2 rounded-xl bg-edu-50/70 p-3"
            >
              {revealedLevels.length === 0 ? (
                <p className="text-xs italic text-slate-500">
                  No hints revealed yet. Select an event and reveal the first
                  level below.
                </p>
              ) : (
                revealedLevels.map((hint, index) => (
                  <div key={`${activeEvent?.id}-${index}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-edu-600">
                      Hint level {index + 1}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {hint}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={handleRevealNext}
              disabled={!activeEvent || budgetExhausted}
              className="inline-flex w-full items-center justify-center rounded-xl bg-edu-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/15 transition-all duration-300 hover:bg-edu-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edu-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeEvent
                ? budgetExhausted
                  ? 'No hints remaining'
                  : `Reveal hint level ${revealedLevels.length + 1}`
                : 'Select an event first'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          disabled={budgetExhausted}
          aria-label={
            budgetExhausted
              ? 'Hints exhausted'
              : `Need help? ${remaining} hints remaining`
          }
          className="inline-flex items-center gap-2 rounded-2xl border border-edu-200 bg-white px-4 py-2.5 text-sm font-semibold text-edu-700 shadow-lg shadow-blue-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-edu-300 hover:bg-edu-50 hover:shadow-xl hover:shadow-blue-900/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edu-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span>Need Help?</span>
          <span className="rounded-full bg-edu-100 px-2 py-0.5 text-xs font-semibold text-edu-700">
            {remaining}/{totalAvailable}
          </span>
        </button>
      )}
    </section>
  );
}
