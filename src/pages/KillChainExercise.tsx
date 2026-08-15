import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { DndProvider } from '../components/dnd/DndProvider';
import { ExerciseFooter } from '../components/exercise/ExerciseFooter';
import { ExerciseHeader } from '../components/exercise/ExerciseHeader';
import { EvidenceCard } from '../components/exercise/EvidenceCard';
import { KillChainStageColumn } from '../components/exercise/KillChainStageColumn';
import { SortableEvidenceList } from '../components/exercise/SortableEvidenceList';
import { DND_CONTAINER_IDS } from '../constants/dnd';
import {
  KILL_CHAIN_STAGES,
  KILL_CHAIN_STAGE_ACCENTS,
  KILL_CHAIN_STAGE_DESCRIPTIONS,
} from '../constants/killChain';
import { useKillChainExercise } from '../hooks/useKillChainExercise';
import { EmptyState } from '../components/ui/PageLayout';
import { checkKillChainAnswer } from '../utils/checkKillChainAnswer';
import { isKillChainLocationState } from '../utils/killChainState';
import { updateAttemptAfter } from '../utils/progressStorage';
import type { KillChainMappingByStage } from '../utils/checkKillChainAnswer';

const STAGE_CONTAINER_IDS: Record<
  (typeof KILL_CHAIN_STAGES)[number],
  string
> = {
  Reconnaissance: DND_CONTAINER_IDS.killChainReconnaissance,
  Delivery: DND_CONTAINER_IDS.killChainDelivery,
  Exploitation: DND_CONTAINER_IDS.killChainExploitation,
  Installation: DND_CONTAINER_IDS.killChainInstallation,
  Actions: DND_CONTAINER_IDS.killChainActions,
};

export function KillChainExercise() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const incomingState = isKillChainLocationState(location.state)
    ? location.state
    : undefined;
  const selectedEvidenceIds = incomingState?.selectedEvidenceIds;
  const hasSelection = (selectedEvidenceIds?.length ?? 0) > 0;
  const {
    investigationCase,
    eventsById,
    containers,
    activeEvent,
    handleDragStart,
    handleDragEnd,
  } = useKillChainExercise(caseId, selectedEvidenceIds);

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

  const exerciseMode = incomingState.mode ?? 'beginner';
  const showTimestamp = exerciseMode === 'beginner';

  const handleContinue = () => {
    if (!incomingState) {
      return;
    }
    const mapping: KillChainMappingByStage = {
      Reconnaissance: containers[DND_CONTAINER_IDS.killChainReconnaissance],
      Delivery: containers[DND_CONTAINER_IDS.killChainDelivery],
      Exploitation: containers[DND_CONTAINER_IDS.killChainExploitation],
      Installation: containers[DND_CONTAINER_IDS.killChainInstallation],
      Actions: containers[DND_CONTAINER_IDS.killChainActions],
    };
    const killChainResult = checkKillChainAnswer(
      investigationCase.events,
      mapping,
    );

    const upstream = incomingState.upstreamResults;
    if (caseId && upstream.completedAt) {
      updateAttemptAfter(caseId, upstream.completedAt, {
        killChainAccuracy: killChainResult.accuracy,
      });
    }

    navigate(`/exercise/${caseId}/attack-inference`, {
      state: {
        ...incomingState,
        killChainResult,
      },
      replace: true,
    });
  };

  return (
    <DndProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      overlay={
        activeEvent ? (
          <EvidenceCard event={activeEvent} showTimestamp={showTimestamp} />
        ) : null
      }
    >
      <div
        key={caseId}
        className="flex min-h-screen flex-col bg-gradient-to-b from-edu-50 via-blue-50/40 to-white"
      >
        <ExerciseHeader investigationCase={investigationCase} />

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row">
          <aside className="lg:w-1/3" aria-label="Evidence panel">
            <SortableEvidenceList
              containerId={DND_CONTAINER_IDS.killChainEvidence}
              itemIds={containers[DND_CONTAINER_IDS.killChainEvidence]}
              eventsById={eventsById}
              title="Evidence"
              emptyMessage="All evidence has been mapped to a stage"
              showTimestamp={showTimestamp}
            />
          </aside>

          <section
            className="flex-1"
            aria-label="Cyber Kill Chain Mapping panel"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="edu-section-title">Cyber Kill Chain</h2>
              <span className="text-xs font-medium text-slate-500">
                Drag each evidence card to its matching stage
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {KILL_CHAIN_STAGES.map((stage) => (
                <div
                  key={stage}
                  className={`flex h-full flex-col rounded-2xl border ${KILL_CHAIN_STAGE_ACCENTS[stage]} p-3`}
                  aria-label={`${stage} stage column`}
                >
                  <header className="mb-3">
                    <h3 className="text-sm font-semibold tracking-tight">
                      {stage}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-700">
                      {KILL_CHAIN_STAGE_DESCRIPTIONS[stage]}
                    </p>
                  </header>
                  <KillChainStageColumn
                    containerId={STAGE_CONTAINER_IDS[stage]}
                    itemIds={containers[STAGE_CONTAINER_IDS[stage]]}
                    eventsById={eventsById}
                    showTimestamp={showTimestamp}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <ExerciseFooter onSubmit={handleContinue} submitLabel="Continue to Attack Inference" />
      </div>
    </DndProvider>
  );
}
