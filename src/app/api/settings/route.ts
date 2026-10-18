import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: "default" }
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: { id: "default" }
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}

async function isAdminFromDB(session: any): Promise<boolean> {
  if (!session?.user) return false;
  const phone = (session.user as any).phone;
  if (!phone) return false;
  const user = await prisma.user.findUnique({ where: { phone } });
  return user?.role === "ADMIN";
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const isAdmin = await isAdminFromDB(session);
    if (!isAdmin) {
      return NextResponse.json({ message: "Ruxsat yo'q. Admin huquqi talab etiladi." }, { status: 403 });
    }

    const body = await req.json();
    
    // faqat ruxsat etilgan maydonlarni yangilaymiz
    const updatedSettings = await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: {
        siteName: body.siteName,
        contactPhone: body.contactPhone,
        contactPhone2: body.contactPhone2,
        telegramUrl: body.telegramUrl,
        instagramUrl: body.instagramUrl,
        defaultCurrency: body.defaultCurrency,
        autoApprove: body.autoApprove,
        freeListingLimit: body.freeListingLimit,
        listingActiveDays: body.listingActiveDays,
        telegramBotToken: body.telegramBotToken,
        telegramChatId: body.telegramChatId,
      },
      create: {
        id: "default",
        siteName: body.siteName,
        contactPhone: body.contactPhone,
        contactPhone2: body.contactPhone2,
        telegramUrl: body.telegramUrl,
        instagramUrl: body.instagramUrl,
        defaultCurrency: body.defaultCurrency,
        autoApprove: body.autoApprove,
        freeListingLimit: body.freeListingLimit || 3,
        listingActiveDays: body.listingActiveDays || 30,
        telegramBotToken: body.telegramBotToken,
        telegramChatId: body.telegramChatId,
      }
    });

    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
