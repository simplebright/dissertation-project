import { Navigate, useLocation, useParams } from 'react-router-dom';
import { DndProvider } from '../components/dnd/DndProvider';
import { ExerciseFooter } from '../components/exercise/ExerciseFooter';
import { ExerciseHeader } from '../components/exercise/ExerciseHeader';
import { EvidenceCard } from '../components/exercise/EvidenceCard';
import { HintPanel } from '../components/exercise/HintPanel';
import { SortableEvidenceList } from '../components/exercise/SortableEvidenceList';
import { Timeline } from '../components/exercise/Timeline';
import { EmptyState } from '../components/ui/PageLayout';
import { DND_CONTAINER_IDS } from '../constants/dnd';
import { useTimelineExercise } from '../hooks/useTimelineExercise';
import { isExerciseLocationState } from '../utils/exerciseMode';

export function TimelineExercise() {
  const { caseId } = useParams();
  const location = useLocation();
  const exerciseState = isExerciseLocationState(location.state)
    ? location.state
    : undefined;
  const selectedEvidenceIds = exerciseState?.selectedEvidenceIds;
  const hasSelection = (selectedEvidenceIds?.length ?? 0) > 0;
  const {
    investigationCase,
    selectedEvents,
    eventsById,
    containers,
    activeEvent,
    handleDragStart,
    handleDragEnd,
    handleSubmit,
    hintsUsed,
    hintBudget,
    hintEventId,
    handleSelectHintEvent,
    handleUseHint,
    revealedByEvent,
    timelineEventIds,
  } = useTimelineExercise(caseId, selectedEvidenceIds);

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

  if (!exerciseState || !hasSelection) {
    return <Navigate to={`/exercise/${caseId}/evidence`} replace />;
  }

  const exerciseMode = exerciseState?.mode ?? 'beginner';
  const showTimestamp = exerciseMode === 'beginner';

  return (
    <DndProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      overlay={
        activeEvent ? (
          <EvidenceCard
            event={activeEvent}
            showTimestamp={showTimestamp}
            mode={exerciseMode}
          />
        ) : null
      }
    >
      <div
        key={caseId}
        className="flex min-h-screen flex-col bg-gradient-to-b from-edu-50 via-blue-50/40 to-white"
      >
        <ExerciseHeader investigationCase={investigationCase} />

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row">
          <aside className="lg:w-1/2" aria-label="Evidence panel">
            <SortableEvidenceList
              containerId={DND_CONTAINER_IDS.evidence}
              itemIds={containers[DND_CONTAINER_IDS.evidence]}
              eventsById={eventsById}
              title="Evidence"
              emptyMessage="All evidence placed on timeline"
              showTimestamp={showTimestamp}
              mode={exerciseMode}
            />
          </aside>

          <section className="lg:w-1/2" aria-label="Timeline panel">
            <Timeline
              containerId={DND_CONTAINER_IDS.timeline}
              itemIds={containers[DND_CONTAINER_IDS.timeline]}
              eventsById={eventsById}
              slotCount={selectedEvents.length}
              showTimestamp={showTimestamp}
              mode={exerciseMode}
            />
          </section>
        </div>

        <ExerciseFooter onSubmit={handleSubmit} />

        <HintPanel
          events={selectedEvents}
          totalAvailable={hintBudget}
          totalUsed={hintsUsed}
          activeEventId={hintEventId}
          onSelectEvent={handleSelectHintEvent}
          onUseHint={handleUseHint}
          timelineEventIds={timelineEventIds}
          revealedByEvent={revealedByEvent}
        />
      </div>
    </DndProvider>
  );
}
