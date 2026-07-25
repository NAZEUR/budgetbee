interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {icon ? (
        <div className="mb-4">{icon}</div>
      ) : (
        <div className="text-6xl mb-4 animate-float">🐝</div>
      )}
      <h3 className="text-xl font-bold text-hive-700 mb-2">{title}</h3>
      <p className="text-sm text-hive-400 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
