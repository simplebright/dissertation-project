import type { ForensicEvent } from '../../types/case';
import { EventTypeBadge } from '../case/EventTypeBadge';

interface EvidenceSelectionFeedbackProps {
  title: string;
  subtitle: string;
  items: ForensicEvent[];
  emptyMessage: string;
  variant: 'correct' | 'incorrect';
  ariaLabel: string;
}

const HEADING_STYLES = {
  correct: 'text-emerald-800',
  incorrect: 'text-rose-800',
};

const BANNER_STYLES = {
  correct: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  incorrect: 'bg-rose-50 border-rose-200 text-rose-800',
};

const ITEM_STYLES = {
  correct:
    'rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-800 transition-colors duration-300',
  incorrect:
    'rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm text-slate-800 transition-colors duration-300',
};

export function EvidenceSelectionFeedback({
  title,
  subtitle,
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
      <p className={`mt-1 text-xs ${HEADING_STYLES[variant]} opacity-75`}>
        {subtitle}
      </p>

      {items.length === 0 ? (
        <div
          className={`mt-3 rounded-xl border border-dashed px-4 py-4 text-center text-xs italic ${BANNER_STYLES[variant]}`}
        >
          {emptyMessage}
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-3" aria-label={ariaLabel}>
          {items.map((event) => (
            <li key={event.id} className={ITEM_STYLES[variant]}>
              <div className="flex items-center justify-between gap-3">
                <EventTypeBadge type={event.type} />
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {event.id}
                </span>
              </div>
              <p className="mt-2 leading-relaxed text-slate-700">
                {event.description}
              </p>
              {event.explanation && (
                <div
                  className={`mt-3 rounded-lg border-l-2 px-3 py-2 ${
                    variant === 'correct'
                      ? 'border-emerald-400 bg-emerald-50/60'
                      : 'border-rose-400 bg-rose-50/60'
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      variant === 'correct'
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    Why {variant === 'correct' ? 'relevant' : 'not relevant'}
                  </p>
                  <p
                    className={`mt-1 text-xs leading-relaxed ${
                      variant === 'correct'
                        ? 'text-emerald-800'
                        : 'text-rose-800'
                    }`}
                  >
                    {event.explanation}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}