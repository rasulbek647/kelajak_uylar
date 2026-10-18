import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { listingId, reason, note } = await req.json();
    if (!listingId || !reason) {
      return NextResponse.json({ message: "Ma'lumotlar yetarli emas" }, { status: 400 });
    }
    const report = await prisma.report.create({
      data: { listingId, reason, note: note || null },
    });
    return NextResponse.json(report, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
