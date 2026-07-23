import type { EventType, ForensicEvent } from '../types/case';

export type FeedbackVariant = 'correct' | 'falsePositive' | 'falseNegative';

const FALLBACK_REASONING: Record<FeedbackVariant, string> = {
  correct:
    'This event connects to the investigation thread — when reviewing selections, look for artefacts that link back to the user\'s actions on a specific platform or goal.',
  falsePositive:
    'This event resembles a relevant artefact on the surface but is not connected to the investigation objective. Re-read its description and compare it against the stated goal before deciding.',
  falseNegative:
    'You missed this event. Skim the description again and ask: could a forensic examiner explain this artefact as part of the same activity chain? If yes, it is likely relevant.',
};

const TYPE_FALLBACK_HINTS: Record<EventType, Partial<Record<FeedbackVariant, string>>> = {
  history: {
    correct:
      'History entries show where the browser actually landed — they are direct evidence of the user\'s navigation path and are commonly central to a timeline.',
    falsePositive:
      'History entries are easy to over-select. A page visit is only relevant if it is part of the investigation thread, not a casual side trip.',
    falseNegative:
      'Even without a search or cookie, a history entry can anchor a sequence when it shows the user arriving at a meaningful destination.',
  },
  search: {
    correct:
      'Search queries reveal intent — they are often the earliest signal of what a user is trying to accomplish and frequently start an investigation chain.',
    falsePositive:
      'Searches may look targeted but still be unrelated (e.g. casual research, work noise). Consider whether the query terms align with the investigation objective.',
    falseNegative:
      'Skim the query wording. Targeted or unusual searches often initiate an investigation thread even when no follow-up cookie or download is visible.',
  },
  cookie: {
    correct:
      'Cookie events confirm an authenticated session with a service. They are strong evidence the user actually logged in or accessed a protected resource.',
    falsePositive:
      'Cookies often persist between sessions and may reflect routine sign-ins, not investigation activity. Match the cookie against the investigation objective, not just the domain name.',
    falseNegative:
      'Cookie creation or refresh is a high-confidence marker of authentication to a specific service — it usually belongs in the investigation chain if the service itself is relevant.',
  },
  download: {
    correct:
      'Downloads create a persistent local artefact. They are often the pivot point in a data-exfiltration scenario and rarely appear without preceding searches or page views.',
    falsePositive:
      'Routine downloads (operating system images, software updates) can look suspicious but are normal background activity. Verify the file name and destination before selecting.',
    falseNegative:
      'A download is rarely accidental. If the user saved a file during the investigation window, this event almost always belongs in the chain.',
  },
};

export function getFallbackReasoning(
  event: ForensicEvent,
  variant: FeedbackVariant,
): string {
  const typeHint = TYPE_FALLBACK_HINTS[event.type]?.[variant];
  return typeHint ?? FALLBACK_REASONING[variant];
}

export function buildReasoningText(
  event: ForensicEvent,
  variant: FeedbackVariant,
): string {
  return event.explanation?.trim() || getFallbackReasoning(event, variant);
}
