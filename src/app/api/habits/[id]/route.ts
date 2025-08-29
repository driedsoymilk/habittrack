import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, description, targetPer } = await req.json();

    const data: Record<string, any> = {};
    if (typeof title === "string" && title.trim().length > 0) data.title = title.trim();
    if (typeof description === "string") data.description = description.trim() || null;
    if (targetPer !== undefined) {
      const goal = Number(targetPer);
      if (!Number.isFinite(goal) || goal < 1 || goal > 50) {
        return NextResponse.json({ error: "targetPer must be 1–50" }, { status: 400 });
      }
      data.targetPer = goal;
    }

    const habit = await prisma.habit.update({
      where: { id: params.id },
      data,
      select: { id: true, title: true, description: true, targetPer: true, archived: true },
    });

    return NextResponse.json(habit);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const habit = await prisma.habit.update({
      where: { id: params.id },
      data: { archived: true },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: habit.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to archive habit" }, { status: 500 });
  }
}
