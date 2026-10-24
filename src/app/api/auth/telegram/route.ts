import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { createTelegramLoginToken } from "@/lib/auth-secret";

export async function POST(req: Request) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN sozlanmagan");
      return NextResponse.json({ message: "Telegram bot konfiguratsiya qilinmagan" }, { status: 500 });
    }

    const body = await req.json();
    const { hash, region, ...telegramUser } = body;

    if (!hash || typeof hash !== "string" || hash.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(hash)) {
      return NextResponse.json({ message: "Telegram hash noto'g'ri" }, { status: 401 });
    }

    // auth_date tekshiruvi: 24 soatdan eski bo'lsa 401
    const authDateNum = Number(telegramUser.auth_date);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!authDateNum || nowSeconds - authDateNum > 86400 || authDateNum > nowSeconds + 300) {
      return NextResponse.json({ message: "Telegram avtorizatsiya muddati o'tgan" }, { status: 401 });
    }

    // Hash faqat id, first_name, last_name, username, photo_url, auth_date maydonlaridan hisoblanadi
    const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
    const allowedKeys = ["auth_date", "first_name", "id", "last_name", "photo_url", "username"];
    const dataCheckParts: string[] = [];

    for (const key of allowedKeys.sort()) {
      if (telegramUser[key] !== undefined && telegramUser[key] !== null) {
        dataCheckParts.push(`${key}=${telegramUser[key]}`);
      }
    }

    const dataCheckString = dataCheckParts.join("\n");
    const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    const expectedBuf = Buffer.from(expectedHash, "hex");
    const receivedBuf = Buffer.from(hash, "hex");

    if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
      return NextResponse.json({ message: "Telegram hash xatosi" }, { status: 401 });
    }

    // Mijoz yuborgan telefon raqamiga ishonilmaydi!
    // Foydalanuvchini faqat telegramId yoki phone = `+tg<id>` bo'yicha qidiramiz
    const telegramId = String(telegramUser.id);
    const tgPhone = `+tg${telegramId}`;
    const displayName = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ");

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { telegramId },
          { phone: tgPhone }
        ]
      }
    });

    if (!user) {
      const bcrypt = await import("bcryptjs");
      const randomPass = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPass, 10);

      user = await prisma.user.create({
        data: {
          name: displayName || telegramUser.username || "Foydalanuvchi",
          phone: tgPhone,
          telegramId: telegramId,
          password: hashedPassword,
          region: region || "Toshkent",
          avatar: telegramUser.photo_url || null,
        }
      });
    } else if (!user.telegramId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { telegramId }
      });
    }

    const loginToken = createTelegramLoginToken(user.id);

    return NextResponse.json({ 
      success: true, 
      phone: user.phone,
      name: user.name,
      loginToken,
    });
  } catch (err) {
    console.error("Telegram auth error:", err);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
