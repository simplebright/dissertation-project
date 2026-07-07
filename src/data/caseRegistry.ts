import type { CaseSummary, InvestigationCase } from '../types/case';
import case001 from './scenarios/case-001.json';
import case002 from './scenarios/case-002.json';
import case003 from './scenarios/case-003.json';

const ALL_CASES: InvestigationCase[] = [
  case001 as InvestigationCase,
  case002 as InvestigationCase,
  case003 as InvestigationCase,
];

const casesById: Record<string, InvestigationCase> = Object.fromEntries(
  ALL_CASES.map((investigationCase) => [investigationCase.id, investigationCase]),
);

export const TOTAL_CASE_COUNT = ALL_CASES.length;

export function getCaseById(caseId: string): InvestigationCase | undefined {
  return casesById[caseId];
}

export function getCaseSummaries(): CaseSummary[] {
  return ALL_CASES.map(({ events: _events, ...summary }) => summary);
}

export function getNextCaseId(currentCaseId: string): string | undefined {
  const currentIndex = ALL_CASES.findIndex(
    (investigationCase) => investigationCase.id === currentCaseId,
  );
  return ALL_CASES[currentIndex + 1]?.id;
}
