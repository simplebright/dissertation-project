import type { PositionFeedback } from '../../types/timeline';
import { FEEDBACK_LIST_STYLES } from '../../constants/styles';

type FeedbackVariant = keyof typeof FEEDBACK_LIST_STYLES;

interface FeedbackListProps {
  title: string;
  items: PositionFeedback[];
  variant: FeedbackVariant;
  ariaLabel: string;
}

export function FeedbackList({
  title,
  items,
  variant,
  ariaLabel,
}: FeedbackListProps) {
  if (items.length === 0) {
    return null;
  }

  const styles = FEEDBACK_LIST_STYLES[variant];

  return (
    <div className="mt-6">
      <h3 className={`text-sm font-semibold ${styles.heading}`}>{title}</h3>
      <ul className="mt-2 flex flex-col gap-2" aria-label={ariaLabel}>
        {items.map((item) => (
          <li key={`${variant}-${item.position}`} className={styles.item}>
            <p className="font-medium">{item.headline}</p>
            <p className="mt-1 leading-relaxed">{item.explanation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
