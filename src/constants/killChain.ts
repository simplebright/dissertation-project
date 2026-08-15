import type { KillChainStage } from '../types/case';

export const KILL_CHAIN_STAGES: KillChainStage[] = [
  'Reconnaissance',
  'Delivery',
  'Exploitation',
  'Installation',
  'Actions',
];

export const KILL_CHAIN_STAGE_DESCRIPTIONS: Record<KillChainStage, string> = {
  Reconnaissance:
    'Research and information gathering about the target. Includes target searches, technical research, and identifying assets.',
  Delivery:
    'Transmission of the attack to the target. Includes visiting phishing pages, malicious URLs, or opening weaponised documents.',
  Exploitation:
    'Active exploitation of a vulnerability. Includes credential submission, session establishment, and accessing protected resources.',
  Installation:
    'Installation of persistent tooling or artefacts. Includes persistent authentication tokens, downloaded payloads, or saved credential caches.',
  Actions:
    'Post-compromise actions taken on the objective. Includes data access, exfiltration attempts, and follow-up account activity.',
};

export const KILL_CHAIN_STAGE_ACCENTS: Record<KillChainStage, string> = {
  Reconnaissance: 'border-sky-200 bg-sky-50/60 text-sky-900',
  Delivery: 'border-indigo-200 bg-indigo-50/60 text-indigo-900',
  Exploitation: 'border-rose-200 bg-rose-50/60 text-rose-900',
  Installation: 'border-amber-200 bg-amber-50/60 text-amber-900',
  Actions: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
};
