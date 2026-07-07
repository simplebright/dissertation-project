import type { EventType } from '../../types/case';
import {
  EVENT_TYPE_BADGE_STYLES,
  EVENT_TYPE_LABELS,
} from '../../constants/styles';

interface EventTypeBadgeProps {
  type: EventType;
}

export function EventTypeBadge({ type }: EventTypeBadgeProps) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${EVENT_TYPE_BADGE_STYLES[type]}`}
    >
      {EVENT_TYPE_LABELS[type]}
    </span>
  );
}
