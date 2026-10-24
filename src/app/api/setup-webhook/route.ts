import { NextResponse } from "next/server";
import { isAdminFromDB } from "@/lib/server-utils";

export async function GET(req: Request) {
  const isAdmin = await isAdminFromDB();
  if (!isAdmin) {
    return NextResponse.json({ message: "Ruxsat yo'q. Faqat admin uchun." }, { status: 403 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ message: "TELEGRAM_BOT_TOKEN topilmadi" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kelajakuylar.uz";
  const webhookUrl = `${siteUrl.replace(/\/+$/, "")}/api/telegram-webhook`;

  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  let apiUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
  if (webhookSecret) {
    apiUrl += `&secret_token=${encodeURIComponent(webhookSecret)}`;
  }

  const res = await fetch(apiUrl);
  const data = await res.json();

  return NextResponse.json({ webhookUrl, telegramResponse: data });
}
