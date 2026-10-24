"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

interface SystemSettings {
  companyName?: string | null;
  companyInn?: string | null;
  companyAddress?: string | null;
  companyHours?: string | null;
  contactPhone?: string | null;
  telegramUrl?: string | null;
  telegramBotUrl?: string | null;
}

export default function AboutContent({ settings }: { settings: SystemSettings | null }) {
  const { lang } = useLang();

  const companyName =
    settings?.companyName?.trim() ||
    (lang === "ru" ? "«Kelajak Uylar» ООО" : lang === "en" ? "«Kelajak Uylar» LLC" : "«Kelajak Uylar» MCHJ");
  const companyInn = settings?.companyInn?.trim() || "";
  const companyAddress = settings?.companyAddress?.trim() || "";
  const companyHours =
    settings?.companyHours?.trim() ||
    (lang === "ru"
      ? "Понедельник – Суббота, 09:00 – 18:00"
      : lang === "en"
      ? "Monday – Saturday, 09:00 – 18:00"
      : "Dushanba – Shanba, 09:00 – 18:00");
  const contactPhone = settings?.contactPhone?.trim() || "";
  const cleanPhone = contactPhone ? contactPhone.replace(/[^\d+]/g, "") : "";

  const telegramChannelUrl = settings?.telegramUrl?.trim() || "";
  const telegramChannelUsername = telegramChannelUrl.includes("t.me/")
    ? "@" + telegramChannelUrl.split("t.me/")[1].replace(/\/.*$/, "")
    : telegramChannelUrl.replace(/^@?/, "@");

  const telegramBotUrl = settings?.telegramBotUrl?.trim() || "https://t.me/kelajakuylar_sms_bot";
  const telegramBotUsername = telegramBotUrl.includes("t.me/")
    ? "@" + telegramBotUrl.split("t.me/")[1].replace(/\/.*$/, "")
    : "@kelajakuylar_sms_bot";

  const notSpecified = lang === "ru" ? "Не указан" : lang === "en" ? "Not specified" : "Ko'rsatilmagan";

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
                <span className="font-semibold text-gray-900 dark:text-white">{companyName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">ИНН (STIR):</span>
                <span className={`font-semibold ${companyInn ? "text-gray-900 dark:text-white font-mono" : "text-gray-400 dark:text-gray-500"}`}>
                  {companyInn || notSpecified}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Юридический адрес:</span>
                <span className={`font-semibold ${companyAddress ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                  {companyAddress || notSpecified}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Контактный телефон:</span>
                {cleanPhone ? (
                  <a href={`tel:${cleanPhone}`} className="font-semibold text-yellow-600 dark:text-yellow-400 hover:underline">
                    {contactPhone}
                  </a>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 font-semibold">{notSpecified}</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Режим работы:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{companyHours}</span>
              </div>
              {telegramChannelUrl && telegramChannelUrl !== "#" && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                  <span className="text-gray-500">Telegram канал / профиль:</span>
                  <a href={telegramChannelUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                    {telegramChannelUsername}
                  </a>
                </div>
              )}
              {telegramBotUrl && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                  <span className="text-gray-500">Telegram бот (SMS / OTP):</span>
                  <a href={telegramBotUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                    {telegramBotUsername}
                  </a>
                </div>
              )}
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
                <span className="font-semibold text-gray-900 dark:text-white">{companyName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Tax ID (TIN / STIR):</span>
                <span className={`font-semibold ${companyInn ? "text-gray-900 dark:text-white font-mono" : "text-gray-400 dark:text-gray-500"}`}>
                  {companyInn || notSpecified}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Address:</span>
                <span className={`font-semibold ${companyAddress ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                  {companyAddress || notSpecified}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Phone:</span>
                {cleanPhone ? (
                  <a href={`tel:${cleanPhone}`} className="font-semibold text-yellow-600 dark:text-yellow-400 hover:underline">
                    {contactPhone}
                  </a>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 font-semibold">{notSpecified}</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Working hours:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{companyHours}</span>
              </div>
              {telegramChannelUrl && telegramChannelUrl !== "#" && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                  <span className="text-gray-500">Telegram Channel / Profile:</span>
                  <a href={telegramChannelUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                    {telegramChannelUsername}
                  </a>
                </div>
              )}
              {telegramBotUrl && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                  <span className="text-gray-500">Telegram Bot (SMS / OTP):</span>
                  <a href={telegramBotUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                    {telegramBotUsername}
                  </a>
                </div>
              )}
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
                <span className="font-semibold text-gray-900 dark:text-white">{companyName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">STIR (INN):</span>
                <span className={`font-semibold ${companyInn ? "text-gray-900 dark:text-white font-mono" : "text-gray-400 dark:text-gray-500"}`}>
                  {companyInn || notSpecified}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Yuridik manzil:</span>
                <span className={`font-semibold ${companyAddress ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                  {companyAddress || notSpecified}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Aloqa telefoni:</span>
                {cleanPhone ? (
                  <a href={`tel:${cleanPhone}`} className="font-semibold text-yellow-600 dark:text-yellow-400 hover:underline">
                    {contactPhone}
                  </a>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 font-semibold">{notSpecified}</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                <span className="text-gray-500">Ish vaqti:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{companyHours}</span>
              </div>
              {telegramChannelUrl && telegramChannelUrl !== "#" && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-white/5">
                  <span className="text-gray-500">Telegram kanal / havola:</span>
                  <a href={telegramChannelUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                    {telegramChannelUsername}
                  </a>
                </div>
              )}
              {telegramBotUrl && (
                <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                  <span className="text-gray-500">Telegram bot (SMS / OTP):</span>
                  <a href={telegramBotUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                    {telegramBotUsername}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
