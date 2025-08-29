import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Cadence as PrismaCadence } from "@prisma/client"; // ✅ use top-level type

const CADENCES: ReadonlyArray<PrismaCadence> = ["DAILY", "WEEKLY"];

export async function POST(req: NextRequest) {
  try {
    const { title, description, targetPer, cadence } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const goal = Number(targetPer ?? 1);
    if (!Number.isFinite(goal) || goal < 1 || goal > 50) {
      return NextResponse.json({ error: "targetPer must be 1–50" }, { status: 400 });
    }

    const cadRaw = typeof cadence === "string" ? cadence.toUpperCase() : "";
    const cad: PrismaCadence = (CADENCES as readonly string[]).includes(cadRaw)
      ? (cadRaw as PrismaCadence)
      : "WEEKLY";

    const habit = await prisma.habit.create({
      data: {
        title: title.trim(),
        description: description?.toString().trim() || null,
        targetPer: goal,
        cadence: cad, // ✅ typed correctly
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}
