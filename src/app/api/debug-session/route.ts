import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Bu endpoint debug uchun - hamma ma'lumotni ko'rsatadi
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" });
  }

  const userId = (session.user as any).id;
  const sessionToken = (session.user as any).sessionToken;

  // DB dagi barcha seanslar
  const dbSessions = userId ? await prisma.userSession.findMany({
    where: { userId },
    orderBy: { lastActive: "desc" }
  }) : [];

  return NextResponse.json({
    sessionUser: {
      id: userId,
      name: session.user.name,
      sessionToken: sessionToken,
      hasSessionToken: !!sessionToken,
    },
    dbSessions: dbSessions.map(s => ({
      id: s.id,
      token: s.token,
      device: s.device,
      lastActive: s.lastActive,
      isCurrentMatch: s.token === sessionToken,
    })),
    dbSessionsCount: dbSessions.length,
  });
}
