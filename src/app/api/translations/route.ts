import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getUserFromSession, isAdminFromDB } from "@/lib/server-utils";

const TRANSLATIONS_FILE = path.join(process.cwd(), "src", "lib", "custom-translations.json");

function getCustomTranslations() {
  try {
    if (fs.existsSync(TRANSLATIONS_FILE)) {
      const data = fs.readFileSync(TRANSLATIONS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading custom translations file:", err);
  }
  return { uz: {}, ru: {}, en: {} };
}

// GET: barcha custom tarjimalarni olish
export async function GET() {
  return NextResponse.json(getCustomTranslations());
}

// PUT: Admin yangi tarjimalarni kiritishi / tahrirlashi
export async function PUT(req: Request) {
  try {
    const user = await getUserFromSession();
    const isAdmin = await isAdminFromDB();
    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403 });
    }

    const body = await req.json();
    const current = getCustomTranslations();

    // Merge updates
    const updated = {
      uz: { ...(current.uz || {}), ...(body.uz || {}) },
      ru: { ...(current.ru || {}), ...(body.ru || {}) },
      en: { ...(current.en || {}), ...(body.en || {}) },
    };

    fs.writeFileSync(TRANSLATIONS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error saving custom translations:", error);
    return NextResponse.json({ error: "Saqlashda xatolik yuz berdi" }, { status: 500 });
  }
}
