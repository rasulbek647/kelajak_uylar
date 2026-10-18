import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const host = req.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const webhookUrl = `${protocol}://${host}/api/telegram-webhook`;
  const botToken = "8979456061:AAHPubEufbXu1EdyjGXP4mf6IQlqvm4Xw44";

  const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`);
  const data = await res.json();

  return NextResponse.json({ webhookUrl, telegramResponse: data });
}
