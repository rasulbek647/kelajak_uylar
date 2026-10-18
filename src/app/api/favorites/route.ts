import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Tizimga kiring" }, { status: 401 });
  }

  const userPhone = (session.user as any).phone;
  const user = await prisma.user.findUnique({ where: { phone: userPhone } });
  
  if (!user) {
    return NextResponse.json({ message: "Topilmadi" }, { status: 404 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        include: { images: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(favorites.map(f => f.listing));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Tizimga kiring" }, { status: 401 });
  }

  const userPhone = (session.user as any).phone;
  const user = await prisma.user.findUnique({ where: { phone: userPhone } });
  
  if (!user) return NextResponse.json({ message: "Topilmadi" }, { status: 404 });

  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ message: "ListingId majburiy" }, { status: 400 });

  try {
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        listingId
      }
    });
    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    // Already exists
    return NextResponse.json({ message: "Allaqachon qo'shilgan" }, { status: 200 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Tizimga kiring" }, { status: 401 });
  }

  const userPhone = (session.user as any).phone;
  const user = await prisma.user.findUnique({ where: { phone: userPhone } });
  if (!user) return NextResponse.json({ message: "Topilmadi" }, { status: 404 });

  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ message: "ListingId majburiy" }, { status: 400 });

  await prisma.favorite.deleteMany({
    where: {
      userId: user.id,
      listingId
    }
  });

  return NextResponse.json({ success: true });
}