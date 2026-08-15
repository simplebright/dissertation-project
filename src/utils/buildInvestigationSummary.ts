import type {
  AttackInferenceResult,
} from '../types/attackInferenceResult';
import type {
  EvidenceSelectionResult,
} from '../types/evidenceSelection';
import type { ForensicEvent, InvestigationCase } from '../types/case';
import type {
  KillChainAnswerResult,
  KillChainMappingFeedback,
} from '../types/killChainMapping';
import type {
  KillChainStage,
} from '../types/case';
import type {
  PositionFeedback,
} from '../types/timeline';
import type {
  TimelineAnswerResult,
} from '../types/timeline';

export interface InvestigationSummaryStep {
  /** 1-based stage index, in investigation order. */
  number: number;
  /** Short stage title. */
  title: string;
  /** Body text describing what was learned at this stage. */
  body: string;
}

export interface InvestigationSummary {
  /** The four connected reasoning steps. */
  steps: InvestigationSummaryStep[];
  /** Closing narrative that ties the four stages into a single forensic argument. */
  narrative: string;
  /** Expected attack type inferred from the investigation. */
  attackType: string;
}

const STAGE_ORDER: KillChainStage[] = [
  'Reconnaissance',
  'Delivery',
  'Exploitation',
  'Installation',
  'Actions',
];

function buildEventsById(
  investigationCase: InvestigationCase,
): Record<string, ForensicEvent> {
  const lookup: Record<string, ForensicEvent> = {};
  for (const event of investigationCase.events) {
    lookup[event.id] = event;
  }
  return lookup;
}

function getRelevantEvents(
  investigationCase: InvestigationCase,
): ForensicEvent[] {
  return [...investigationCase.events]
    .filter((event) => event.isRelevant)
    .sort((a, b) => a.correctOrder - b.correctOrder);
}

function summariseEventIndicators(
  events: readonly ForensicEvent[],
): string {
  const types = new Set<string>();
  let authenticationArtefacts = 0;
  let downloads = 0;
  let searches = 0;
  let historyVisits = 0;

  for (const event of events) {
    types.add(event.type);
    if (event.type === 'cookie') {
      authenticationArtefacts += 1;
    } else if (event.type === 'download') {
      downloads += 1;
    } else if (event.type === 'search') {
      searches += 1;
    } else if (event.type === 'history') {
      historyVisits += 1;
    }
  }

  const indicators: string[] = [];
  if (authenticationArtefacts > 0) {
    indicators.push(
      `${authenticationArtefacts} authentication artefact${
        authenticationArtefacts === 1 ? '' : 's'
      } (cookies/tokens)`,
    );
  }
  if (downloads > 0) {
    indicators.push(
      `${downloads} download${downloads === 1 ? '' : 's'}`,
    );
  }
  if (searches > 0) {
    indicators.push(
      `${searches} search${searches === 1 ? '' : 'es'} for known/login-related terms`,
    );
  }
  if (historyVisits > 0) {
    indicators.push(
      `${historyVisits} history visit${
        historyVisits === 1 ? '' : 's'
      } to authentication or recovery pages`,
    );
  }

  if (indicators.length === 0) {
    return 'a sparse set of relevant artefacts';
  }
  return indicators.join(', ');
}

function describeTimelineAnchors(
  investigationCase: InvestigationCase,
  timelineFeedback: readonly PositionFeedback[],
): string {
  const relevantEvents = getRelevantEvents(investigationCase);
  if (relevantEvents.length === 0) {
    return 'no chronological anchors';
  }

  const eventsById = buildEventsById(investigationCase);
  const firstCorrectPosition = timelineFeedback
    .filter((item) => item.isCorrect)
    .map((item) => item.position)
    .sort((a, b) => a - b)[0];

  const lastEvent = relevantEvents[relevantEvents.length - 1];
  const firstEvent = relevantEvents[0];

  const correctPositions = timelineFeedback.filter((item) => item.isCorrect);
  const correctionNote =
    correctPositions.length === relevantEvents.length
      ? `All ${correctPositions.length} chronological positions were placed correctly`
      : `${correctPositions.length} of ${relevantEvents.length} positions were placed correctly`;

  if (firstCorrectPosition === undefined) {
    return `${correctionNote}. The chain still resolves to the same narrative span: the earliest relevant event is "${
      firstEvent.description
    }" and the latest is "${lastEvent.description}".`;
  }

  const firstAnchor = eventsById[
    timelineFeedback.find((item) => item.position === firstCorrectPosition)
      ?.expectedEventId ?? ''
  ];

  const anchorText = firstAnchor
    ? ` Beginning with "${firstAnchor.description}", each subsequent artefact built on the cause established by the previous one.`
    : '';

  return `${correctionNote}.${anchorText}`;
}

function describeKillChainSpan(
  investigationCase: InvestigationCase,
  killChainFeedback: readonly KillChainMappingFeedback[],
): string {
  const stagesPresent = new Set<KillChainStage>();
  for (const event of investigationCase.events) {
    if (event.killChainStage && event.isRelevant) {
      stagesPresent.add(event.killChainStage);
    }
  }
  for (const feedback of killChainFeedback) {
    stagesPresent.add(feedback.expectedStage);
  }

  const orderedStages = STAGE_ORDER.filter((stage) => stagesPresent.has(stage));

  if (orderedStages.length === 0) {
    return 'no Kill Chain stages were identifiable';
  }
  if (orderedStages.length === 1) {
    return `the ${orderedStages[0]} stage`;
  }
  return `the ${orderedStages.slice(0, -1).join(', ')} and ${
    orderedStages[orderedStages.length - 1]
  } stages`;
}

function buildStepSelection(
  investigationCase: InvestigationCase,
  selection: EvidenceSelectionResult,
): InvestigationSummaryStep {
  const relevantEvents = getRelevantEvents(investigationCase);
  const indicators = summariseEventIndicators(relevantEvents);

  const learnerTally =
    selection.falsePositiveCount === 0 &&
    selection.falseNegativeCount === 0
      ? `Your triage was clean — every relevant artefact was identified and every distractor was correctly excluded.`
      : `Your triage recorded ${selection.truePositiveCount} true positive${
          selection.truePositiveCount === 1 ? '' : 's'
        } with ${selection.falsePositiveCount} false positive${
          selection.falsePositiveCount === 1 ? '' : 's'
        } and ${selection.falseNegativeCount} missed relevant event${
          selection.falseNegativeCount === 1 ? '' : 's'
        }.`;

  return {
    number: 1,
    title: 'Relevant Evidence Was Identified',
    body: `Of the ${selection.totalEvaluated} browser events in this case, ${selection.totalRelevant} were genuinely relevant: ${indicators}. ${learnerTally} The selected artefacts form the evidence base on which the rest of the investigation is built.`,
  };
}

function buildStepTimeline(
  investigationCase: InvestigationCase,
  timeline: TimelineAnswerResult,
): InvestigationSummaryStep {
  const anchors = describeTimelineAnchors(
    investigationCase,
    timeline.feedback,
  );

  return {
    number: 2,
    title: 'Evidence Was Reconstructed into a Timeline',
    body: `Ordering the artefacts reveals the cause→effect chain: ${anchors} Without temporal reconstruction, the relationship between the artefacts cannot be established; with it, each event becomes evidence of what preceded and what followed.`,
  };
}

function buildStepKillChain(
  investigationCase: InvestigationCase,
  killChainResult: KillChainAnswerResult | undefined,
): InvestigationSummaryStep {
  const feedback = killChainResult?.feedback ?? [];
  const span = describeKillChainSpan(investigationCase, feedback);

  return {
    number: 3,
    title: 'Events Were Mapped to Cyber Kill Chain Stages',
    body: `The reconstructed events span ${span} of the Cyber Kill Chain. Each artefact was assigned to the stage where it plays its role — Reconnaissance captures the intent, Delivery carries the lure, Exploitation triggers the attack, Installation persists it, and Actions represent follow-on activity. Together they describe an attacker's methodology rather than a list of disconnected events.`,
  };
}

function buildStepInference(
  investigationCase: InvestigationCase,
  attackInferenceResult: AttackInferenceResult | undefined,
): InvestigationSummaryStep {
  const attackType = attackInferenceResult?.expectedAttackType
    ?? investigationCase.attackType;

  const attackRationale: Record<string, string> = {
    Phishing:
      'the victim was lured to a deceptive login page and submitted credentials, but no payload was dropped or persistence established',
    'Malware Download':
      'a weaponised file was fetched from an untrusted source and persisted on the host',
    'Credential Theft':
      'authentication artefacts — session cookies, persistent auth tokens, password reset activity — are the dominant signal across the chain',
    'Benign Activity':
      'no coherent kill chain was present and the activity resembles ordinary browsing',
  };

  const rationale = attackRationale[attackType] ?? 'the forensic indicators align';

  return {
    number: 4,
    title: 'The Overall Attack Was Inferred',
    body: `Reading the four-stage picture together identifies the attack as ${attackType}: ${rationale}. The objective stated in the case ("${investigationCase.investigationObjective}") is the educational hypothesis this conclusion has to satisfy.`,
  };
}

function buildNarrative(
  investigationCase: InvestigationCase,
  attackInferenceResult: AttackInferenceResult | undefined,
  killChainResult: KillChainAnswerResult | undefined,
): string {
  const attackType = attackInferenceResult?.expectedAttackType
    ?? investigationCase.attackType;

  const relevantEvents = getRelevantEvents(investigationCase);
  const eventsById = buildEventsById(investigationCase);
  const firstAnchor =
    relevantEvents.length > 0 ? eventsById[relevantEvents[0].id] : undefined;
  const lastAnchor =
    relevantEvents.length > 0
      ? eventsById[relevantEvents[relevantEvents.length - 1].id]
      : undefined;

  const killChainFeedback = killChainResult?.feedback ?? [];
  const span = describeKillChainSpan(investigationCase, killChainFeedback);

  const sentenceParts: string[] = [];
  if (firstAnchor && lastAnchor && firstAnchor !== lastAnchor) {
    sentenceParts.push(
      `The investigation starts with "${firstAnchor.description}", proceeds through ${span}, and concludes with "${lastAnchor.description}".`,
    );
  } else if (firstAnchor) {
    sentenceParts.push(
      `The investigation pivots on "${firstAnchor.description}".`,
    );
  }

  const whyItSupportsByAttack: Record<string, string> = {
    Phishing:
      'The presence of a deceptive login page coupled with the absence of any Installation or follow-on Actions step is the signature of phishing: intent and exploitation, but no persistent compromise. The chain does not tell the story of malware staging or credential theft because the lure, not a payload, was the attacker\'s instrument.',
    'Malware Download':
      'The presence of an untrusted download combined with an Installation step is the signature of malware delivery: intent, lure, payload, and persistence. The chain does not tell the story of phishing because the artefact that lands on the host is a file, not a credential; it does not tell the story of credential theft because no authentication reset or auth-token rotation is observed.',
    'Credential Theft':
      'Authentication artefacts dominate the chain — the search-and-visit pattern around a login page, the issue of session cookies, and a follow-on password reset and persistent auth token. The chain does not tell the story of malware because no file is dropped, and it does not tell the story of phishing because the credentials are then reused (or pivoted from) in a way a single phishing lure would not produce.',
    'Benign Activity':
      'No coherent kill chain is observable and the artefacts do not connect into a single intent→exploitation→impact narrative. The reconstructed activity describes ordinary browsing rather than an attack.',
  };

  sentenceParts.push(whyItSupportsByAttack[attackType] ?? '');

  return sentenceParts.filter((part) => part.length > 0).join(' ');
}

export function buildInvestigationSummary(input: {
  investigationCase: InvestigationCase;
  selection: EvidenceSelectionResult;
  timeline: TimelineAnswerResult;
  killChainResult?: KillChainAnswerResult;
  attackInferenceResult?: AttackInferenceResult;
}): InvestigationSummary {
  const steps: InvestigationSummaryStep[] = [
    buildStepSelection(input.investigationCase, input.selection),
    buildStepTimeline(input.investigationCase, input.timeline),
    buildStepKillChain(input.investigationCase, input.killChainResult),
    buildStepInference(input.investigationCase, input.attackInferenceResult),
  ];

  const narrative = buildNarrative(
    input.investigationCase,
    input.attackInferenceResult,
    input.killChainResult,
  );

  return {
    steps,
    narrative,
    attackType:
      input.attackInferenceResult?.expectedAttackType ??
      input.investigationCase.attackType,
  };
}