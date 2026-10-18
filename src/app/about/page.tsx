"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

export default function AboutPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121316] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 dark:border-white/5">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 hover:underline font-medium"
          >
            ← {lang === "ru" ? "На главную" : lang === "en" ? "Back to Home" : "Bosh sahifaga qaytish"}
          </Link>
        </div>

        {lang === "ru" ? (
          /* RUSSIAN */
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">О компании</h1>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              <strong>«Kelajak Uylar»</strong> — современная цифровая платформа по поиску, продаже и аренде жилой и коммерческой недвижимости в Узбекистане. Наша миссия — сделать поиск жилья прозрачным, удобным и безопасным для каждого гражданина.
            </p>

            <div className="bg-gray-100 dark:bg-[#25272c] rounded-2xl p-5 space-y-3 text-sm">
              <h2 className="text-base font-bold text-yellow-500 mb-3">Реквизиты и контакты:</h2>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Название организации:</span>
                <span className="font-semibold text-gray-900 dark:text-white">«Kelajak Uylar» МЧЖ</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">ИНН (STIR):</span>
                <span className="font-semibold text-yellow-500">[TO&apos;LDIRING / УКАЖИТЕ]</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Юридический адрес:</span>
                <span className="font-semibold text-yellow-500">[TO&apos;LDIRING / УКАЖИТЕ: г. Ташкент...]</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Контактный телефон:</span>
                <span className="font-semibold text-gray-900 dark:text-white">+998 90 123 45 67</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Режим работы:</span>
                <span className="font-semibold text-gray-900 dark:text-white">Понедельник – Суббота, 09:00 – 18:00</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                <span className="text-gray-500">Telegram бот:</span>
                <a href="https://t.me/kelajakuylar_sms_bot" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                  @kelajakuylar_sms_bot
                </a>
              </div>
            </div>
          </div>
        ) : lang === "en" ? (
          /* ENGLISH */
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">About Company</h1>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              <strong>«Kelajak Uylar»</strong> is a modern digital real estate portal for finding, selling, and renting residential and commercial properties throughout Uzbekistan. Our mission is to make real estate discovery transparent, reliable, and accessible for everyone.
            </p>

            <div className="bg-gray-100 dark:bg-[#25272c] rounded-2xl p-5 space-y-3 text-sm">
              <h2 className="text-base font-bold text-yellow-500 mb-3">Company Details &amp; Contacts:</h2>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Company name:</span>
                <span className="font-semibold text-gray-900 dark:text-white">«Kelajak Uylar» LLC</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Tax ID (TIN / STIR):</span>
                <span className="font-semibold text-yellow-500">[TO&apos;LDIRING / PLEASE FILL]</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Address:</span>
                <span className="font-semibold text-yellow-500">[TO&apos;LDIRING / PLEASE FILL: Tashkent city...]</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Phone:</span>
                <span className="font-semibold text-gray-900 dark:text-white">+998 90 123 45 67</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Working hours:</span>
                <span className="font-semibold text-gray-900 dark:text-white">Monday – Saturday, 09:00 – 18:00</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                <span className="text-gray-500">Telegram Bot:</span>
                <a href="https://t.me/kelajakuylar_sms_bot" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                  @kelajakuylar_sms_bot
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* UZBEK */
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Kompaniya haqida</h1>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              <strong>«Kelajak Uylar»</strong> — O&apos;zbekiston bo&apos;ylab turar joy va tijorat ko&apos;chmas mulklarini topish, sotish va ijaraga berish bo&apos;yicha zamonaviy onlayn platforma. Bizning maqsadimiz — aholiga ko&apos;chmas mulk bozorida shaffof, qulay va xavfsiz xizmat ko&apos;rsatish.
            </p>

            <div className="bg-gray-100 dark:bg-[#25272c] rounded-2xl p-5 space-y-3 text-sm">
              <h2 className="text-base font-bold text-yellow-500 mb-3">Kompaniya rekvizitlari va aloqa:</h2>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Kompaniya nomi:</span>
                <span className="font-semibold text-gray-900 dark:text-white">«Kelajak Uylar» MCHJ</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">STIR (INN):</span>
                <span className="font-semibold text-yellow-500">[TO&apos;LDIRING]</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Yuridik manzil:</span>
                <span className="font-semibold text-yellow-500">[TO&apos;LDIRING: Toshkent shahri...]</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Aloqa telefoni:</span>
                <span className="font-semibold text-gray-900 dark:text-white">+998 90 123 45 67</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Ish vaqti:</span>
                <span className="font-semibold text-gray-900 dark:text-white">Dushanba – Shanba, 09:00 – 18:00</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                <span className="text-gray-500">Telegram bot:</span>
                <a href="https://t.me/kelajakuylar_sms_bot" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                  @kelajakuylar_sms_bot
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
