import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpSms, SmsLang } from "@/lib/sms";

const OTP_RATE_LIMIT_PER_HOUR = 5;
const OTP_EXPIRE_MINUTES = 5;

export async function POST(req: Request) {
  try {
    const { phone, lang = "uz" } = await req.json();

    if (!phone) {
      return NextResponse.json({ message: "Telefon raqami kiritilmagan" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone.startsWith("998") || cleanPhone.length !== 12) {
      return NextResponse.json({
        message: "Telefon raqam noto'g'ri formatda (+998901234567)",
        message_ru: "Неверный формат номера (+998901234567)",
        message_en: "Invalid phone number format (+998901234567)",
      }, { status: 400 });
    }

    const fullPhone = "+" + cleanPhone;

    // Rate limit tekshiruvi: 1 soatda 5 ta kod
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.otpCode.count({
      where: {
        phone: fullPhone,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= OTP_RATE_LIMIT_PER_HOUR) {
      return NextResponse.json({
        message: "Siz 1 soat ichida juda ko'p kod so'radingiz. Iltimos, keyinroq urinib ko'ring.",
        message_ru: "Слишком много запросов кода за последний час. Попробуйте позже.",
        message_en: "Too many code requests in the last hour. Please try again later.",
      }, { status: 429 });
    }

    // 6 xonali tasdiqlash kodi
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

    await prisma.otpCode.upsert({
      where: { phone: fullPhone },
      update: { code, expiresAt, createdAt: new Date() },
      create: { phone: fullPhone, code, expiresAt },
    });

    // SMS yuborishga urinib ko'ramiz
    const smsResult = await sendOtpSms(fullPhone, code, lang as SmsLang);

    if (smsResult.success) {
      return NextResponse.json({
        ok: true,
        method: "sms",
        message: "Kod SMS orqali yuborildi",
        message_ru: "Код отправлен по SMS",
        message_en: "Code sent via SMS",
        expiresInSeconds: OTP_EXPIRE_MINUTES * 60,
      });
    }

    // Agar SMS provayder ulanmagan bo'lsa (yoki xato bersa), Telegram botdan olishni taklif qilamiz
    return NextResponse.json({
      ok: true,
      method: "telegram_fallback",
      message: "SMS xizmati hozirda Telegram bot orqali ishlamoqda. Iltimos, @kelajakuylar_sms_bot ga kiring.",
      message_ru: "Сервис подтверждения работает через Telegram бот @kelajakuylar_sms_bot.",
      message_en: "Verification is available via our Telegram bot @kelajakuylar_sms_bot.",
      telegramUrl: `https://t.me/kelajakuylar_sms_bot?start=auth_${cleanPhone}`,
      expiresInSeconds: OTP_EXPIRE_MINUTES * 60,
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
