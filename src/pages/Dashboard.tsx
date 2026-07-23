import { useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageActions } from '../components/ui/PageLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/ui/StatCard';
import { formatDuration } from '../utils/formatDuration';
import {
  getAttemptHistory,
  getDashboardStats,
  getLearningInsights,
} from '../utils/progressStorage';
import type { SelectionErrorEntry } from '../types/progress';

function formatImprovement(delta: number | null): string {
  if (delta === null) {
    return '—';
  }
  if (delta > 0) {
    return `+${delta}%`;
  }
  return `${delta}%`;
}

function formatConfidence(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(2)} / 3`;
}

function SelectionErrorBadge({ type }: { type: 'FP' | 'FN' }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${
        type === 'FP'
          ? 'bg-rose-100 text-rose-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {type}
    </span>
  );
}

export function Dashboard() {
  const stats = useMemo(() => getDashboardStats(), []);
  const history = useMemo(() => getAttemptHistory(), []);
  const insights = useMemo(() => getLearningInsights(), []);
  const hasData = stats.completedCount > 0;

  return (
    <main className="edu-page">
      <div className="mx-auto max-w-4xl">
        <PageHeader label="Learning Progress" title="Dashboard" />

        <section aria-labelledby="overview-heading" className="mt-10">
          <h2 id="overview-heading" className="edu-section-title">
            Progress Overview
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Completed Cases"
              value={`${stats.completedCount} / ${stats.totalCases}`}
            />
            <StatCard
              label="Average Accuracy"
              value={hasData ? `${Math.round(stats.averageAccuracy * 100)}%` : '—'}
              valueClassName="text-edu-600"
            />
            <StatCard
              label="Total Attempts"
              value={String(history.length)}
            />
          </div>
        </section>

        <Card as="section" className="mt-8" aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="sr-only">
            Course progress
          </h2>
          <ProgressBar
            value={stats.progressPercent}
            label={`${stats.completedCount} of ${stats.totalCases} cases completed`}
          />
        </Card>

        <Card as="section" className="mt-8" aria-labelledby="selection-heading">
          <h2 id="selection-heading" className="edu-section-title">
            Evidence Selection Analytics
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Tracks how accurately you identify relevant evidence vs. distractor events across all attempts.
          </p>

          {hasData ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Avg. Ordering Accuracy"
                value={`${Math.round(stats.averageAccuracy * 100)}%`}
                valueClassName="text-edu-600"
              />
              <StatCard
                label="Avg. Selection Accuracy"
                value={`${insights.averageSelectionAccuracy}%`}
                valueClassName={
                  insights.averageSelectionAccuracy === 100
                    ? 'text-emerald-600'
                    : insights.averageSelectionAccuracy >= 70
                      ? 'text-edu-600'
                      : insights.averageSelectionAccuracy > 0
                        ? 'text-rose-600'
                        : 'text-slate-400'
                }
              />
              <StatCard
                label="Avg. False Positives"
                value={
                  insights.averageSelectionFP > 0
                    ? `${insights.averageSelectionFP.toFixed(1)} / attempt`
                    : '—'
                }
                valueClassName={
                  insights.averageSelectionFP === 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }
              />
              <StatCard
                label="Avg. False Negatives"
                value={
                  insights.averageSelectionFN > 0
                    ? `${insights.averageSelectionFN.toFixed(1)} / attempt`
                    : '—'
                }
                valueClassName={
                  insights.averageSelectionFN === 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Analytics will appear after you complete your first case.
            </p>
          )}

          {hasData && insights.mostCommonSelectionErrors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700">
                Most Common Selection Errors
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {insights.mostCommonSelectionErrors.map((error: SelectionErrorEntry) => (
                  <li
                    key={`${error.type}-${error.eventId}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <SelectionErrorBadge type={error.type} />
                      <span className="font-mono text-xs text-slate-600">
                        {error.eventId}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {error.count} occurrence{error.count !== 1 ? 's' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <section aria-labelledby="insights-heading" className="mt-8">
          <h2 id="insights-heading" className="edu-section-title">
            Learning Insights
          </h2>

          {!hasData ? (
            <Card as="div" className="mt-4">
              <p className="text-slate-600">
                Insights will appear after you complete your first case.
              </p>
            </Card>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Average Score"
                value={`${insights.averageScore}%`}
              />
              <StatCard
                label="Improvement"
                value={formatImprovement(insights.improvementDelta)}
                valueClassName={
                  insights.improvementDelta === null
                    ? 'text-slate-500'
                    : insights.improvementDelta >= 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                }
              />
              <Card>
                <p className="text-sm font-medium text-slate-500">
                  Most Common Mistakes
                </p>
                {insights.mostCommonMistakes.length === 0 ? (
                  <p className="mt-2 text-slate-600">No mistakes recorded yet.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2 text-sm">
                    {insights.mostCommonMistakes.map((item) => (
                      <li
                        key={item.category}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-slate-700">{item.category}</span>
                        <span className="font-semibold text-edu-700">
                          {item.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card>
                <p className="text-sm font-medium text-slate-500">
                  Average Confidence
                </p>
                <p className="mt-2 text-3xl font-bold text-edu-800">
                  {formatConfidence(insights.averageConfidence)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Based on {insights.ratedAttemptCount} rated attempt
                  {insights.ratedAttemptCount === 1 ? '' : 's'}
                </p>
              </Card>
            </div>
          )}
        </section>

        <Card as="section" className="mt-8" aria-labelledby="history-heading">
          <h2 id="history-heading" className="edu-section-title">
            Attempt History
          </h2>

          {history.length === 0 ? (
            <p className="mt-4 text-slate-600">
              No attempts yet. Start a case to track your progress here.
            </p>
          ) : (
            <ul
              className="mt-4 flex flex-col gap-3"
              aria-label="Attempt history list"
            >
              {history.map((entry) => (
                <li
                  key={entry.attemptId}
                  className="flex flex-col gap-2 rounded-xl border border-edu-100 bg-edu-50/50 px-4 py-4 transition-all duration-300 hover:border-edu-200 hover:bg-edu-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-edu-900">{entry.caseTitle}</p>
                    <p className="text-sm text-slate-500">
                      <span className="capitalize">{entry.mode}</span>
                      {' · '}
                      <time dateTime={entry.completedAt}>
                        {new Date(entry.completedAt).toLocaleString('en-GB')}
                      </time>
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="font-semibold text-edu-800">
                      {entry.score}%
                    </span>
                    <span className="text-slate-600">
                      {formatDuration(entry.completionTime)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <PageActions>
          <Button to="/cases" variant="primary">
            Select Case
          </Button>
          <Button to="/" variant="secondary">
            Home
          </Button>
        </PageActions>
      </div>
    </main>
  );
}
