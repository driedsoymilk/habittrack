type Props = {
  labels: string[];
  titles: string[];
  percents: number[];
  empty?: boolean;
};

function colorFor(p: number) {
  if (p >= 0.8) return "bg-green-600";
  if (p >= 0.6) return "bg-lime-500";
  if (p >= 0.4) return "bg-yellow-400";
  if (p >= 0.2) return "bg-orange-500";
  return "bg-red-500";
}

export default function GlobalDailyHeatmap({ labels, titles, percents, empty }: Props) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">Daily completion (last 7 days)</h2>
        <span className="text-sm text-white/80">{empty ? "No daily habits yet" : "0% = red, 100% = green"}</span>
      </div>
      <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-300" aria-label="Daily completion bar (last 7 days)">
        <div className="grid grid-cols-7 h-full">
          {Array.from({ length: 7 }).map((_, i) => {
            const p = Math.max(0, Math.min(1, percents[i] ?? 0));
            const segColor = empty ? "bg-gray-300" : colorFor(p);
            const rounded = i === 0 ? "rounded-l-full" : i === 6 ? "rounded-r-full" : "";
            return (
              <div
                key={i}
                className={`h-full ${segColor} ${rounded} border-r border-white/50 last:border-r-0`}
                title={`${titles[i]} (${Math.round(p * 100)}%)`}
                aria-label={`${labels[i]} ${Math.round(p * 100)}%`}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-1 flex justify-between">
        {labels.map((l, i) => (
          <span key={i} className="text-[10px] leading-none text-white">
            {l}
          </span>
        ))}
      </div>
    </section>
  );
}
