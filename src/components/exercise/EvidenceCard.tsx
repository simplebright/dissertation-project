import { useMemo } from 'react';
import type { ForensicEvent } from '../../types/case';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { EventTypeBadge } from '../case/EventTypeBadge';

export type EvidenceCardEvent = Pick<
  ForensicEvent,
  | 'id'
  | 'timestamp'
  | 'type'
  | 'description'
  | 'relationships'
  | 'hints'
  | 'visibleInAdvanced'
>;

interface EvidenceCardProps {
  event: EvidenceCardEvent;
  showTimestamp?: boolean;
  mode?: 'beginner' | 'advanced';
}

export function EvidenceCard({
  event,
  showTimestamp = true,
  mode = 'beginner',
}: EvidenceCardProps) {
  const relationshipTitle = useMemo(() => {
    if (!event.relationships?.length) {
      return null;
    }

    return event.relationships
      .map((relationship) => relationship.label ?? relationship.type)
      .join(' · ');
  }, [event.relationships]);

  const showAdvancedClues = mode === 'advanced';
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

      {showAdvancedClues && (
        <div className="mt-3 space-y-2">
          {relationshipTitle ? (
            <p className="text-xs font-medium text-slate-600">
              Context: {relationshipTitle}
            </p>
          ) : null}
          {event.hints?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
              {event.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </article>
  );
}
