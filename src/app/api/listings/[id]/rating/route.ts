import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Baho yuborish
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { stars, comment } = await req.json();

    if (!stars || stars < 1 || stars > 5) {
      return NextResponse.json({ message: "Yulduz soni 1-5 orasida bo'lishi kerak" }, { status: 400 });
    }

    const rating = await prisma.rating.create({
      data: { listingId: id, stars, comment }
    });

    return NextResponse.json(rating);
  } catch (error) {
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}

// Baholarni olish
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const ratings = await prisma.rating.findMany({
      where: { listingId: id },
      orderBy: { createdAt: "desc" }
    });

    const avg = ratings.length > 0
      ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
      : 0;

    return NextResponse.json({ ratings, avg, count: ratings.length });
  } catch (error) {
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
