import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserId } from "@/lib/auth-helpers";

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const habit = await prisma.habit.findFirst({
    where: { id, userId },
    select: { id: true }
  });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const delta = Number(body?.delta ?? 1);
  const date = todayUTC();

  const entry = await prisma.habitEntry.upsert({
    where: { habitId_date: { habitId: habit.id, date } },
    update: { count: { increment: delta } },
    create: { habitId: habit.id, date, count: delta }
  });

  return NextResponse.json(entry);
}
