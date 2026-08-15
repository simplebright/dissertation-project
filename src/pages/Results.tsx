import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCaseById, getNextCaseId } from '../data/caseRegistry';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EvidenceSelectionFeedback } from '../components/exercise/EvidenceSelectionFeedback';
import { FeedbackList } from '../components/ui/FeedbackList';
import { MistakeList } from '../components/ui/MistakeList';
import { EmptyState, PageActions } from '../components/ui/PageLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { buildInvestigationSummary } from '../utils/buildInvestigationSummary';
import { formatDuration } from '../utils/formatDuration';
import { isResultsLocationState } from '../utils/resultsState';
import { updateAttemptConfidence } from '../utils/progressStorage';
import { CONFIDENCE_OPTIONS } from '../types/progress';

export function Results() {
  const location = useLocation();
  const state = isResultsLocationState(location.state) ? location.state : undefined;
  const [confidence, setConfidence] = useState<number | null>(null);

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

  const {
    result,
    selection,
    caseId,
    completionTimeMs,
    hintsUsed,
    hintBudget,
    mistakes,
    completedAt,
  } = state;
  const investigationCase = getCaseById(caseId);
  const nextCaseId = getNextCaseId(caseId);
  const correctFeedback = result.feedback.filter((item) => item.isCorrect);
  const incorrectFeedback = result.feedback.filter((item) => !item.isCorrect);
  const investigationSummary = investigationCase
    ? buildInvestigationSummary({
        investigationCase,
        selection,
        timeline: result,
        killChainResult: state.killChainResult,
        attackInferenceResult: state.attackInferenceResult,
      })
    : null;

  const handleConfidenceSelect = (value: number) => {
    setConfidence(value);
    updateAttemptConfidence(caseId, completedAt, value);
  };

  return (
    <main className="edu-page">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          label="Exercise Results"
          title={investigationCase?.title ?? 'Timeline Results'}
        />

        <Card as="section" className="mt-8" aria-labelledby="stage1-heading">
          <h2
            id="stage1-heading"
            className="edu-section-title"
          >
            Evidence Selection Results
          </h2>

          <div className="mt-3 rounded-xl border border-edu-100 bg-edu-50/60 px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold text-edu-800">Investigation objective: </span>
            {investigationCase?.investigationObjective ?? 'Identify which events are relevant to the investigation and which are distractor noise.'}
          </div>

          <p className="mt-4 leading-relaxed text-slate-700">
            {selection.summary}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Selection Accuracy"
              value={`${selection.accuracy}%`}
              valueClassName={
                selection.accuracy === 100
                  ? 'text-emerald-600'
                  : selection.accuracy >= 70
                    ? 'text-edu-600'
                    : 'text-rose-600'
              }
            />
            <StatCard
              label="Correctly Selected"
              value={`${selection.truePositiveCount} / ${selection.totalRelevant}`}
              valueClassName="text-emerald-600"
            />
            <StatCard
              label="False Positives"
              value={String(selection.falsePositiveCount)}
              valueClassName={
                selection.falsePositiveCount === 0
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }
            />
            <StatCard
              label="False Negatives"
              value={String(selection.falseNegativeCount)}
              valueClassName={
                selection.falseNegativeCount === 0
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }
            />
          </div>

          <div className="mt-8 border-t border-edu-100 pt-6">
            <h3
              id="selection-feedback-heading"
              className="text-base font-semibold text-edu-900"
            >
              Evidence Selection Feedback
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Each incorrectly handled event includes forensic reasoning — the same cues a forensic examiner would use to justify a triage decision.
            </p>
          </div>

          <EvidenceSelectionFeedback
            title="Correctly Selected Evidence"
            subtitle="These events are genuinely relevant to the investigation."
            guidance="Why does each item belong here? Review the reasoning — your future triage accuracy improves when you can articulate why an artefact matches the investigation objective, not just guess that it does."
            items={selection.correctlySelectedEvents}
            emptyMessage="No events were correctly identified as relevant."
            variant="correct"
            ariaLabel="Correctly selected evidence"
          />
          <EvidenceSelectionFeedback
            title="False Positives"
            subtitle="You selected these, but they are not relevant to the investigation."
            guidance="False positives dilute the evidence chain and increase the risk of misinterpreting unrelated activity as forensic signal. Use the reasoning below to spot the cues you may have missed and tighten your selection criteria for next time."
            items={selection.falsePositiveEvents}
            emptyMessage="No false positives — every selected event was genuinely relevant."
            variant="falsePositive"
            ariaLabel="False positive evidence"
          />
          <EvidenceSelectionFeedback
            title="False Negatives"
            subtitle="You missed these relevant events."
            guidance="Missed events mean your reconstruction of the user's activity is incomplete. Read each reasoning block to see how the event would extend the chain, then check your own selection method for blind spots."
            items={selection.falseNegativeEvents}
            emptyMessage="No false negatives — every relevant event was selected."
            variant="falseNegative"
            ariaLabel="False negative evidence"
          />
        </Card>

        <Card as="section" className="mt-8" aria-labelledby="stage2-heading">
          <h2
            id="stage2-heading"
            className="edu-section-title"
          >
            Timeline Ordering Results
          </h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            {result.summary}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Ordering Score"
              value={`${result.score}%`}
            />
            <StatCard
              label="Completion Time"
              value={formatDuration(completionTimeMs)}
            />
            <StatCard
              label="Correct Positions"
              value={String(result.correctCount)}
              valueClassName="text-emerald-600"
            />
            <StatCard
              label="Incorrect Positions"
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

          <FeedbackList
            title="Correct Positions"
            items={correctFeedback}
            variant="correct"
            ariaLabel="Correct positions feedback"
          />
          <FeedbackList
            title="Incorrect Positions"
            items={incorrectFeedback}
            variant="incorrect"
            ariaLabel="Incorrect positions feedback"
          />
          <MistakeList
            title="Mistake Analysis"
            items={mistakes}
            variant="incorrect"
            ariaLabel="Mistake analysis"
          />
        </Card>

        <Card as="section" className="mt-8" aria-labelledby="stage3-heading">
          <h2
            id="stage3-heading"
            className="edu-section-title"
          >
            Cyber Kill Chain Mapping Results
          </h2>
          {state.killChainResult ? (
            <>
              <p className="mt-3 leading-relaxed text-slate-700">
                {state.killChainResult.summary}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Kill Chain Accuracy"
                  value={`${state.killChainResult.accuracy}%`}
                  valueClassName={
                    state.killChainResult.accuracy === 100
                      ? 'text-emerald-600'
                      : state.killChainResult.accuracy >= 70
                        ? 'text-edu-600'
                        : 'text-rose-600'
                  }
                />
                <StatCard
                  label="Correct Mappings"
                  value={`${state.killChainResult.correctCount} / ${state.killChainResult.totalCount}`}
                  valueClassName="text-emerald-600"
                />
                <StatCard
                  label="Incorrect Mappings"
                  value={String(state.killChainResult.incorrectCount)}
                  valueClassName={
                    state.killChainResult.incorrectCount === 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }
                />
              </div>

              <div className="mt-8 border-t border-edu-100 pt-6">
                <h3
                  id="kill-chain-feedback-heading"
                  className="text-base font-semibold text-edu-900"
                >
                  Educational Explanations
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Each explanation describes why the artefact belongs in its
                  expected Cyber Kill Chain stage. Use these to refine how you
                  classify evidence on future cases.
                </p>
                <ul
                  className="mt-4 flex flex-col gap-3"
                  aria-labelledby="kill-chain-feedback-heading"
                >
                  {state.killChainResult.feedback.map((item) => {
                    const isCorrect = item.isCorrect;
                    return (
                      <li
                        key={`kill-chain-${item.eventId}`}
                        className={
                          isCorrect
                            ? 'rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900'
                            : item.isMapped
                              ? 'rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-900'
                              : 'rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900'
                        }
                      >
                        <p className="font-medium">{item.headline}</p>
                        <p className="mt-1 leading-relaxed">
                          {item.explanation}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Cyber Kill Chain mapping was skipped for this attempt.
            </p>
          )}
        </Card>

        <Card as="section" className="mt-8" aria-labelledby="stage4-heading">
          <h2
            id="stage4-heading"
            className="edu-section-title"
          >
            Attack Inference Results
          </h2>
          {state.attackInferenceResult ? (
            <>
              <p
                className={`mt-3 font-semibold ${
                  state.attackInferenceResult.isCorrect
                    ? 'text-emerald-700'
                    : state.attackInferenceResult.isAnswered
                      ? 'text-rose-700'
                      : 'text-slate-700'
                }`}
              >
                {state.attackInferenceResult.headline}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <StatCard
                  label="Your Answer"
                  value={
                    state.attackInferenceResult.selectedAttackType ?? '—'
                  }
                  valueClassName={
                    state.attackInferenceResult.isCorrect
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }
                />
                <StatCard
                  label="Correct Answer"
                  value={state.attackInferenceResult.expectedAttackType}
                  valueClassName="text-edu-700"
                />
              </div>

              <div className="mt-6 border-t border-edu-100 pt-6">
                <h3
                  id="attack-inference-explanation-heading"
                  className="text-base font-semibold text-edu-900"
                >
                  Investigation Explanation
                </h3>
                <p className="mt-2 leading-relaxed text-slate-700">
                  {state.attackInferenceResult.explanation}
                </p>
              </div>

              <div className="mt-6 border-t border-edu-100 pt-6">
                <h3
                  id="attack-inference-reasoning-heading"
                  className="text-base font-semibold text-edu-900"
                >
                  Suggested Reasoning
                </h3>
                <p className="mt-2 leading-relaxed text-slate-700">
                  {state.attackInferenceResult.suggestedReasoning}
                </p>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Attack inference was skipped for this attempt.
            </p>
          )}
        </Card>

        <Card
          as="section"
          className="mt-8"
          aria-labelledby="investigation-summary-heading"
        >
          <h2
            id="investigation-summary-heading"
            className="edu-section-title"
          >
            Investigation Summary
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            A connected reading of the four stages — the case is best
            understood as one continuous forensic argument, not four separate
            scores.
          </p>

          {investigationSummary ? (
            <>
              <ol
                className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                aria-label="Investigation stages"
              >
                {investigationSummary.steps.map((step) => (
                  <li
                    key={`investigation-step-${step.number}`}
                    className="relative flex h-full flex-col rounded-2xl border border-edu-100 bg-gradient-to-br from-edu-50 to-white p-4"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-edu-600 text-sm font-semibold text-white shadow-sm shadow-blue-900/10"
                      aria-hidden="true"
                    >
                      {step.number}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-edu-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {step.body}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-edu-100 pt-6">
                <h3
                  id="investigation-narrative-heading"
                  className="text-base font-semibold text-edu-900"
                >
                  Why the Evidence Supports{' '}
                  <span className="text-edu-700">
                    {investigationSummary.attackType}
                  </span>
                </h3>
                <p className="mt-3 leading-relaxed text-slate-700">
                  {investigationSummary.narrative}
                </p>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              The investigation summary is unavailable because the case
              metadata could not be loaded.
            </p>
          )}
        </Card>

        <Card as="section" className="mt-8" aria-labelledby="confidence-heading">
          <h2 id="confidence-heading" className="edu-section-title">
            How confident were you?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your self-assessment helps support educational evaluation research. It does
            not affect your score.
          </p>
          <div
            className="mt-4 grid gap-3 sm:grid-cols-3"
            role="radiogroup"
            aria-labelledby="confidence-heading"
          >
            {CONFIDENCE_OPTIONS.map((option) => {
              const isSelected = confidence === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleConfidenceSelect(option.value)}
                  className={[
                    'rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300',
                    isSelected
                      ? 'border-edu-600 bg-edu-600 text-white shadow-md shadow-blue-900/15'
                      : 'border-edu-200 bg-white text-edu-800 hover:border-edu-400 hover:bg-edu-50',
                  ].join(' ')}
                >
                  <span className="block text-xs uppercase tracking-wide opacity-80">
                    Option {option.value}
                  </span>
                  <span className="mt-1 block text-base">{option.label}</span>
                </button>
              );
            })}
          </div>
          {confidence !== null && (
            <p className="mt-4 text-sm text-emerald-600">
              Thanks — your confidence rating was saved.
            </p>
          )}
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