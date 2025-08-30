import { prisma } from "@/lib/prisma";
import HabitCard from "@/components/HabitCard";
import AddHabitPanel from "@/components/AddHabitPanel";
import GlobalDailyHeatmap from "@/components/GlobalDailyHeatmap";
import GlobalWeeklySummary from "@/components/GlobalWeeklySummary";
import { startOfWeekUTC, endOfWeekUTC, toMidnightUTC, lastNDaysUTC } from "@/lib/dates";
import type { Cadence } from "@/types/habits";
import AuthButtons from "@/components/AuthButtons";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserId } from "@/lib/auth-helpers";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Habit Dashboard</h1>
        <AuthButtons userName={session?.user?.name ?? null} />
      </div>

      {!userId ? (
        <p className="text-white">Sign in to view your dashboard.</p>
      ) : (
        await renderAuthed(userId)
      )}
    </main>
  );
}

async function renderAuthed(userId: string) {
  const data = await loadHabitsData(userId);

  return (
    <>
      <GlobalDailyHeatmap
        labels={data.globalDaily.labels}
        titles={data.globalDaily.titles}
        percents={data.globalDaily.percents}
        empty={data.globalDaily.totalTarget === 0}
      />
      <GlobalWeeklySummary completed={data.globalWeekly.completed} target={data.globalWeekly.target} />
      <AddHabitPanel />
      {data.habits.length === 0 ? (
        <p className="text-white">No habits yet. Click “Add Habit” to create your first one.</p>
      ) : (
        <div className="space-y-4">
          {data.habits.map((h) => (
            <HabitCard
              key={h.id}
              id={h.id}
              title={h.title}
              description={h.description}
              targetPer={h.targetPer}
              cadence={h.cadence as Cadence}
              weeklyCount={data.weeklyCounts[h.id] ?? 0}
              todayCount={data.todayCounts[h.id] ?? 0}
            />
          ))}
        </div>
      )}
    </>
  );
}

async function loadHabitsData(userId: string) {
  const habits = await prisma.habit.findMany({
    where: { archived: false, userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, description: true, targetPer: true, cadence: true }
  });

  const start = startOfWeekUTC();
  const end = endOfWeekUTC();
  const today = toMidnightUTC(new Date());
  const days = lastNDaysUTC(7);

  const perHabit = await Promise.all(
    habits.map(async (h) => {
      const [weekAgg, todayEntry] = await Promise.all([
        prisma.habitEntry.aggregate({
          where: { habitId: h.id, date: { gte: start, lt: end } },
          _sum: { count: true }
        }),
        prisma.habitEntry.findUnique({
          where: { habitId_date: { habitId: h.id, date: today } },
          select: { count: true }
        })
      ]);
      return {
        id: h.id,
        weeklyCount: weekAgg._sum.count ?? 0,
        todayCount: todayEntry?.count ?? 0
      };
    })
  );

  const weeklyCounts = Object.fromEntries(perHabit.map((r) => [r.id, r.weeklyCount]));
  const todayCounts = Object.fromEntries(perHabit.map((r) => [r.id, r.todayCount]));

  const dailyHabits = habits.filter((hh) => hh.cadence === "DAILY");
  const totalDailyTarget = dailyHabits.reduce((s, hh) => s + hh.targetPer, 0);

  let percents: number[] = Array(7).fill(0);
  if (totalDailyTarget > 0 && dailyHabits.length > 0) {
    const entries = await prisma.habitEntry.findMany({
      where: { habitId: { in: dailyHabits.map((hh) => hh.id) }, date: { gte: days[0] } },
      select: { habitId: true, date: true, count: true }
    });

    const norm = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const toKey = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const entryMap = new Map<string, number>();
    for (const e of entries) {
      const d = norm(e.date);
      const key = `${e.habitId}|${toKey(d)}`;
      entryMap.set(key, (entryMap.get(key) ?? 0) + e.count);
    }

    percents = days.map((d) => {
      const keyDate = toKey(d);
      const completed = dailyHabits.reduce((sum, hh) => {
        const c = entryMap.get(`${hh.id}|${keyDate}`) ?? 0;
        return sum + Math.min(c, hh.targetPer);
      }, 0);
      return Math.max(0, Math.min(1, completed / totalDailyTarget));
    });
  }

  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const labels = days.map((d) => weekday[d.getUTCDay()]);
  const titles = days.map((d, i) => {
    const pct = Math.round(percents[i] * 100);
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    return `${m}/${day} — ${pct}% of daily goals`;
  });
  const globalDaily = { labels, titles, percents, totalTarget: totalDailyTarget };

  const weeklyHabits = habits.filter((hh) => hh.cadence === "WEEKLY");
  const weeklyTarget = weeklyHabits.reduce((s, hh) => s + hh.targetPer, 0);
  const weeklyCompleted = weeklyHabits.reduce((s, hh) => {
    const done = weeklyCounts[hh.id] ?? 0;
    return s + Math.min(done, hh.targetPer);
  }, 0);
  const globalWeekly = { target: weeklyTarget, completed: weeklyCompleted };

  return { habits, weeklyCounts, todayCounts, globalDaily, globalWeekly };
}
