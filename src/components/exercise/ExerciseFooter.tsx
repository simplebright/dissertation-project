import { Button } from '../ui/Button';

interface ExerciseFooterProps {
  onSubmit?: () => void;
}

export function ExerciseFooter({ onSubmit }: ExerciseFooterProps) {
  return (
    <footer className="border-t border-edu-100 bg-white/90 px-4 py-4 shadow-sm shadow-blue-900/5 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button to="/cases" variant="secondary">
          Back to Cases
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          Check Timeline
        </Button>
      </div>
    </footer>
  );
}
