export const DND_CONTAINER_IDS = {
  evidence: 'evidence',
  timeline: 'timeline',
} as const;

export type DndContainerId =
  (typeof DND_CONTAINER_IDS)[keyof typeof DND_CONTAINER_IDS];
