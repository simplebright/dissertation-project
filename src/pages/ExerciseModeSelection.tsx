import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCaseById } from '../data/caseRegistry';
import type { ExerciseMode } from '../types/exercise';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/PageLayout';
import { PageHeader } from '../components/ui/PageHeader';

const MODE_OPTIONS: {
  value: ExerciseMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'Evidence cards display timestamps to help you order events chronologically.',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Timestamps are hidden. Reconstruct the timeline using event types and descriptions only.',
  },
];

export function ExerciseModeSelection() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const investigationCase = caseId ? getCaseById(caseId) : undefined;
  const [selectedMode, setSelectedMode] = useState<ExerciseMode>('beginner');

  if (!investigationCase) {
    return (
      <EmptyState
        title="Case not found"
        description="The selected case could not be loaded."
        actionLabel="Return to case selection"
        actionTo="/cases"
      />
    );
  }

  const handleStart = () => {
    navigate(`/exercise/${caseId}`, { state: { mode: selectedMode } });
  };

  return (
    <main className="edu-page">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          label="Exercise Setup"
          title={investigationCase.title}
          description="Choose a difficulty mode before starting the timeline exercise."
        />

        <Card as="section" className="mt-10" aria-labelledby="mode-heading">
          <h2 id="mode-heading" className="edu-section-title">
            Select Mode
          </h2>
          <fieldset className="mt-4 space-y-3 border-0 p-0">
            <legend className="sr-only">Exercise mode</legend>
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-all duration-300 ${
                  selectedMode === option.value
                    ? 'border-edu-400 bg-edu-50 ring-2 ring-edu-400 ring-offset-2'
                    : 'border-edu-100 hover:border-edu-200 hover:bg-edu-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="exercise-mode"
                  value={option.value}
                  checked={selectedMode === option.value}
                  onChange={() => setSelectedMode(option.value)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold text-edu-900">{option.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button to="/cases" variant="secondary">
              Back to Cases
            </Button>
            <Button variant="primary" onClick={handleStart}>
              Start Exercise
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
