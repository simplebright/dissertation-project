import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  valueClassName = 'text-edu-900',
}: StatCardProps) {
  return (
    <Card className="text-center">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-4xl font-bold ${valueClassName}`}>{value}</p>
    </Card>
  );
}
