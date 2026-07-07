import { Navigate, useLocation, useParams } from 'react-router-dom';
import { DndProvider } from '../components/dnd/DndProvider';
import { ExerciseFooter } from '../components/exercise/ExerciseFooter';
import { ExerciseHeader } from '../components/exercise/ExerciseHeader';
import { EvidenceCard } from '../components/exercise/EvidenceCard';
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
  const {
    investigationCase,
    eventsById,
    containers,
    activeEvent,
    handleDragStart,
    handleDragEnd,
    handleSubmit,
  } = useTimelineExercise(caseId);

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

  if (!exerciseState) {
    return <Navigate to={`/exercise/${caseId}/mode`} replace />;
  }

  const showTimestamp = exerciseState.mode === 'beginner';

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
          <aside className="lg:w-1/2" aria-label="Evidence panel">
            <SortableEvidenceList
              containerId={DND_CONTAINER_IDS.evidence}
              itemIds={containers[DND_CONTAINER_IDS.evidence]}
              eventsById={eventsById}
              title="Evidence"
              emptyMessage="All evidence placed on timeline"
              showTimestamp={showTimestamp}
            />
          </aside>

          <section className="lg:w-1/2" aria-label="Timeline panel">
            <Timeline
              containerId={DND_CONTAINER_IDS.timeline}
              itemIds={containers[DND_CONTAINER_IDS.timeline]}
              eventsById={eventsById}
              slotCount={investigationCase.events.length}
              showTimestamp={showTimestamp}
            />
          </section>
        </div>

        <ExerciseFooter onSubmit={handleSubmit} />
      </div>
    </DndProvider>
  );
}
