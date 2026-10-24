import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "Fayl topilmadi" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Fayl hajmi 10 MB dan oshmasligi kerak" }, { status: 400 });
    }

    const ext = path.extname(file.name || "").toLowerCase();
    const mime = (file.type || "").toLowerCase();

    const isAllowedExt = ALLOWED_EXTENSIONS.has(ext);
    const isAllowedMime = ALLOWED_MIME_TYPES.has(mime);

    if (!isAllowedMime && !isAllowedExt) {
      return NextResponse.json(
        { message: "Faqat rasm fayllari (jpeg, png, webp, heic, heif) qabul qilinadi" },
        { status: 400 }
      );
    }

    const safeExt = isAllowedExt
      ? ext
      : mime === "image/png"
      ? ".png"
      : mime === "image/webp"
      ? ".webp"
      : mime.includes("heic")
      ? ".heic"
      : mime.includes("heif")
      ? ".heif"
      : ".jpg";

    const randomFilename = `${crypto.randomUUID()}${safeExt}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Agar Cloudinary sozlangan bo'lsa, o'sha yerga yuklaymiz
    if (process.env.CLOUDINARY_URL) {
      const b64 = buffer.toString("base64");
      const dataURI = `data:${mime || "image/jpeg"};base64,${b64}`;
      const res = await cloudinary.uploader.upload(dataURI, {
        folder: "joymee",
        public_id: crypto.randomUUID(),
      });
      return NextResponse.json({ url: res.secure_url });
    }

    // Cloudinary bo'lmasa, lokal papkaga yuklaymiz
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, randomFilename), buffer);

    return NextResponse.json({ url: `/uploads/${randomFilename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Yuklash xatosi" }, { status: 500 });
  }
}
