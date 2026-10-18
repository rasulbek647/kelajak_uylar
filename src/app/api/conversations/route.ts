import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/server-utils";

// GET: Foydalanuvchining barcha suhbatlarini olish
export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { 
      participants: { some: { id: user.id } },
    },
    include: {
      participants: { select: { id: true, name: true, avatar: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const listingIds = conversations.map(c => c.listingId).filter(Boolean) as string[];
  let listings: any[] = [];
  if (listingIds.length > 0) {
    listings = await prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, title: true }
    });
  }

  const result = conversations
    .map(c => ({
      ...c,
      listingTitle: c.listingId ? listings.find(l => l.id === c.listingId)?.title : null,
      // Server tomonidan boshqa ishtirokchini aniqlaymiz
      otherParticipant: c.participants.find((p: any) => p.id !== user.id) || null,
    }))
    .filter(c => c.otherParticipant !== null);

  return NextResponse.json(result);
}

// POST: Yangi suhbat yaratish yoki mavjudini topib qaytarish
export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });

  const { recipientId, listingId } = await req.json();
  if (!recipientId) return NextResponse.json({ error: "Qabul qiluvchi ko'rsatilmadi" }, { status: 400 });
  if (recipientId === user.id) return NextResponse.json({ error: "O'zingizga xabar yubora olmaysiz" }, { status: 400 });

  // Mavjud suhbatni tekshir
  const whereClause: any = {
    AND: [
      { participants: { some: { id: user.id } } },
      { participants: { some: { id: recipientId } } },
    ],
  };

  if (listingId) {
    whereClause.listingId = listingId;
  }

  const existing = await prisma.conversation.findFirst({
    where: whereClause,
  });

  let listingTitle = null;
  if (listingId) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { title: true } });
    if (listing) listingTitle = listing.title;
  }

  if (existing) {
    return NextResponse.json({ ...existing, listingTitle });
  }

  const conversation = await prisma.conversation.create({
    data: {
      listingId: listingId || null,
      participants: { connect: [{ id: user.id }, { id: recipientId }] },
    },
  });

  return NextResponse.json({ ...conversation, listingTitle });
}
