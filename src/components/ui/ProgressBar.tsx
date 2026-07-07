import { useId } from 'react';

interface ProgressBarProps {
  value: number;
  label: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const labelId = useId();
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600" id={labelId}>
          {label}
        </span>
        <span className="font-semibold text-edu-800" aria-hidden="true">
          {clampedValue}%
        </span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-edu-100"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={labelId}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-edu-500 to-edu-600 transition-all duration-500 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
