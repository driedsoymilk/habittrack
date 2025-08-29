"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditHabitForm from "@/components/EditHabitForm";
import type { Cadence } from "@/types/habits";

type HabitCardProps = {
  id: string;
  title: string;
  description?: string | null;
  targetPer: number;
  cadence: Cadence;          // "DAILY" | "WEEKLY"
  weeklyCount: number;       // total this week
  todayCount: number;        // total today
};

export default function HabitCard({
  id,
  title,
  description,
  targetPer,
  cadence,
  weeklyCount,
  todayCount,
}: HabitCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const isDaily = cadence === "DAILY";
  const numerator = isDaily ? todayCount : weeklyCount;
  const denominator = targetPer; // DAILY uses /day; WEEKLY uses /week
  const progress = Math.max(0, Math.min(1, denominator ? numerator / denominator : 0));
  const goalLabel = isDaily ? `Goal: ${targetPer}×/day` : `Goal: ${targetPer}×/week`;
  const progressLabel = isDaily ? "Today" : "This week";

  async function handleCheckIn() {
    setLoading(true);
    await fetch(`/api/habits/${id}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta: 1 }),
    });
    router.refresh();
    setLoading(false);
  }

  async function handleArchive() {
    if (!confirm("Archive this habit? It will be hidden but history kept.")) return;
    setLoading(true);
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  async function handleHardDelete() {
    if (!confirm("Permanently delete this habit AND all its history? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/habits/${id}/hard-delete`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border p-5 shadow-sm bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-900 mt-1">{description}</p>}
        </div>

        <span
          className="shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-gray-900 bg-gray-100"
          title={goalLabel}
        >
          {goalLabel}
        </span>
      </div>

      {/* Progress (daily or weekly) */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-1 text-gray-900">
          <span>{progressLabel}</span>
          <span className="font-medium">
            {numerator} / {denominator}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden" aria-label={`${progressLabel} progress`}>
          <div
            className={`h-full ${progress >= 1 ? "bg-green-600" : "bg-green-500"}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="rounded-lg px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Check in"}
        </button>
        <button
          onClick={() => setEditing((s) => !s)}
          className="rounded-lg px-3 py-1.5 text-sm border text-gray-900 hover:bg-gray-50"
        >
          {editing ? "Close edit" : "Edit"}
        </button>
        <button
          onClick={handleArchive}
          disabled={loading}
          className="rounded-lg px-3 py-1.5 text-sm border text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          title="Archive (keeps history)"
        >
          Archive
        </button>
        <button
          onClick={handleHardDelete}
          disabled={loading}
          className="rounded-lg px-3 py-1.5 text-sm border text-gray-900 hover:bg-red-50 disabled:opacity-50"
          title="Delete permanently (removes history)"
        >
          Delete
        </button>
      </div>

      {editing && (
        <EditHabitForm
          id={id}
          currentTitle={title}
          currentDescription={description}
          currentTargetPer={targetPer}
          currentCadence={cadence}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
