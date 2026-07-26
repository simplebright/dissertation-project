import type { ForensicEvent } from '../../types/case';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { EventTypeBadge } from '../case/EventTypeBadge';

/**
 * Subset of ForensicEvent that the card actually displays. The card never
 * renders `relationships`, `hints`, `explanation`, or any other
 * progressively-revealed information — those are surfaced exclusively through
 * the `HintPanel` so the student experiences the intended progression.
 */
export type EvidenceCardEvent = Pick<
  ForensicEvent,
  'id' | 'timestamp' | 'type' | 'description'
>;

interface EvidenceCardProps {
  event: EvidenceCardEvent;
  showTimestamp?: boolean;
}

export function EvidenceCard({
  event,
  showTimestamp = true,
}: EvidenceCardProps) {
  return (
    <article className="edu-card rounded-xl p-4 transition-all duration-300">
      <div className="flex flex-wrap items-center gap-2">
        {showTimestamp && (
          <time className="text-xs font-medium text-slate-500" dateTime={event.timestamp}>
            {formatTimestamp(event.timestamp)}
          </time>
        )}
        <EventTypeBadge type={event.type} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{event.description}</p>
    </article>
  );
}
