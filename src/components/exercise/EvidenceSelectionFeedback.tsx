import type { ForensicEvent } from '../../types/case';
import { EventTypeBadge } from '../case/EventTypeBadge';

interface EvidenceSelectionFeedbackProps {
  title: string;
  items: ForensicEvent[];
  emptyMessage: string;
  variant: 'correct' | 'incorrect';
  ariaLabel: string;
}

const HEADING_STYLES = {
  correct: 'text-emerald-800',
  incorrect: 'text-rose-800',
};

const ITEM_STYLES = {
  correct:
    'rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 transition-colors duration-300',
  incorrect:
    'rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 transition-colors duration-300',
};

export function EvidenceSelectionFeedback({
  title,
  items,
  emptyMessage,
  variant,
  ariaLabel,
}: EvidenceSelectionFeedbackProps) {
  return (
    <div className="mt-6">
      <h3 className={`text-sm font-semibold ${HEADING_STYLES[variant]}`}>
        {title}
      </h3>
      {items.length === 0 ? (
        <p
          className={`mt-2 rounded-xl border border-dashed px-4 py-3 text-xs italic ${
            variant === 'correct'
              ? 'border-emerald-200 bg-emerald-50/40 text-emerald-700'
              : 'border-rose-200 bg-rose-50/40 text-rose-700'
          }`}
        >
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2" aria-label={ariaLabel}>
          {items.map((event) => (
            <li key={event.id} className={ITEM_STYLES[variant]}>
              <div className="flex items-center justify-between gap-3">
                <EventTypeBadge type={event.type} />
                <span className="text-xs uppercase tracking-wide opacity-70">
                  {event.id}
                </span>
              </div>
              <p className="mt-2 leading-relaxed">{event.description}</p>
              {event.explanation && (
                <p className="mt-2 text-xs leading-relaxed opacity-80">
                  {event.explanation}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}