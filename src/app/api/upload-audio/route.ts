import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Tizimga kiring" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json({ message: "Audio fayl topilmadi" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (process.env.CLOUDINARY_URL) {
      const cloudinary = require("cloudinary").v2;
      cloudinary.config({ secure: true });
      const b64 = buffer.toString("base64");
      const dataURI = "data:" + file.type + ";base64," + b64;
      const res = await cloudinary.uploader.upload(dataURI, {
        folder: "joymee-audio",
        resource_type: "video" // Cloudinary expects video for audio files
      });
      return NextResponse.json({ url: res.secure_url });
    }

    const filename = `audio-${Date.now()}.webm`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "audio");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/audio/${filename}` });
  } catch (error) {
    return NextResponse.json({ message: "Yuklash xatosi" }, { status: 500 });
  }
}
