import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Telegram bot token — faqat .env dan olinadi
const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

// Rate limit sozlamalari
const OTP_RATE_LIMIT_PER_HOUR = 5;
const OTP_EXPIRE_MINUTES = 5;

// Har bir Telegram ID ga ruxsat etilgan maksimal akkauntlar soni
const TG_MAX_ACCOUNTS_PER_USER = parseInt(process.env.TG_MAX_ACCOUNTS_PER_USER || "2", 10);

const BOT_TEXTS = {
  uz: {
    codeMsg: (code: string) => `✅ Tasdiqlash kodingiz: \`${code}\`\n\nKod 5 daqiqa amal qiladi. Uni saytga kiriting.`,
    copyBtn: "📋 Kodni nusxalash",
    expired: "⚠️ Havola eskirgan yoki yaroqsiz. Saytdan qaytadan urinib ko'ring.",
    rateLimit: "⚠️ Juda ko'p so'rov yuborildi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
    limitReached: "⚠️ Bu Telegram akkauntiga ulangan hisoblar soni maksimal chegaraga yetgan.",
  },
  ru: {
    codeMsg: (code: string) => `✅ Ваш код подтверждения: \`${code}\`\n\nКод действителен 5 минут. Введите его на сайте.`,
    copyBtn: "📋 Скопировать код",
    expired: "⚠️ Ссылка устарела или недействительна. Попробуйте снова на сайте.",
    rateLimit: "⚠️ Слишком много запросов. Пожалуйста, подождите немного.",
    limitReached: "⚠️ Достигнут лимит учетных записей для этого Telegram аккаунта.",
  },
  en: {
    codeMsg: (code: string) => `✅ Your verification code: \`${code}\`\n\nCode is valid for 5 minutes. Enter it on the website.`,
    copyBtn: "📋 Copy code",
    expired: "⚠️ Link is expired or invalid. Please try again on the website.",
    rateLimit: "⚠️ Too many requests. Please try again shortly.",
    limitReached: "⚠️ Maximum number of accounts reached for this Telegram account.",
  },
};

type BotLang = "uz" | "ru" | "en";

function getBotTexts(lang?: string | null): typeof BOT_TEXTS.uz {
  if (lang === "ru" || lang === "en") return BOT_TEXTS[lang];
  return BOT_TEXTS.uz;
}

async function sendTelegramMessage(chatId: number | string, text: string, extra?: Record<string, unknown>) {
  if (!botToken) {
    console.warn("TELEGRAM_BOT_TOKEN muhit o'zgaruvchisi yo'q");
    return { ok: false };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", ...extra }),
    });
    return await res.json();
  } catch (err) {
    console.error("Telegram xabar yuborish xatosi:", err);
    return { ok: false };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!botToken) {
      return NextResponse.json({ ok: false, error: "Bot konfiguratsiya qilinmagan" });
    }

    if (body.message) {
      const chatId = body.message.chat.id;
      const text: string = body.message.text || "";
      const userLangCode = body.message.from?.language_code;
      const defaultLang: BotLang = userLangCode?.startsWith("ru") ? "ru" : userLangCode?.startsWith("en") ? "en" : "uz";

      // 1. /start buyrug'i
      if (text.startsWith("/start")) {
        const parts = text.trim().split(/\s+/);
        const rawToken = parts.length > 1 ? parts[1] : null;

        // A) Deep link oqimi: /start <token>
        if (rawToken) {
          const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

          const session = await prisma.telegramVerifySession.findUnique({
            where: { tokenHash },
          });

          const now = new Date();
          const texts = getBotTexts(session?.lang || defaultLang);

          // Token tekshiruvi: mavjudligi, muddati o'tmaganligi, ishlatilmaganligi, bloklanmaganligi
          if (!session || session.expiresAt <= now || session.verifiedAt || session.attempts >= 5) {
            await sendTelegramMessage(chatId, texts.expired, {
              reply_markup: { remove_keyboard: true },
            });
            return NextResponse.json({ ok: true });
          }

          // Telegram foydalanuvchisi uchun rate limit (soatiga 5 ta)
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
          const recentSessionsByTg = await prisma.telegramVerifySession.count({
            where: {
              telegramId: String(chatId),
              createdAt: { gte: oneHourAgo },
            },
          });

          if (recentSessionsByTg >= OTP_RATE_LIMIT_PER_HOUR) {
            await sendTelegramMessage(chatId, texts.rateLimit, {
              reply_markup: { remove_keyboard: true },
            });
            return NextResponse.json({ ok: true });
          }

          // Akkauntlar soni tekshiruvi (bitta Telegram ID ga bog'langan maksimal akkauntlar)
          const existingAccountsCount = await prisma.user.count({
            where: {
              OR: [
                { telegramId: String(chatId) },
                { phone: `+tg${chatId}` },
              ],
            },
          });

          if (existingAccountsCount >= TG_MAX_ACCOUNTS_PER_USER) {
            await sendTelegramMessage(chatId, texts.limitReached, {
              reply_markup: { remove_keyboard: true },
            });
            return NextResponse.json({ ok: true });
          }

          const hmacSecret = process.env.OTP_HMAC_SECRET;
          if (!hmacSecret) {
            console.warn("OTP_HMAC_SECRET sozlanmagan");
            return NextResponse.json({ ok: true });
          }

          // 6 xonali kriptografik xavfsiz kod yaratish
          const code = crypto.randomInt(100000, 1000000).toString();
          const codeHash = crypto.createHmac("sha256", hmacSecret).update(code).digest("hex");

          // Sessiyani yangilash: kod hashi va telegramId yoziladi
          await prisma.telegramVerifySession.update({
            where: { id: session.id },
            data: {
              codeHash,
              telegramId: String(chatId),
            },
          });

          // Xabar: salomlashuvsiz, savolsiz, FAQAT kod va qisqa izoh, monospace formatda
          const messageText = texts.codeMsg(code);

          // copy_text inline tugmasi bilan yuborishga urinish
          const inlineMarkup = {
            inline_keyboard: [
              [
                {
                  text: texts.copyBtn,
                  copy_text: { text: code },
                },
              ],
            ],
          };

          const sendResult = await sendTelegramMessage(chatId, messageText, {
            reply_markup: inlineMarkup,
          });

          // Agar copy_text tugmasi Telegram API tomonidan rad etilsa (fallback)
          if (!sendResult || !sendResult.ok) {
            await sendTelegramMessage(chatId, messageText, {
              reply_markup: { remove_keyboard: true },
            });
          }

          return NextResponse.json({ ok: true });
        }

        // B) Token SIZ /start (foydalanuvchi botni qidiruvdan topgan) - eski xatti-harakat saqlanadi
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
        return NextResponse.json({ ok: true });
      }

      // 2. Kontakt yuborilganda (eski contact-sharing oqimi saqlanadi)
      if (body.message.contact) {
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
        const code = crypto.randomInt(100000, 1000000).toString();
        const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

        // Eski kodni yangilash yoki yangi yaratish
        await prisma.otpCode.upsert({
          where: { phone },
          update: { code, expiresAt, createdAt: new Date() },
          create: { phone, code, expiresAt },
        });

        await sendTelegramMessage(
          chatId,
          `✅ Sizning tasdiqlash kodingiz:\n\n\`${code}\`\n\nKodni saytga kiriting. Kod *${OTP_EXPIRE_MINUTES} daqiqa* davomida amal qiladi.`,
          { reply_markup: { remove_keyboard: true } }
        );
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook xatosi:", err);
    return NextResponse.json({ ok: false });
  }
}
