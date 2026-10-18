import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const agents = await prisma.user.findMany({
    where: q
      ? { name: { contains: q } }
      : undefined,
    include: {
      _count: { select: { listings: true } },
    },
    orderBy: {
      listings: { _count: "desc" },
    },
    take: 50,
  });

  return NextResponse.json(
    agents.map(a => ({
      id: a.id,
      name: a.name,
      phone: a.phone,
      avatar: a.avatar,
      badge: a.badge ?? "NONE",
      listingsCount: a._count.listings,
    }))
  );
}
