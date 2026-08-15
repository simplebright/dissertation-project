import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { AttackType, InvestigationCase } from '../types/case';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/PageLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { getCaseById } from '../data/caseRegistry';
import { isAttackInferenceLocationState } from '../utils/attackInferenceState';
import { checkAttackInference } from '../utils/checkAttackInference';
import { updateAttemptAfter } from '../utils/progressStorage';

const ATTACK_TYPE_OPTIONS: {
  value: AttackType;
  label: string;
  description: string;
}[] = [
  {
    value: 'Phishing',
    label: 'Phishing',
    description:
      'A targeted attempt to lure the victim into interacting with a deceptive message or page that mimics a trusted service.',
  },
  {
    value: 'Malware Download',
    label: 'Malware Download',
    description:
      'A weaponised file (executable, macro document, or payload) was retrieved from an attacker-controlled source.',
  },
  {
    value: 'Credential Theft',
    label: 'Credential Theft',
    description:
      'Authentication artefacts (cookies, tokens, password resets) indicate a session was hijacked or credentials were misused.',
  },
  {
    value: 'Benign Activity',
    label: 'Benign Activity',
    description:
      'No compromise indicators — the reconstructed activity is consistent with normal work-related browsing.',
  },
];

export function AttackInference() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const investigationCase: InvestigationCase | undefined = caseId
    ? getCaseById(caseId)
    : undefined;

  const incomingState = isAttackInferenceLocationState(location.state)
    ? location.state
    : undefined;
  const hasSelection = (incomingState?.selectedEvidenceIds?.length ?? 0) > 0;

  const [selectedAttackType, setSelectedAttackType] = useState<AttackType | null>(
    incomingState?.selectedAttackType ?? null,
  );

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

  if (!incomingState || !hasSelection) {
    return <Navigate to={`/exercise/${caseId}/evidence`} replace />;
  }

  const handleContinue = () => {
    if (!incomingState || !selectedAttackType) {
      return;
    }
    const attackInferenceResult = checkAttackInference(
      investigationCase,
      selectedAttackType,
    );

    const upstream = incomingState.upstreamResults;
    if (caseId && upstream.completedAt) {
      updateAttemptAfter(caseId, upstream.completedAt, {
        attackInferenceCorrect: attackInferenceResult.isCorrect,
      });
    }

    navigate('/results', {
      state: {
        ...upstream,
        killChainResult: incomingState.killChainResult,
        attackInferenceResult,
      },
    });
  };

  const canContinue = selectedAttackType !== null;

  return (
    <main className="edu-page">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          label="Attack Inference"
          title={investigationCase.title}
          description="Review the evidence you have reconstructed and infer the attack type that best explains the observed browser activity."
        />

        <Card as="section" className="mt-10" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="edu-section-title">
            Stage Summary
          </h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            Across the evidence-selection, timeline-reconstruction, and kill-chain
            mapping stages, you traced the user's browser activity from the
            earliest reconnaissance through to any post-compromise actions. Use
            the overall pattern of artefacts (searches, logins, downloads, cookie
            updates, file transfers) to identify which attack type best explains
            what happened.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            There is no further evidence to inspect. Pick the single attack type
            that you believe matches the reconstructed investigation.
          </p>
        </Card>

        <Card
          as="section"
          className="mt-8"
          aria-labelledby="attack-type-heading"
        >
          <h2 id="attack-type-heading" className="edu-section-title">
            Select Attack Type
          </h2>
          <fieldset className="mt-4 space-y-3 border-0 p-0">
            <legend className="sr-only">Attack type</legend>
            {ATTACK_TYPE_OPTIONS.map((option) => {
              const isSelected = selectedAttackType === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-all duration-300 ${
                    isSelected
                      ? 'border-edu-400 bg-edu-50 ring-2 ring-edu-400 ring-offset-2'
                      : 'border-edu-100 hover:border-edu-200 hover:bg-edu-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="attack-type"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setSelectedAttackType(option.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-semibold text-edu-900">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button to="/cases" variant="secondary">
              Back to Cases
            </Button>
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continue to Results
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}