import { prisma } from "@/lib/prisma";
import AboutContent from "./AboutContent";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  let settings = null;
  try {
    settings = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    });
  } catch (err) {
    console.error("Failed to load settings in about page:", err);
  }

  return <AboutContent settings={settings} />;
}
