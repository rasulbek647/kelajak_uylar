import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Parolni tekshirish: kamida 8 belgi, 1 raqam va 1 harf
function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
}

// Telefon formatini tekshirish: +998XXXXXXXXX (12 ta raqam)
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("998") && digits.length === 12;
}

export async function POST(req: Request) {
  try {
    const { name, phone, password, region, otpCode } = await req.json();

    // Majburiy maydonlar tekshiruvi
    if (!name || !phone || !password || !otpCode) {
      return NextResponse.json(
        {
          message: "Barcha maydonlarni to'ldiring",
          message_ru: "Заполните все поля",
          message_en: "Please fill in all fields",
        },
        { status: 400 }
      );
    }

    // Telefon formati tekshiruvi
    const cleanDigits = phone.replace(/\D/g, "");
    if (!isValidPhone(cleanDigits)) {
      return NextResponse.json(
        {
          message: "Telefon raqam formati noto'g'ri. Masalan: +998901234567",
          message_ru: "Неверный формат номера телефона",
          message_en: "Invalid phone number format",
        },
        { status: 400 }
      );
    }
    const fullPhone = "+" + cleanDigits;
    const trimmedCode = String(otpCode).trim();

    // Parol kuchi tekshiruvi
    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          message: "Parol kamida 8 belgi, bitta raqam va bitta harf bo'lishi shart",
          message_ru: "Пароль должен содержать не менее 8 символов, одну цифру и одну букву",
          message_en: "Password must be at least 8 characters with one number and one letter",
        },
        { status: 400 }
      );
    }

    // Avval ro'yxatdan o'tilganmi?
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

    const now = new Date();
    let telegramIdToSave: string | null = null;
    let isCodeVerified = false;

    // 1. Deep link oqimidagi TelegramVerifySession ni tekshiramiz
    const verifySession = await prisma.telegramVerifySession.findFirst({
      where: {
        phone: fullPhone,
        expiresAt: { gt: now },
        verifiedAt: null,
        codeHash: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    if (verifySession) {
      // 5 marta xato kiritilgan bo'lsa bloklaymiz
      if (verifySession.attempts >= 5) {
        return NextResponse.json(
          {
            message: "Ko'p marta xato kiritildi. Sessiya bloklandi. Yangi kod oling.",
            message_ru: "Слишком много неверных попыток. Запросите новый код.",
            message_en: "Too many incorrect attempts. Session blocked. Please request a new code.",
          },
          { status: 400 }
        );
      }

      const hmacSecret = process.env.OTP_HMAC_SECRET;
      if (!hmacSecret) {
        console.warn("OTP_HMAC_SECRET sozlanmagan");
        return NextResponse.json(
          {
            message: "Server konfiguratsiya xatosi. Iltimos keyinroq urinib ko'ring.",
            message_ru: "Ошибка конфигурации сервера.",
            message_en: "Server configuration error.",
          },
          { status: 500 }
        );
      }

      // HMAC-SHA256 hisoblash va timing-safe taqqoslash
      const inputHash = crypto.createHmac("sha256", hmacSecret).update(trimmedCode).digest("hex");
      const targetHash = verifySession.codeHash || "";

      const bufA = Buffer.from(inputHash, "hex");
      const bufB = Buffer.from(targetHash, "hex");
      const isMatch = bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

      if (!isMatch) {
        const updated = await prisma.telegramVerifySession.update({
          where: { id: verifySession.id },
          data: { attempts: { increment: 1 } },
        });

        const remaining = Math.max(0, 5 - updated.attempts);
        if (remaining === 0) {
          return NextResponse.json(
            {
              message: "Ko'p marta xato kiritildi. Iltimos, yangi kod oling.",
              message_ru: "Слишком много неверных попыток. Запросите новый код.",
              message_en: "Too many incorrect attempts. Please request a new code.",
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            message: `Tasdiqlash kodi noto'g'ri. Qolgan urinishlar: ${remaining}`,
            message_ru: `Неверный код. Осталось попыток: ${remaining}`,
            message_en: `Incorrect code. Remaining attempts: ${remaining}`,
          },
          { status: 400 }
        );
      }

      // Kod to'g'ri! Sessiyani tasdiqlangan deb belgilaymiz
      await prisma.telegramVerifySession.update({
        where: { id: verifySession.id },
        data: { verifiedAt: new Date() },
      });

      // Ushbu raqam uchun eskirgan boshqa sessiyalarni tozalaymiz
      await prisma.telegramVerifySession.deleteMany({
        where: {
          phone: fullPhone,
          id: { not: verifySession.id },
        },
      });

      // Telegram ID ga bog'langan maksimal akkauntlar soni tekshiruvi
      if (verifySession.telegramId) {
        const maxAccounts = parseInt(process.env.TG_MAX_ACCOUNTS_PER_USER || "2", 10);
        const userCount = await prisma.user.count({
          where: {
            OR: [
              { telegramId: verifySession.telegramId },
              { phone: `+tg${verifySession.telegramId}` },
            ],
          },
        });

        if (userCount >= maxAccounts) {
          return NextResponse.json(
            {
              message: "Bu Telegram hisobiga ulangan akkauntlar soni maksimal chegaraga yetgan",
              message_ru: "Достигнут лимит учетных записей для этого Telegram аккаунта",
              message_en: "Maximum number of accounts reached for this Telegram account",
            },
            { status: 400 }
          );
        }

        telegramIdToSave = verifySession.telegramId;
      }

      isCodeVerified = true;
    } else {
      // 2. Fallback: eski OtpCode jadvalidan tekshiramiz (contact oqimi yoki SMS)
      const validOtp = await prisma.otpCode.findFirst({
        where: {
          phone: fullPhone,
          code: trimmedCode,
          expiresAt: { gt: now },
        },
      });

      if (!validOtp) {
        return NextResponse.json(
          {
            message: "Tasdiqlash kodi xato yoki muddati o'tgan. Iltimos, yangi kod oling.",
            message_ru: "Код подтверждения неверен или истёк. Пожалуйста, получите новый код.",
            message_en: "Verification code is invalid or has expired. Please request a new code.",
          },
          { status: 400 }
        );
      }

      // Kod bir marta ishlatiladi — o'chiramiz
      await prisma.otpCode.delete({ where: { id: validOtp.id } });
      isCodeVerified = true;
    }

    if (!isCodeVerified) {
      return NextResponse.json(
        {
          message: "Tasdiqlash kodi tekshirilmadi.",
          message_ru: "Код подтверждения не проверен.",
          message_en: "Verification code could not be verified.",
        },
        { status: 400 }
      );
    }

    // Parolni hash qilish (bcrypt, salt rounds: 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Foydalanuvchi yaratish — isVerified: true (telefon tasdiqlangan), telegramId saqlanadi
    await prisma.user.create({
      data: {
        name: name.trim(),
        phone: fullPhone,
        password: hashedPassword,
        region: region || "Toshkent",
        isVerified: true,
        ...(telegramIdToSave ? { telegramId: telegramIdToSave } : {}),
      },
    });

    return NextResponse.json(
      {
        message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
        message_ru: "Вы успешно зарегистрировались",
        message_en: "You have successfully registered",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register xatosi:", error);
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
