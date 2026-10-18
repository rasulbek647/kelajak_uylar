import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Telegram bot token — faqat .env dan olinadi
const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

// Bir raqamga soatiga maksimal 5 ta kod yuboriladi (rate limit)
const OTP_RATE_LIMIT_PER_HOUR = 5;
// Kod muddati: 5 daqiqa (xavfsizlik uchun)
const OTP_EXPIRE_MINUTES = 5;

async function sendTelegramMessage(chatId: number, text: string, extra?: object) {
  if (!botToken) {
    console.warn("TELEGRAM_BOT_TOKEN muhit o'zgaruvchisi yo'q");
    return;
  }
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", ...extra }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!botToken) {
      return NextResponse.json({ ok: false, error: "Bot konfiguratsiya qilinmagan" });
    }

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      if (text === "/start" || text?.startsWith("/start")) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Assalomu alaykum! 👋\n\n*Kelajak Uylar* saytiga kirish yoki ro'yxatdan o'tish uchun telefon raqamingizni yuboring:",
            parse_mode: "Markdown",
            reply_markup: {
              keyboard: [
                [{ text: "📱 Telefon raqamni yuborish", request_contact: true }],
              ],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          }),
        });
      } else if (body.message.contact) {
        let phone = body.message.contact.phone_number;
        if (!phone.startsWith("+")) phone = "+" + phone;

        // Rate limiting tekshiruvi
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentCodes = await prisma.otpCode.count({
          where: {
            phone,
            createdAt: { gte: oneHourAgo },
          },
        });

        if (recentCodes >= OTP_RATE_LIMIT_PER_HOUR) {
          await sendTelegramMessage(
            chatId,
            "⚠️ Siz juda ko'p kod so'radingiz. Iltimos, 1 soatdan keyin qayta urinib ko'ring."
          );
          return NextResponse.json({ ok: true });
        }

        // 6 xonali kod yaratish
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

        // Eski kodni yangilash yoki yangi yaratish
        await prisma.otpCode.upsert({
          where: { phone },
          update: { code, expiresAt, createdAt: new Date() },
          create: { phone, code, expiresAt },
        });

        await sendTelegramMessage(
          chatId,
          `✅ Sizning tasdiqlash kodingiz:\n\n*${code}*\n\nKodni saytga kiriting. Kod *${OTP_EXPIRE_MINUTES} daqiqa* davomida amal qiladi.`,
          { reply_markup: { remove_keyboard: true } }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook xatosi:", err);
    return NextResponse.json({ ok: false });
  }
}
