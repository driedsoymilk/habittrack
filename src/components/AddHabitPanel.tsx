"use client";

import { useState } from "react";
import NewHabitForm from "@/components/NewHabitForm";

export default function AddHabitPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="rounded-lg px-3 py-2 text-sm border text-white hover:bg-white/10"
      >
        {open ? "Close" : "Add Habit"}
      </button>

      {open && (
        <div className="mt-3">
          <NewHabitForm onCreated={() => setOpen(false)} />
        </div>
      )}
    </section>
  );
}
