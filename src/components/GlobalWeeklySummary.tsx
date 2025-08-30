type Props = {
  completed: number;
  target: number;
};

export default function GlobalWeeklySummary({ completed, target }: Props) {
  const percent = target > 0 ? Math.min(1, Math.max(0, completed / target)) : 0;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">Weekly completion</h2>
        {target === 0 ? (
          <span className="text-sm text-white/80">No weekly habits yet</span>
        ) : (
          <span className="text-sm text-white/90">{Math.round(percent * 100)}%</span>
        )}
      </div>
      <div className="w-full h-3 rounded-full bg-gray-300 overflow-hidden ring-1 ring-gray-400" aria-label="Weekly completion progress">
        <div className="h-full bg-green-600" style={{ width: `${percent * 100}%` }} />
      </div>
      {target > 0 && (
        <div className="mt-1 text-xs text-white/80">
          {completed} / {target} checks this week
        </div>
      )}
    </section>
  );
}
