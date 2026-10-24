import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { ThemeScript } from "@/components/ThemeScript";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import { PwaRegister } from "@/components/PwaRegister";
import { cookies } from "next/headers";
import { Lang } from "@/lib/lang";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kelajakuylar.uz"),
  title: {
    default: "Kelajak Uylar – O'zbekistonda uy, kvartira, yer e'lonlari",
    template: "%s | Kelajak Uylar",
  },
  description: "Kelajak Uylar – O'zbekiston bo'ylab uy, kvartira, yer uchastkasi, hovli va tijorat ko'chmas mulk oldi-sotdisi va ijarasi.",
  keywords: ["uy", "kvartira", "ko'chmas mulk", "ijara", "sotuv", "Toshkent", "O'zbekiston", "nedvijimost", "real estate Uzbekistan"],
  manifest: "/manifest.json",
  openGraph: {
    siteName: "Kelajak Uylar",
    locale: "uz_UZ",
    type: "website",
    title: "Kelajak Uylar – O'zbekistonda uy, kvartira, yer e'lonlari",
    description: "Kelajak Uylar – O'zbekiston bo'ylab uy, kvartira, yer uchastkasi, hovli va tijorat ko'chmas mulk oldi-sotdisi va ijarasi.",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Kelajak Uylar",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kelajak Uylar",
  },
};

export const viewport: Viewport = {
  themeColor: "#facc15",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("joymee_lang")?.value || cookieStore.get("lang")?.value;
  const initialLang: Lang = (rawLang === "ru" || rawLang === "en" || rawLang === "uz") ? rawLang : "uz";

  return (
    <html lang={initialLang} translate="no" className={`${geistSans.variable} antialiased h-full notranslate`} suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <meta name="yandex" content="notranslate" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-[#111113] text-gray-900 dark:text-white transition-colors duration-200 notranslate" translate="no">
        <ThemeScript />
        <PwaRegister />
        <Providers initialLang={initialLang}>
          <Suspense fallback={<div className="h-14 bg-white dark:bg-[#111113] border-b border-gray-200 dark:border-white/5" />}>
            <Navbar />
          </Suspense>
          <div className="flex-1 flex flex-col pb-6 sm:pb-10" id="page-content">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
