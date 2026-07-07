interface PageHeaderProps {
  label: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({
  label,
  title,
  description,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`text-center ${className}`}>
      <p className="edu-label">{label}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-edu-900 sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {description}
        </p>
      )}
    </header>
  );
}
