import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        listings: {
          where: { status: "ACTIVE", isHidden: false },
          orderBy: { createdAt: "desc" },
          include: { images: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      region: user.region,
      isVerified: user.isVerified ?? false,
      createdAt: user.createdAt,
      listingsCount: user.listings.length,
      listings: user.listings,
    });
  } catch (error) {
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
