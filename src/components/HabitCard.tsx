"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EditHabitForm from "./EditHabitForm";

type HabitCardProps = {
  id: string;
  title: string;
  description?: string;
  targetPer: number;
  weeklyCount: number;
};

export default function HabitCard({ id, title, description, targetPer, weeklyCount }: HabitCardProps) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  const progress = Math.max(0, Math.min(1, targetPer ? weeklyCount / targetPer : 0));

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
    if (!confirm("Archive this habit?")) return;
    setLoading(true);
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  async function handleHardDelete() {
  if (!confirm("Permanently delete this habit and ALL its history? This cannot be undone.")) return;
  setLoading(true);
  await fetch(`/api/habits/${id}/hard-delete`, { method: "DELETE" });
  router.refresh();
  setLoading(false);
  }


  return (
    <div className="rounded-2xl border p-5 shadow-sm bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* Title now strong black */}
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {/* Description also black for readability */}
          {description && <p className="text-sm text-gray-900 mt-1">{description}</p>}
        </div>
        {/* Goal badge text made black */}
        <span className="shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-gray-900 bg-gray-100">
          Goal: {targetPer}×/week
        </span>
      </div>

      {/* Weekly progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-1 text-gray-900">
          <span>This week</span>
          <span className="font-medium">{weeklyCount} / {targetPer}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full ${progress >= 1 ? "bg-green-600" : "bg-green-500"}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Actions: all black text when not filled */}
      <div className="mt-4 flex items-center gap-2">
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
        >
          Archive
        </button>
        <button
          onClick={handleHardDelete}
          disabled={loading}
          className="rounded-lg px-3 py-1.5 text-sm border text-gray-900 hover:bg-red-50 disabled:opacity-50"
          title="Permanently delete habit and all entries"
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
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
