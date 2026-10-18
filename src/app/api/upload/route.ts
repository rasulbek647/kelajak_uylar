import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Ensure cloudinary is configured if URL is provided
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "Fayl topilmadi" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Agar Cloudinary sozlangan bo'lsa, o'sha yerga yuklaymiz
    if (process.env.CLOUDINARY_URL) {
      const b64 = buffer.toString("base64");
      const dataURI = "data:" + file.type + ";base64," + b64;
      const res = await cloudinary.uploader.upload(dataURI, {
        folder: "joymee",
      });
      return NextResponse.json({ url: res.secure_url });
    }

    // Cloudinary bo'lmasa, lokal papkaga yuklaymiz
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Yuklash xatosi" }, { status: 500 });
  }
}
