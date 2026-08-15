import type {
  AttackType,
  ForensicEvent,
  InvestigationCase,
  KillChainStage,
} from '../types/case';
import type {
  AttackInferenceEvidenceStep,
  AttackInferenceResult,
} from '../types/attackInferenceResult';

const STAGE_ORDER: KillChainStage[] = [
  'Reconnaissance',
  'Delivery',
  'Exploitation',
  'Installation',
  'Actions',
];

function getRelevantEvents(
  investigationCase: InvestigationCase,
): ForensicEvent[] {
  return [...investigationCase.events]
    .filter((event) => event.isRelevant)
    .sort((a, b) => a.correctOrder - b.correctOrder);
}

function buildEvidenceSequence(
  investigationCase: InvestigationCase,
): AttackInferenceEvidenceStep[] {
  return getRelevantEvents(investigationCase).map((event, index) => ({
    order: index + 1,
    eventId: event.id,
    stage: event.killChainStage ?? null,
    description: event.description,
    explanation: event.explanation ?? '',
  }));
}

function summariseStagePresence(
  events: readonly ForensicEvent[],
): KillChainStage[] {
  const present = new Set<KillChainStage>();
  for (const event of events) {
    if (event.killChainStage) {
      present.add(event.killChainStage);
    }
  }
  return STAGE_ORDER.filter((stage) => present.has(stage));
}

function buildEvidenceWalkthrough(
  events: readonly AttackInferenceEvidenceStep[],
): string {
  if (events.length === 0) {
    return 'No relevant events were available to evaluate the attack type.';
  }

  return events
    .map((step) => {
      const stageLabel = step.stage ? `${step.stage} — ` : '';
      return `${step.order}. ${stageLabel}${step.description}${
        step.explanation ? ` (${step.explanation})` : ''
      }`;
    })
    .join(' ');
}

function describePatternForAttackType(
  attackType: AttackType,
  stagesPresent: KillChainStage[],
): string {
  const stageSet = new Set(stagesPresent);
  const has = (stage: KillChainStage) => stageSet.has(stage);

  switch (attackType) {
    case 'Phishing':
      return (
        `Phishing is the most likely classification when the evidence concentrates on ` +
        `${has('Reconnaissance') ? 'Reconnaissance ' : ''}` +
        `${has('Delivery') ? 'Delivery ' : ''}` +
        `${has('Exploitation') ? 'Exploitation ' : ''}` +
        `stages — the victim is lured to a deceptive login page, submits credentials, and the chain stops ` +
        `before any payload is dropped or persistent installation occurs. ` +
        `Indicators include referrers from email or messaging links, atypical login-page visits, and short-lived ` +
        `session cookies issued purely for the phishing domain.`
      );
    case 'Malware Download':
      return (
        `Malware Download is the most likely classification when the evidence chain includes an explicit ` +
        `${has('Delivery') ? 'Delivery ' : ''}` +
        `${has('Installation') ? 'Installation ' : ''}` +
        `step — a weaponised file is fetched from an attacker-controlled source and then persisted on the host. ` +
        `Indicators include downloads from suspicious URLs, executable or macro-bearing file types, and signature ` +
        `or hash artefacts consistent with payload staging.`
      );
    case 'Credential Theft':
      return (
        `Credential Theft is the most likely classification when the evidence shows a full chain from ` +
        `${has('Reconnaissance') ? 'Reconnaissance ' : ''}` +
        `${has('Delivery') ? 'Delivery ' : ''}` +
        `${has('Exploitation') ? 'Exploitation ' : ''}` +
        `${has('Installation') ? 'Installation ' : ''}` +
        `stages, with authentication artefacts (session cookies, persistent auth tokens, password resets) as the ` +
        `dominant signal. Indicators include login artefacts issued from atypical IPs, password reset searches, ` +
        `new persistent auth tokens, and authenticated sessions that appear after a credential change.`
      );
    case 'Benign Activity':
      return (
        `Benign Activity is the most likely classification when the reconstructed activity is fragmented ` +
        `across unrelated browser actions without forming a coherent kill chain. Indicators include diverse ` +
        `searches, mainstream site visits, and the absence of any persistent authentication change or payload.`
      );
  }
}

function suggestedReasoningForExpected(expected: AttackType): string {
  switch (expected) {
    case 'Phishing':
      return (
        `When triaging suspected phishing, look for: (1) a Reconnaissance → Delivery → Exploitation ` +
        `sequence with no Installation step, (2) credentials being submitted to a login page reached via ` +
        `email or messaging link, and (3) session cookies scoped to the phishing domain. The absence of a ` +
        `persistent payload or post-compromise action distinguishes phishing from malware or credential theft.`
      );
    case 'Malware Download':
      return (
        `When triaging suspected malware downloads, look for: (1) a Delivery → Installation step with a ` +
        `download event from an untrusted source, (2) a file type whose execution is risky (executables, ` +
        `macro documents, scripts), and (3) a follow-up stage showing persistence or follow-on actions. The ` +
        `presence of dropped payload artefacts is the strongest indicator.`
      );
    case 'Credential Theft':
      return (
        `When triaging suspected credential theft, look for: (1) a sequence spanning ` +
        `Reconnaissance → Delivery → Exploitation → Installation tied to authentication, (2) login ` +
        `artefacts (session cookies, persistent auth tokens) as the dominant signal, and (3) self-service ` +
        `password reset activity that follows the original login. The defining characteristic is that the ` +
        `attack object is the credential token, not a downloaded payload.`
      );
    case 'Benign Activity':
      return (
        `When classifying browser activity as benign, look for: (1) diverse, unrelated searches and visits, ` +
        `(2) no persistent authentication changes, (3) no payload downloads from untrusted sources, and ` +
        `(4) no coherent kill chain spanning the exercise stages. The reconstructed activity should fail to ` +
        `tell a single Investigate → Exploit → Act story.`
      );
  }
}

function suggestedReasoningForMismatch(
  expected: AttackType,
  selected: AttackType,
): string {
  const expectedReasoning = suggestedReasoningForExpected(expected);
  return (
    `You chose ${selected}, but the expected attack type is ${expected}. ${expectedReasoning} ` +
    `Review the evidence walkthrough above and compare it against the kill chain pattern for ${selected} — ` +
    `the discrepancy between the two patterns is the most common reason learners misclassify this case.`
  );
}

function buildExplanation(
  investigationCase: InvestigationCase,
  evidenceSequence: AttackInferenceEvidenceStep[],
  expected: AttackType,
): string {
  const stagesPresent = summariseStagePresence(investigationCase.events);
  const walkthrough = buildEvidenceWalkthrough(evidenceSequence);
  const patternDescription = describePatternForAttackType(expected, stagesPresent);

  return (
    `The expected attack type for "${investigationCase.title}" is ${expected}. ` +
    `The reconstructed relevant evidence sequence, in order, was: ${walkthrough} ` +
    `Together, these events trace a chain across the ${stagesPresent.join(' → ')} ` +
    `stage(s) of the Cyber Kill Chain. ${patternDescription}`
  );
}

function buildHeadline(
  isCorrect: boolean,
  isAnswered: boolean,
  expected: AttackType,
  selected: AttackType | null,
): string {
  if (!isAnswered) {
    return `No answer provided — the expected attack type is ${expected}.`;
  }
  if (isCorrect) {
    return `Correct — ${expected} matches the case ground truth.`;
  }
  return `Incorrect — you chose ${selected}, but the expected attack type is ${expected}.`;
}

export function checkAttackInference(
  investigationCase: InvestigationCase,
  selectedAttackType: AttackType | null,
): AttackInferenceResult {
  const expected = investigationCase.attackType;
  const isAnswered = selectedAttackType !== null;
  const isCorrect = isAnswered && selectedAttackType === expected;
  const evidenceSequence = buildEvidenceSequence(investigationCase);
  const explanation = buildExplanation(
    investigationCase,
    evidenceSequence,
    expected,
  );
  const suggestedReasoning = isCorrect
    ? suggestedReasoningForExpected(expected)
    : isAnswered
      ? suggestedReasoningForMismatch(expected, selectedAttackType)
      : suggestedReasoningForExpected(expected);

  return {
    selectedAttackType,
    expectedAttackType: expected,
    isCorrect,
    isAnswered,
    headline: buildHeadline(isCorrect, isAnswered, expected, selectedAttackType),
    explanation,
    suggestedReasoning,
    evidenceSequence,
  };
}
