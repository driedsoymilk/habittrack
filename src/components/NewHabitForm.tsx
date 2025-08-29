"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { onCreated?: () => void };

export default function NewHabitForm({ onCreated }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetPer, setTargetPer] = useState(1);
  const [cadence, setCadence] = useState<"DAILY" | "WEEKLY">("WEEKLY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goalLabel = cadence === "DAILY" ? "Goal (times / day)" : "Goal (times / week)";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, targetPer, cadence }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Something went wrong");
      setSubmitting(false);
      return;
    }

    setTitle(""); setDescription(""); setTargetPer(1); setCadence("WEEKLY");
    router.refresh();
    setSubmitting(false);
    onCreated?.(); // 👈 auto-close the panel
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border p-5 bg-white mb-6 text-gray-900">
      <h3 className="text-base font-semibold text-gray-900 mb-3">New Habit</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-gray-900"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Read 10 pages"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-900 mb-1">Description (optional)</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-gray-900"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Daily reading"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Cadence</label>
          <select
            className="w-full rounded-lg border px-3 py-2 text-gray-900"
            value={cadence}
            onChange={(e) => setCadence(e.target.value as "DAILY" | "WEEKLY")}
          >
            <option value="WEEKLY">Weekly</option>
            <option value="DAILY">Daily</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">{goalLabel}</label>
          <input
            type="number" min={1} max={50}
            className="w-full rounded-lg border px-3 py-2 text-gray-900"
            value={targetPer}
            onChange={(e) => setTargetPer(Number(e.target.value))}
            required
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-lg px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Add Habit"}
      </button>
    </form>
  );
}
