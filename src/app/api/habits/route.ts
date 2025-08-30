import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserId } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, targetPer, cadence } = await req.json();
  const goal = Number(targetPer ?? 1);
  if (!title || !Number.isFinite(goal) || goal < 1 || goal > 50) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const habit = await prisma.habit.create({
    data: {
      userId,
      title: String(title).trim(),
      description: description ? String(description).trim() : null,
      targetPer: goal,
      cadence: cadence === "DAILY" ? "DAILY" : "WEEKLY"
    }
  });

  return NextResponse.json(habit, { status: 201 });
}
