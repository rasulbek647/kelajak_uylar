import { NextResponse } from "next/server";
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
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        {
          message: "Telefon raqam formati noto'g'ri. Masalan: +998901234567",
          message_ru: "Неверный формат номера телефона",
          message_en: "Invalid phone number format",
        },
        { status: 400 }
      );
    }

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
      where: { phone },
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

    // OTP kodi tekshiruvi — FAQAT haqiqiy kod, test rejimi yo'q
    const validOtp = await prisma.otpCode.findFirst({
      where: {
        phone: phone,
        code: otpCode,
        expiresAt: { gt: new Date() }, // Muddati o'tmagan
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

    // Kod faqat bir marta ishlatiladi — o'chiramiz
    await prisma.otpCode.delete({ where: { id: validOtp.id } });

    // Parolni hash qilish (bcrypt, salt rounds: 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Foydalanuvchi yaratish — isVerified: true (telefon tasdiqlangan)
    await prisma.user.create({
      data: {
        name: name.trim(),
        phone,
        password: hashedPassword,
        region: region || "Toshkent",
        isVerified: true, // Telefon tasdiqlangan!
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
