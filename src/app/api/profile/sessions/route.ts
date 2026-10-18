import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const currentToken = (session.user as any).sessionToken;

    console.log("[Sessions GET] userId:", userId, "currentToken:", currentToken);

    if (!userId) {
      return NextResponse.json({ sessions: [], currentToken: "" });
    }

    // Hozirgi seans lastActive ni yangilaymiz
    if (currentToken) {
      await prisma.userSession.updateMany({
        where: { userId, token: currentToken },
        data: { lastActive: new Date() }
      }).catch((e) => {
        console.error("[Sessions GET] updateMany error:", e);
      });
    }

    // Barcha seanslarni olamiz
    const sessions = await prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActive: "desc" }
    });

    console.log("[Sessions GET] found sessions:", sessions.length);

    return NextResponse.json({
      sessions,
      currentToken: currentToken || ""
    });
  } catch (error) {
    console.error("Sessions GET xatosi:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const tokenId = url.searchParams.get("tokenId");
    const allOthers = url.searchParams.get("allOthers") === "true";

    const userId = (session.user as any).id;
    const currentToken = (session.user as any).sessionToken;

    console.log("[Sessions DELETE] userId:", userId, "tokenId:", tokenId, "allOthers:", allOthers, "currentToken:", currentToken);

    if (allOthers) {
      const result = await prisma.userSession.deleteMany({
        where: {
          userId,
          NOT: { token: currentToken || "" }
        }
      });
      console.log("[Sessions DELETE] allOthers deleted:", result.count);
      return NextResponse.json({ success: true, deleted: result.count });
    }

    if (tokenId) {
      // tokenId - bu DB dagi `id` (UUID)
      const result = await prisma.userSession.deleteMany({
        where: {
          userId,
          id: tokenId
        }
      });
      console.log("[Sessions DELETE] tokenId deleted:", result.count, "for id:", tokenId);
      return NextResponse.json({ success: true, deleted: result.count });
    }

    return NextResponse.json({ error: "Bad Request - tokenId yoki allOthers kerak" }, { status: 400 });
  } catch (error) {
    console.error("Sessions DELETE xatosi:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
