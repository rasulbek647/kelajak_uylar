import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminFromDB } from "@/lib/server-utils";

// GET - barcha elonlarni olish (filter bilan)
export async function GET(req: Request) {
  if (!(await isAdminFromDB())) {
    return NextResponse.json({ message: "Ruxsat yoq" }, { status: 403 });
  }
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const where: any = {};
  if (status && status !== "ALL") where.status = status;

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, phone: true } }, images: { take: 1 } },
  });
  return NextResponse.json(listings);
}

// PATCH - elon statusini yoki VIP ni ozgartirish
export async function PATCH(req: Request) {
  if (!(await isAdminFromDB())) {
    return NextResponse.json({ message: "Ruxsat yoq" }, { status: 403 });
  }
  const { listingId, status, id, isVip } = await req.json();
  const targetId = listingId || id;
  
  if (!targetId) {
    return NextResponse.json({ message: "listingId kerak" }, { status: 400 });
  }
  
  const dataToUpdate: any = {};
  if (status !== undefined) dataToUpdate.status = status;
  if (isVip !== undefined) dataToUpdate.isVip = isVip;

  const updated = await prisma.listing.update({
    where: { id: targetId },
    data: dataToUpdate,
  });
  return NextResponse.json(updated);
}

// DELETE - elonni ochirish
export async function DELETE(req: Request) {
  if (!(await isAdminFromDB())) {
    return NextResponse.json({ message: "Ruxsat yoq" }, { status: 403 });
  }
  const { listingId } = await req.json();
  if (!listingId) {
    return NextResponse.json({ message: "listingId kerak" }, { status: 400 });
  }
  await prisma.listing.delete({ where: { id: listingId } });
  return NextResponse.json({ success: true });
}
