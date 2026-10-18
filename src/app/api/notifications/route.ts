import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/server-utils";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Foydalanuvchiga kelgan o'qilmagan chat xabarlari
  const unreadMessages = await prisma.message.findMany({
    where: {
      read: false,
      senderId: { not: user.id },
      conversation: {
        participants: {
          some: { id: user.id }
        }
      }
    },
    include: {
      sender: { select: { name: true, avatar: true } },
      conversation: { select: { listingId: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const listingIds = unreadMessages.map(m => m.conversation?.listingId).filter(Boolean) as string[];
  let listings: any[] = [];
  if (listingIds.length > 0) {
    listings = await prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, title: true }
    });
  }

  const result = unreadMessages.map(msg => ({
    ...msg,
    listingTitle: msg.conversation?.listingId ? listings.find(l => l.id === msg.conversation.listingId)?.title : null
  }));

  // 2. Agar foydalanuvchi ADMIN bo'lsa — platformadagi eng so'nggi shikoyatlarni (reports) qo'shamiz
  let reports: any[] = [];
  if (user.role === "ADMIN") {
    const rawReports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const reportListingIds = [...new Set(rawReports.map(r => r.listingId))];
    let repMap: Record<string, string> = {};
    if (reportListingIds.length > 0) {
      const repListings = await prisma.listing.findMany({
        where: { id: { in: reportListingIds } },
        select: { id: true, title: true }
      });
      repListings.forEach(l => { repMap[l.id] = l.title; });
    }

    reports = rawReports.map(r => ({
      ...r,
      listingTitle: repMap[r.listingId] || "O'chirilgan e'lon"
    }));
  }

  return NextResponse.json({ 
    unreadMessages: result,
    reports: reports,
    isAdmin: user.role === "ADMIN"
  });
}
