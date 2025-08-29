import { prisma } from "@/lib/prisma";
import HabitCard from "@/components/HabitCard";
import NewHabitForm from "@/components/NewHabitForm";
import { startOfWeekUTC, endOfWeekUTC } from "@/lib/dates";

export default async function Dashboard() {
  const [habits, weeklyCounts] = await loadHabitsWithWeeklyCounts();

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Habit Dashboard</h1>

      <NewHabitForm />

      {habits.length === 0 ? (
        <p className="text-gray-500">No habits yet. Create one above.</p>
      ) : (
        <div className="space-y-4">
          {habits.map((h) => (
            <HabitCard
              key={h.id}
              id={h.id}
              title={h.title}
              description={h.description ?? ""}
              targetPer={h.targetPer}
              weeklyCount={weeklyCounts[h.id] ?? 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}

async function loadHabitsWithWeeklyCounts() {
  const habits = await prisma.habit.findMany({
    where: { archived: false },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, description: true, targetPer: true },
  });

  const start = startOfWeekUTC();
  const end = endOfWeekUTC();

  // Aggregate per habit (1 query per habit — fine for small lists)
  const counts = await Promise.all(
    habits.map(async (h) => {
      const agg = await prisma.habitEntry.aggregate({
        where: { habitId: h.id, date: { gte: start, lt: end } },
        _sum: { count: true },
      });
      return [h.id, agg._sum.count ?? 0] as const;
    })
  );

  // Turn into a map { [habitId]: number }
  const weeklyCounts = Object.fromEntries(counts);
  return [habits, weeklyCounts] as const;
}
