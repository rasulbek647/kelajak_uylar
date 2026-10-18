import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Tizimga kiring" }, { status: 401 });
    }

    const { name, region, avatar, isRealtor, showPhone } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Ism majburiy" }, { status: 400 });
    }

    const phone = (session.user as any).phone;

    const updatedUser = await prisma.user.update({
      where: { phone },
      data: { 
        name, 
        region, 
        ...(avatar && { avatar }),
        ...(typeof isRealtor === "boolean" && { isRealtor }),
        ...(typeof showPhone === "boolean" && { showPhone }),
      },
      select: { id: true, name: true, phone: true, region: true, role: true, avatar: true, isRealtor: true, showPhone: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Tizimga kiring" }, { status: 401 });
    }

    const phone = (session.user as any).phone;

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        listings: {
          orderBy: { createdAt: 'desc' },
          include: { images: true }
        }
      }
    });

    if (!user) {
        return NextResponse.json({ message: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    // Stats
    const stats = {
        listingsCount: user.listings.length,
        viewsCount: 0, // Mock for now
        callsCount: 0, // Mock for now
        salesCount: 0 // Mock for now
    };

    return NextResponse.json({
        user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            region: user.region,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt
        },
        listings: user.listings,
        stats
    });
  } catch (error) {
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
