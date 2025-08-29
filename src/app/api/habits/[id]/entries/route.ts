import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// helper: normalize to midnight UTC
function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const habitId = params.id;
    const body = await req.json().catch(() => ({}));
    const delta = body.delta ?? 1;
    const date = todayUTC();

    const entry = await prisma.habitEntry.upsert({
      where: {
        habitId_date: { habitId, date }, // composite unique key
      },
      update: { count: { increment: delta } },
      create: { habitId, date, count: delta },
    });

    return NextResponse.json(entry);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
