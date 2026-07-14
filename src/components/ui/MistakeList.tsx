import type { MistakeRecord } from '../../types/mistake';
import { FEEDBACK_LIST_STYLES } from '../../constants/styles';

interface MistakeListProps {
  title: string;
  items: MistakeRecord[];
  variant: 'incorrect';
  ariaLabel: string;
}

export function MistakeList({
  title,
  items,
  variant,
  ariaLabel,
}: MistakeListProps) {
  if (items.length === 0) {
    return null;
  }

  const styles = FEEDBACK_LIST_STYLES[variant];

  return (
    <div className="mt-6">
      <h3 className={`text-sm font-semibold ${styles.heading}`}>{title}</h3>
      <ul className="mt-2 flex flex-col gap-2" aria-label={ariaLabel}>
        {items.map((item) => (
          <li
            key={`${item.position}-${item.eventId}`}
            className={styles.item}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">
                Position {item.position}: {item.category}
              </p>
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {item.eventId}
              </span>
            </div>
            <p className="mt-1 leading-relaxed">{item.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}