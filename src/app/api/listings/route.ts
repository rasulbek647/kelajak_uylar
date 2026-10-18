import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Tizimga kiring" }, { status: 401 });
    }

    const userPhone = (session.user as any).phone;
    const user = await prisma.user.findUnique({ where: { phone: userPhone } });

    if (!user) {
      return NextResponse.json({ message: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, price, currency, location, rooms, area, type, dealType, ownerType, images, lat, lng, audioUrl, amenities } = body;

    // Sarlavha validatsiyasi (kamida 10 belgi)
    if (!title || typeof title !== "string" || title.trim().length < 10) {
      return NextResponse.json({
        message: "Sarlavha kamida 10 belgi bo'lishi kerak",
        message_ru: "Заголовок должен содержать не менее 10 символов",
        message_en: "Title must be at least 10 characters",
      }, { status: 400 });
    }

    // Ma'nosiz takrorlanuvchi harflar (spam) tekshiruvi (masalan "dfdgagdsrfggeardgbeatrh" yoki "aaaaaa")
    const cleanedTitle = title.trim().toLowerCase().replace(/\s+/g, "");
    const hasRepeatedChar = /(.)\1{4,}/.test(cleanedTitle);
    const uniqueChars = new Set(cleanedTitle).size;
    if (hasRepeatedChar || (cleanedTitle.length > 15 && uniqueChars < 4)) {
      return NextResponse.json({
        message: "Sarlavha ma'noli bo'lishi kerak. Takrorlanuvchi harflardan saqlaning.",
        message_ru: "Заголовок должен быть осмысленным. Избегайте повторяющихся символов.",
        message_en: "Title must be meaningful. Please avoid spam characters.",
      }, { status: 400 });
    }

    // Tavsif tekshiruvi
    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json({
        message: "Tavsif bo'sh bo'lmasligi va kamida 10 belgi bo'lishi kerak",
        message_ru: "Описание не может быть пустым (не менее 10 символов)",
        message_en: "Description cannot be empty (at least 10 characters)",
      }, { status: 400 });
    }

    // Narx tekshiruvi
    const numPrice = Number(price);
    if (!numPrice || isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json({
        message: "Narx 0 dan katta bo'lishi kerak",
        message_ru: "Цена должна быть больше 0",
        message_en: "Price must be greater than 0",
      }, { status: 400 });
    }

    // Mantiqsiz narx chegarasi ($100 mln dan yoki 1 trln so'mdan ortiq bo'lsa)
    const isUsd = currency === "$" || currency === "USD" || currency === "y.e";
    if ((isUsd && numPrice > 100_000_000) || (!isUsd && numPrice > 1_000_000_000_000)) {
      return NextResponse.json({
        message: "Narx juda katta ko'rsatilgan. Iltimos, to'g'ri narx kiriting.",
        message_ru: "Указана слишком большая цена. Пожалуйста, введите корректную цену.",
        message_en: "Price appears unreasonably high. Please enter a valid price.",
      }, { status: 400 });
    }

    // Rasm tekshiruvi (server tomonida ham)
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({
        message: "Kamida 1 ta rasm yuklang",
        message_ru: "Загрузите хотя бы 1 фотографию",
        message_en: "Please upload at least 1 photo",
      }, { status: 400 });
    }

    const settings = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    const isAutoApprove = settings?.autoApprove ?? false;
    const listingLimit = settings?.freeListingLimit ?? 3;

    // Check user's current listing count
    const userListingsCount = await prisma.listing.count({
      where: { userId: user.id }
    });

    if (userListingsCount >= listingLimit && user.role !== "ADMIN") {
      return NextResponse.json({ message: `Siz bepul e'lon berish limitini tugatdingiz (Maksimal: ${listingLimit} ta).` }, { status: 403 });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
        currency,
        location,
        rooms,
        area,
        type,
        dealType,
        ownerType: ownerType || "Rieltor",
        lat,
        lng,
        audioUrl,
        amenities: amenities || [],
        userId: user.id,
        status: isAutoApprove ? "ACTIVE" : "PENDING",
        images: {
          create: images.map((url: string) => ({ url }))
        }
      }
    });

    if (settings?.telegramBotToken && settings?.telegramChatId) {
      try {
        const text = `🏠 <b>Yangi e'lon qo'shildi!</b>\n\n` +
          `<b>Sarlavha:</b> ${title}\n` +
          `<b>Narxi:</b> ${price} ${currency}\n` +
          `<b>Manzil:</b> ${location}\n` +
          `<b>Telefon:</b> ${userPhone}\n` +
          `<b>Holati:</b> ${isAutoApprove ? '✅ Avto-tasdiqlandi' : '⏳ Kutmoqda'}`;
          
        await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegramChatId,
            text,
            parse_mode: 'HTML'
          })
        });
      } catch (err) {
        console.error("Telegramga yuborishda xatolik:", err);
      }
    }

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
