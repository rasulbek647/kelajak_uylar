import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const where: any = {
    listings: {
      some: {
        status: "ACTIVE",
        isHidden: false,
      },
    },
  };

  if (q.trim()) {
    where.name = { contains: q.trim(), mode: "insensitive" };
  }

  const agents = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      phone: true,
      avatar: true,
      badge: true,
      showPhone: true,
      _count: {
        select: {
          listings: {
            where: {
              status: "ACTIVE",
              isHidden: false,
            },
          },
        },
      },
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
      phone: a.showPhone !== false ? a.phone : null,
      avatar: a.avatar,
      badge: a.badge ?? "NONE",
      listingsCount: a._count.listings,
    }))
  );
}
