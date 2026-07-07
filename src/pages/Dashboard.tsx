import { useMemo } from 'react';
import { getCaseById } from '../data/caseRegistry';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageActions } from '../components/ui/PageLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/ui/StatCard';
import { formatDuration } from '../utils/formatDuration';
import { getDashboardStats } from '../utils/progressStorage';

export function Dashboard() {
  const stats = useMemo(() => getDashboardStats(), []);

  return (
    <main className="edu-page">
      <div className="mx-auto max-w-4xl">
        <PageHeader label="Learning Progress" title="Dashboard" />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Average Score"
            value={stats.completedCount > 0 ? `${stats.averageScore}%` : '—'}
          />
          <StatCard
            label="Highest Score"
            value={stats.completedCount > 0 ? `${stats.highestScore}%` : '—'}
            valueClassName="text-edu-600"
          />
          <StatCard
            label="Average Time"
            value={
              stats.completedCount > 0
                ? formatDuration(stats.averageCompletionTimeMs)
                : '—'
            }
          />
        </div>

        <Card as="section" className="mt-8" aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="sr-only">
            Course progress
          </h2>
          <ProgressBar
            value={stats.progressPercent}
            label={`${stats.completedCount} of ${stats.totalCases} cases completed`}
          />
        </Card>

        <Card as="section" className="mt-8" aria-labelledby="completed-heading">
          <h2 id="completed-heading" className="edu-section-title">
            Completed Cases
          </h2>

          {stats.completedCases.length === 0 ? (
            <p className="mt-4 text-slate-600">
              No cases completed yet. Start a case to track your progress here.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3" aria-label="Completed cases list">
              {stats.completedCases.map((completion) => {
                const investigationCase = getCaseById(completion.caseId);

                return (
                  <li
                    key={completion.caseId}
                    className="flex flex-col gap-2 rounded-xl border border-edu-100 bg-edu-50/50 px-4 py-4 transition-all duration-300 hover:border-edu-200 hover:bg-edu-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-edu-900">
                        {investigationCase?.title ?? completion.caseId}
                      </p>
                      <p className="text-sm text-slate-500">
                        <time dateTime={completion.completedAt}>
                          {new Date(completion.completedAt).toLocaleString('en-GB')}
                        </time>
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="font-semibold text-edu-800">
                        {completion.score}%
                      </span>
                      <span className="text-slate-600">
                        {formatDuration(completion.completionTimeMs)}
                      </span>
                    </div>
                  </li>
                );
              })}
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
