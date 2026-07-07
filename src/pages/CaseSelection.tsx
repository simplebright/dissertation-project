import { getCaseSummaries } from '../data/caseRegistry';
import { CaseCard } from '../components/case/CaseCard';
import { PageHeader } from '../components/ui/PageHeader';

export function CaseSelection() {
  const cases = getCaseSummaries();

  return (
    <main className="edu-page">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          label="Investigation Cases"
          title="Select a Case"
          description="Choose an investigation case to begin your timeline exercise."
        />
        <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseSummary) => (
            <li key={caseSummary.id}>
              <CaseCard caseSummary={caseSummary} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
