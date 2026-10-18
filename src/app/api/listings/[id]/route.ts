import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession, isAdminFromDB } from "@/lib/server-utils";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: true,
        user: {
          select: { name: true, phone: true, avatar: true, isRealtor: true }
        }
      }
    });

    if (!listing) {
      return NextResponse.json({ message: "E'lon topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ message: "Tizimga kiring" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const listing = await prisma.listing.findUnique({
      where: { id: id }
    });

    if (!listing) {
      return NextResponse.json({ message: "E'lon topilmadi" }, { status: 404 });
    }

    // Faqat e'lon egasi yoki admin o'chira oladi
    const isAdmin = user.role === "ADMIN";
    if (listing.userId !== user.id && !isAdmin) {
      return NextResponse.json({ message: "Sizda bu e'lonni o'chirish huquqi yo'q" }, { status: 403 });
    }

    await prisma.listing.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}

// Ko'rishlar sonini oshirish
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Xatolik" }, { status: 500 });
  }
}

// E'lonni tahrirlash (Edit)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ message: "Tizimga kiring" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!listing) return NextResponse.json({ message: "E'lon topilmadi" }, { status: 404 });
    if (listing.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ message: "Sizda bu huquq yo'q" }, { status: 403 });
    }

    const {
      title, description, price, currency, location, rooms, area, 
      type, dealType, ownerType, lat, lng, newImagesUrls, imagesToDelete, amenities
    } = body;

    // Yangilash
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title, description, price: parseFloat(price), currency, location, 
        rooms: parseInt(rooms), area: parseFloat(area), type, dealType, ownerType,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        amenities: amenities || [],
      }
    });

    // Eskirgan rasmlarni o'chirish
    if (imagesToDelete && imagesToDelete.length > 0) {
      await prisma.listingImage.deleteMany({
        where: { id: { in: imagesToDelete } }
      });
    }

    // Yangi rasmlarni qo'shish
    if (newImagesUrls && newImagesUrls.length > 0) {
      await prisma.listingImage.createMany({
        data: newImagesUrls.map((url: string) => ({
          url,
          listingId: id
        }))
      });
    }

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
