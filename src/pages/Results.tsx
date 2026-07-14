import { useLocation } from 'react-router-dom';
import { getCaseById, getNextCaseId } from '../data/caseRegistry';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FeedbackList } from '../components/ui/FeedbackList';
import { MistakeList } from '../components/ui/MistakeList';
import { EmptyState, PageActions } from '../components/ui/PageLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { formatDuration } from '../utils/formatDuration';
import { isResultsLocationState } from '../utils/resultsState';

export function Results() {
  const location = useLocation();
  const state = isResultsLocationState(location.state) ? location.state : undefined;

  if (!state) {
    return (
      <EmptyState
        title="No results available"
        description="Complete a timeline exercise to view your results."
        actionLabel="Select a case"
        actionTo="/cases"
      />
    );
  }

  const { result, caseId, completionTimeMs, hintsUsed, hintBudget, mistakes } = state;
  const investigationCase = getCaseById(caseId);
  const nextCaseId = getNextCaseId(caseId);
  const correctFeedback = result.feedback.filter((item) => item.isCorrect);
  const incorrectFeedback = result.feedback.filter((item) => !item.isCorrect);

  return (
    <main className="edu-page">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          label="Exercise Results"
          title={investigationCase?.title ?? 'Timeline Results'}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <StatCard label="Score" value={`${result.score}%`} />
          <StatCard label="Completion Time" value={formatDuration(completionTimeMs)} />
          <StatCard
            label="Correct Answers"
            value={String(result.correctCount)}
            valueClassName="text-emerald-600"
          />
          <StatCard
            label="Incorrect Answers"
            value={String(result.incorrectCount)}
            valueClassName="text-rose-600"
          />
          <StatCard
            label="Hints Used"
            value={`${hintsUsed} / ${hintBudget}`}
            valueClassName="text-edu-600"
          />
          <StatCard
            label="Hint-Free Bonus"
            value={hintsUsed === 0 ? 'Earned' : 'Not Earned'}
            valueClassName={hintsUsed === 0 ? 'text-emerald-600' : 'text-slate-500'}
          />
        </div>

        <Card as="section" className="mt-8" aria-labelledby="feedback-heading">
          <h2 id="feedback-heading" className="edu-section-title">
            Learning Feedback
          </h2>
          <p className="mt-3 leading-relaxed text-slate-700">{result.summary}</p>

          <FeedbackList
            title="Correct"
            items={correctFeedback}
            variant="correct"
            ariaLabel="Correct answers feedback"
          />
          <FeedbackList
            title="Incorrect"
            items={incorrectFeedback}
            variant="incorrect"
            ariaLabel="Incorrect answers feedback"
          />
          <MistakeList
            title="Mistake Analysis"
            items={mistakes}
            variant="incorrect"
            ariaLabel="Mistake analysis"
          />
        </Card>

        <PageActions>
          <Button to={`/exercise/${caseId}`} variant="primary">
            Try Again
          </Button>
          <Button
            to={nextCaseId ? `/exercise/${nextCaseId}` : '/cases'}
            variant="secondary"
          >
            Next Case
          </Button>
          <Button to="/dashboard" variant="secondary">
            Dashboard
          </Button>
          <Button to="/" variant="secondary">
            Home
          </Button>
        </PageActions>
      </div>
    </main>
  );
}
