import type { ForensicEvent } from '../../types/case';
import { EventTypeBadge } from '../case/EventTypeBadge';
import {
  buildReasoningText,
  type FeedbackVariant,
} from '../../utils/evidenceFeedbackReasoning';

interface EvidenceSelectionFeedbackProps {
  title: string;
  subtitle: string;
  guidance: string;
  items: ForensicEvent[];
  emptyMessage: string;
  variant: FeedbackVariant;
  ariaLabel: string;
}

interface HeaderCopy {
  heading: string;
  description: string;
}

const HEADER_COPY: Record<FeedbackVariant, HeaderCopy> = {
  correct: {
    heading: 'Why this event was relevant',
    description:
      'Forensic reasoning that confirms this artefact links to the investigation chain.',
  },
  falsePositive: {
    heading: 'Why this should NOT have been selected',
    description:
      'Forensic reasoning that explains why this artefact is treated as a distractor, not evidence.',
  },
  falseNegative: {
    heading: 'Why this SHOULD have been selected',
    description:
      'Forensic reasoning that explains why this artefact belongs in the investigation chain.',
  },
};

const HEADING_STYLES: Record<FeedbackVariant, string> = {
  correct: 'text-emerald-800',
  falsePositive: 'text-rose-800',
  falseNegative: 'text-amber-800',
};

const BANNER_STYLES: Record<FeedbackVariant, string> = {
  correct: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  falsePositive: 'bg-rose-50 border-rose-200 text-rose-800',
  falseNegative: 'bg-amber-50 border-amber-200 text-amber-800',
};

const ITEM_STYLES: Record<FeedbackVariant, string> = {
  correct:
    'rounded-xl border border-emerald-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm shadow-emerald-900/5',
  falsePositive:
    'rounded-xl border border-rose-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm shadow-rose-900/5',
  falseNegative:
    'rounded-xl border border-amber-200/80 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm shadow-amber-900/5',
};

const REASON_BORDER_STYLES: Record<FeedbackVariant, string> = {
  correct: 'border-emerald-400 bg-emerald-50/70',
  falsePositive: 'border-rose-400 bg-rose-50/70',
  falseNegative: 'border-amber-400 bg-amber-50/70',
};

const REASON_LABEL_STYLES: Record<FeedbackVariant, string> = {
  correct: 'text-emerald-700',
  falsePositive: 'text-rose-700',
  falseNegative: 'text-amber-700',
};

const REASON_BODY_STYLES: Record<FeedbackVariant, string> = {
  correct: 'text-emerald-900',
  falsePositive: 'text-rose-900',
  falseNegative: 'text-amber-900',
};

export function EvidenceSelectionFeedback({
  title,
  subtitle,
  guidance,
  items,
  emptyMessage,
  variant,
  ariaLabel,
}: EvidenceSelectionFeedbackProps) {
  const header = HEADER_COPY[variant];
  return (
    <section className="mt-8" aria-label={ariaLabel}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={`text-sm font-semibold uppercase tracking-wide ${HEADING_STYLES[variant]}`}>
          {title}
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            variant === 'correct'
              ? 'bg-emerald-100 text-emerald-700'
              : variant === 'falsePositive'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
          }`}
        >
          {items.length}
        </span>
      </div>
      <p className={`mt-1 text-xs leading-relaxed ${HEADING_STYLES[variant]} opacity-80`}>
        {subtitle}
      </p>

      <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs leading-relaxed italic text-slate-600">
        <span className="font-semibold not-italic text-slate-700">Pedagogical note: </span>
        {guidance}
      </p>

      {items.length === 0 ? (
        <div
          className={`mt-3 rounded-xl border border-dashed px-4 py-4 text-center text-xs italic ${BANNER_STYLES[variant]}`}
        >
          {emptyMessage}
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((event) => {
            const reasoningText = buildReasoningText(event, variant);
            const usesScenarioExplanation = Boolean(event.explanation?.trim());
            return (
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
                <div
                  className={`mt-3 rounded-lg border-l-4 px-3 py-2 ${REASON_BORDER_STYLES[variant]}`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider ${REASON_LABEL_STYLES[variant]}`}
                  >
                    {header.heading}
                    {usesScenarioExplanation && (
                      <span className="ml-2 rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-slate-600">
                        from scenario
                      </span>
                    )}
                  </p>
                  <p className={`mt-1 text-xs leading-relaxed ${REASON_BODY_STYLES[variant]}`}>
                    {reasoningText}
                  </p>
                  <p className={`mt-1 text-[10px] italic opacity-75 ${REASON_BODY_STYLES[variant]}`}>
                    {header.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
