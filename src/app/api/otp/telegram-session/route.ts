import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const RATE_LIMIT_PER_HOUR = 5;
const RATE_LIMIT_COOLDOWN_SECONDS = 30; // 30 soniya ichida qayta bosishni cheklash

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("998") && digits.length === 12;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, lang = "uz" } = body || {};

    if (!phone) {
      return NextResponse.json(
        {
          message: "Telefon raqami kiritilmagan",
          message_ru: "Номер телефона не указан",
          message_en: "Phone number is required",
        },
        { status: 400 }
      );
    }

    const cleanDigits = phone.replace(/\D/g, "");
    if (!isValidPhone(cleanDigits)) {
      return NextResponse.json(
        {
          message: "Telefon raqam formati noto'g'ri. Masalan: +998901234567",
          message_ru: "Неверный формат номера телефона. Например: +998901234567",
          message_en: "Invalid phone number format. E.g.: +998901234567",
        },
        { status: 400 }
      );
    }

    const fullPhone = "+" + cleanDigits;
    const validLang = ["uz", "ru", "en"].includes(lang) ? lang : "uz";

    // 1. Foydalanuvchi allaqachon mavjudmi?
    const existingUser = await prisma.user.findUnique({
      where: { phone: fullPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Bu raqam orqali oldin ro'yxatdan o'tilgan",
          message_ru: "Этот номер уже зарегистрирован",
          message_en: "This phone number is already registered",
        },
        { status: 400 }
      );
    }

    // 2. Rejim va kalit tekshiruvi (fallback kafolati)
    const mode = process.env.TG_VERIFY_MODE || "deeplink";
    const hmacSecret = process.env.OTP_HMAC_SECRET;
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "kelajakuylar_sms_bot";

    if (mode === "contact" || !hmacSecret) {
      if (!hmacSecret) {
        console.warn("OTP_HMAC_SECRET sozlanmagan");
      }
      return NextResponse.json({
        ok: true,
        mode: "contact",
        botUrl: `https://t.me/${botUsername}`,
      });
    }

    // 3. Rate limiting tekshiruvi (soatiga 5 ta, 30 soniyada 1 ta)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const cooldownAgo = new Date(now.getTime() - RATE_LIMIT_COOLDOWN_SECONDS * 1000);

    const recentSessionsCount = await prisma.telegramVerifySession.count({
      where: {
        phone: fullPhone,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentSessionsCount >= RATE_LIMIT_PER_HOUR) {
      return NextResponse.json(
        {
          message: "Siz 1 soat ichida juda ko'p kod so'radingiz. Iltimos, keyinroq urinib ko'ring.",
          message_ru: "Слишком много запросов кода за последний час. Попробуйте позже.",
          message_en: "Too many code requests in the last hour. Please try again later.",
        },
        { status: 429 }
      );
    }

    const recentCooldownSession = await prisma.telegramVerifySession.findFirst({
      where: {
        phone: fullPhone,
        createdAt: { gte: cooldownAgo },
      },
    });

    if (recentCooldownSession) {
      return NextResponse.json(
        {
          message: "Iltimos, qayta so'rov yuborishdan oldin biroz kuting.",
          message_ru: "Пожалуйста, подождите перед повторной отправкой.",
          message_en: "Please wait before requesting again.",
        },
        { status: 429 }
      );
    }

    // 4. Eskirgan va ishlatilgan sessiyalarni tozalash (faqat TelegramVerifySession jadvali)
    await prisma.telegramVerifySession.deleteMany({
      where: {
        phone: fullPhone,
        OR: [
          { expiresAt: { lt: now } },
          { verifiedAt: { not: null } },
        ],
      },
    });

    // 5. Bir martalik URL-xavfsiz token yaratish (32 bayt = 64 belgili hex)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 daqiqa

    await prisma.telegramVerifySession.create({
      data: {
        tokenHash,
        phone: fullPhone,
        lang: validLang,
        expiresAt,
        attempts: 0,
      },
    });

    return NextResponse.json({
      ok: true,
      mode: "deeplink",
      botUrl: `https://t.me/${botUsername}?start=${rawToken}`,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error("Telegram session yaratish xatosi:", error);
    return NextResponse.json(
      {
        message: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        message_ru: "Произошла ошибка. Пожалуйста, попробуйте снова.",
        message_en: "An error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
