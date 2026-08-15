export const DND_CONTAINER_IDS = {
  evidence: 'evidence',
  timeline: 'timeline',
  killChainEvidence: 'kill-chain-evidence',
  killChainReconnaissance: 'kill-chain-reconnaissance',
  killChainDelivery: 'kill-chain-delivery',
  killChainExploitation: 'kill-chain-exploitation',
  killChainInstallation: 'kill-chain-installation',
  killChainActions: 'kill-chain-actions',
} as const;

export type DndContainerId =
  (typeof DND_CONTAINER_IDS)[keyof typeof DND_CONTAINER_IDS];
