import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/server-utils";

// GET: Suhbatdagi xabarlarni olish
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  const { id } = await params;

  // Foydalanuvchi bu suhbat a'zosimi?
  const conv = await prisma.conversation.findFirst({
    where: { id, participants: { some: { id: user.id } } },
  });
  if (!conv) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  // O'qilmagan xabarlarni o'qilgan qil
  await prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: user.id }, read: false },
    data: { read: true },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

// POST: Xabar yuborish
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  const { id } = await params;
  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Xabar bo'sh bo'lishi mumkin emas" }, { status: 400 });

  const conv = await prisma.conversation.findFirst({
    where: { id, participants: { some: { id: user.id } } },
  });
  if (!conv) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const message = await prisma.message.create({
    data: { conversationId: id, senderId: user.id, text: text.trim() },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  // Suhbat updatedAt ni yangilash (birinchi ko'rsatish uchun)
  await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json(message);
}

// DELETE: Suhbatni o'chirish
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  const { id } = await params;
  const conv = await prisma.conversation.findFirst({
    where: { id, participants: { some: { id: user.id } } },
  });
  if (!conv) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await prisma.conversation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
