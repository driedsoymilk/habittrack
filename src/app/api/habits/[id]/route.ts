import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserId } from "@/lib/auth-helpers";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const { title, description, targetPer, cadence } = await req.json();

  const owns = await prisma.habit.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (typeof title === "string" && title.trim()) data.title = title.trim();
  if (typeof description === "string") data.description = description.trim() || null;
  if (targetPer !== undefined) {
    const goal = Number(targetPer);
    if (!Number.isFinite(goal) || goal < 1 || goal > 50) {
      return NextResponse.json({ error: "targetPer must be 1–50" }, { status: 400 });
    }
    data.targetPer = goal;
  }
  if (typeof cadence === "string" && (cadence === "DAILY" || cadence === "WEEKLY")) {
    data.cadence = cadence;
  }

  const updated = await prisma.habit.update({
    where: { id },
    data,
    select: { id: true, title: true, description: true, targetPer: true, cadence: true, archived: true }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const owns = await prisma.habit.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owns) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.habit.update({ where: { id }, data: { archived: true } });
  return NextResponse.json({ ok: true });
}
