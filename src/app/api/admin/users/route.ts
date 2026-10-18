import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminFromDB } from "@/lib/server-utils";

// GET - barcha userlarni olish
export async function GET() {
  if (!(await isAdminFromDB())) {
    return NextResponse.json({ message: "Ruxsat yoq" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { listings: true } } },
  });
  return NextResponse.json(users);
}

// PATCH - user rolini yoki badge ni ozgartirish
export async function PATCH(req: Request) {
  if (!(await isAdminFromDB())) {
    return NextResponse.json({ message: "Ruxsat yoq" }, { status: 403 });
  }
  const body = await req.json();
  const { userId, role, badge } = body;
  if (!userId) {
    return NextResponse.json({ message: "userId kerak" }, { status: 400 });
  }
  const updateData: any = {};
  if (role !== undefined) updateData.role = role;
  if (badge !== undefined) updateData.badge = badge;
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message: "role yoki badge kerak" }, { status: 400 });
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
  return NextResponse.json(updated);
}

// DELETE - userni ochirish
export async function DELETE(req: Request) {
  if (!(await isAdminFromDB())) {
    return NextResponse.json({ message: "Ruxsat yoq" }, { status: 403 });
  }
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ message: "userId kerak" }, { status: 400 });
  }
  await prisma.listing.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
