"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  currentTitle: string;
  currentDescription?: string | null;
  currentTargetPer: number;
  currentCadence: "DAILY" | "WEEKLY"; // 👈 NEW
  onClose: () => void;
};

export default function EditHabitForm({
  id, currentTitle, currentDescription, currentTargetPer, currentCadence, onClose,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription ?? "");
  const [targetPer, setTargetPer] = useState<number>(currentTargetPer);
  const [cadence, setCadence] = useState<"DAILY" | "WEEKLY">(currentCadence); // 👈 NEW
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, targetPer, cadence }), // 👈 include cadence
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Failed to update");
      setSaving(false);
      return;
    }

    router.refresh();
    onClose();
  }

  const goalLabel = cadence === "DAILY" ? "Goal (times / day)" : "Goal (times / week)";

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-3 text-gray-900">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
        <input className="w-full rounded-lg border px-3 py-2 text-gray-900" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
        <input className="w-full rounded-lg border px-3 py-2 text-gray-900" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* Cadence selector */}
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
        <input type="number" min={1} max={50} className="w-full rounded-lg border px-3 py-2 text-gray-900"
               value={targetPer} onChange={(e) => setTargetPer(Number(e.target.value))} required />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm border text-gray-900 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
