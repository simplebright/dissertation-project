import type { ForensicEvent } from '../types/case';

export function buildEventsById(
  events: ForensicEvent[],
): Record<string, ForensicEvent> {
  return Object.fromEntries(events.map((event) => [event.id, event]));
}
