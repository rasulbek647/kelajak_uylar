import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac, createHash } from "crypto";

const BOT_TOKEN = "8979456061:AAHPubEufbXu1EdyjGXP4mf6IQlqvm4Xw44";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hash, phone, password, region, ...telegramUser } = body;

    const secretKey = createHash("sha256").update(BOT_TOKEN).digest();

    const dataCheckString = Object.keys(telegramUser)
      .sort()
      .map(key => `${key}=${telegramUser[key]}`)
      .join("\n");

    const expectedHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (expectedHash !== hash) {
      console.error("Hash mismatch:", { expectedHash, hash, dataCheckString });
      return NextResponse.json({ message: "Telegram hash xatosi" }, { status: 401 });
    }

    // Telegram ID bo'yicha foydalanuvchi bormi tekshiramiz
    const { id, first_name, last_name, username, photo_url } = telegramUser;
    const telegramId = String(id);
    const displayName = [first_name, last_name].filter(Boolean).join(" ");
    const phoneNumber = phone?.replace(/\s+/g, "") || `+tg${telegramId}`;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: phoneNumber },
          { phone: `+tg${telegramId}` }
        ]
      }
    });

    if (!user) {
      // Yangi foydalanuvchi yaratamiz
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password || Math.random().toString(36), 10);
      
      user = await prisma.user.create({
        data: {
          name: displayName || username || "Foydalanuvchi",
          phone: phoneNumber,
          password: hashedPassword,
          region: region || "Toshkent",
          avatar: photo_url || null,
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      phone: user.phone,
      name: user.name,
      userId: user.id,
    });
  } catch (err) {
    console.error("Telegram auth error:", err);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
