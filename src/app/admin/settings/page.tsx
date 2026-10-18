"use client";

import { useLang } from "@/components/LangProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  
  const [siteName, setSiteName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPhone2, setContactPhone2] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState("UZS");
  const [autoApprove, setAutoApprove] = useState(false);
  const [freeListingLimit, setFreeListingLimit] = useState(3);
  const [listingActiveDays, setListingActiveDays] = useState(30);
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyInn, setCompanyInn] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyHours, setCompanyHours] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSiteName(data.siteName || "");
          setContactPhone(data.contactPhone || "");
          setContactPhone2(data.contactPhone2 || "");
          setTelegramUrl(data.telegramUrl || "");
          setInstagramUrl(data.instagramUrl || "");
          setDefaultCurrency(data.defaultCurrency || "UZS");
          setAutoApprove(data.autoApprove || false);
          setFreeListingLimit(data.freeListingLimit || 3);
          setListingActiveDays(data.listingActiveDays || 30);
          setTelegramBotToken(data.telegramBotToken || "");
          setTelegramChatId(data.telegramChatId || "");
          setCompanyName(data.companyName || "«Kelajak Uylar» MCHJ");
          setCompanyInn(data.companyInn || "");
          setCompanyAddress(data.companyAddress || "");
          setCompanyHours(data.companyHours || "Dushanba – Shanba, 09:00 – 18:00");
        } else {
          setError("Sozlamalarni yuklab bo'lmadi");
        }
      } catch (err) {
        setError("Tarmoq xatosi");
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSaved(false);
    
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          contactPhone,
          contactPhone2,
          telegramUrl,
          instagramUrl,
          defaultCurrency,
          autoApprove,
          freeListingLimit: Number(freeListingLimit),
          listingActiveDays: Number(listingActiveDays),
          telegramBotToken,
          telegramChatId,
          companyName,
          companyInn,
          companyAddress,
          companyHours
        })
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Saqlashda xatolik yuz berdi");
      }
    } catch (err) {
      setError("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-gray-500">{lang === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...'}</div>;
  }

  const tr = (uz: string, ru: string) => lang === 'ru' ? ru : uz;

  return (
    <div className="space-y-6 max-w-3xl pb-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settingsTitle}</h1>
          <p className="text-gray-500 mt-1">{lang === 'uz' ? 'Tizim va interfeys sozlamalari' : 'Системные настройки и интерфейс'}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2.5 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {loading ? tr("Saqlanmoqda...", "Сохранение...") : saved ? tr("✅ Saqlandi!", "✅ Сохранено!") : tr("Saqlash", "Сохранить")}
        </button>
      </div>
      
      {error && (
        <div className="bg-yellow-50 text-yellow-400 p-4 rounded-xl border border-yellow-200 mb-6 font-medium">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-[#111113] rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/50 border border-gray-200 dark:border-white/5 overflow-hidden divide-y divide-gray-100 dark:divide-white/5 transition-colors">

        {/* Asosiy sozlamalar */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center border border-orange-100 dark:border-orange-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-600 dark:text-orange-400"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{tr("Umumiy sozlamalar (SEO va Kontakt)", "Общие настройки (SEO и Контакты)")}</h2>
              <p className="text-sm text-gray-500">{tr("Saytning asosiy parametrlari va aloqa", "Основные параметры сайта и связь")}</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Sayt nomi", "Название сайта")}</label>
                <input 
                  type="text" 
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Aloqa telefoni (Call-center)", "Контактный телефон (Call-центр)")}</label>
                <input 
                  type="text" 
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Qo'shimcha telefon (Reklama)", "Доп. телефон (Реклама)")}</label>
                <input 
                  type="text" 
                  value={contactPhone2}
                  onChange={e => setContactPhone2(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Telegram havola", "Ссылка на Telegram")}</label>
                <input 
                  type="url" 
                  placeholder="https://t.me/..."
                  value={telegramUrl}
                  onChange={e => setTelegramUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Instagram havola", "Ссылка на Instagram")}</label>
                <input 
                  type="url" 
                  placeholder="https://instagram.com/..."
                  value={instagramUrl}
                  onChange={e => setInstagramUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Asosiy valyuta", "Основная валюта")}</label>
              <select 
                value={defaultCurrency}
                onChange={e => setDefaultCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition appearance-none"
              >
                <option value="UZS">{tr("So'm (UZS)", "Сум (UZS)")}</option>
                <option value="USD">{tr("AQSH dollari (USD / y.e.)", "Доллар США (USD / у.е.)")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kompaniya rekvizitlari */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center border border-purple-100 dark:border-purple-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-600 dark:text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{tr("Kompaniya rekvizitlari («Biz haqimizda» sahifasi)", "Реквизиты компании (Страница «О нас»)")}</h2>
              <p className="text-sm text-gray-500">{tr("Saytning /about sahifasida aks etuvchi rasmiy ma'lumotlar", "Официальные данные, отображаемые на странице /about")}</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Kompaniya yuridik nomi", "Юридическое название компании")}</label>
                <input 
                  type="text" 
                  placeholder={tr("«Kelajak Uylar» MCHJ", "«Kelajak Uylar» ООО")}
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("STIR / INN", "ИНН компании (STIR)")}</label>
                <input 
                  type="text" 
                  placeholder={tr("Masalan: 309123456", "Например: 309123456")}
                  value={companyInn}
                  onChange={e => setCompanyInn(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Yuridik manzil", "Юридический адрес")}</label>
              <input 
                type="text" 
                placeholder={tr("Toshkent shahri, Chilonzor tumani...", "г. Ташкент, Чиланзарский район...")}
                value={companyAddress}
                onChange={e => setCompanyAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Ish vaqti", "Режим работы")}</label>
              <input 
                type="text" 
                placeholder={tr("Dushanba – Shanba, 09:00 – 18:00", "Понедельник – Суббота, 09:00 – 18:00")}
                value={companyHours}
                onChange={e => setCompanyHours(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>
          </div>
        </div>

        {/* E'lonlar va foydalanuvchilar */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center border border-green-100 dark:border-green-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 dark:text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{tr("E'lonlar siyosati", "Политика объявлений")}</h2>
              <p className="text-sm text-gray-500">{tr("Limitlar va faollik", "Лимиты и активность")}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#16171b] rounded-xl border border-gray-200 dark:border-white/5">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{tr("E'lonlarni avtomatik tasdiqlash", "Автоматическое одобрение объявлений")}</p>
                <p className="text-sm text-gray-500 mt-0.5">{tr("Yangi qo'shilgan e'lonlar to'g'ridan-to'g'ri faol bo'ladi", "Новые объявления сразу становятся активными")}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoApprove} onChange={() => setAutoApprove(!autoApprove)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Bepul e'lonlar limiti (oyiga)", "Лимит бесплатных объявлений (в месяц)")}</label>
                <input 
                  type="number" 
                  value={freeListingLimit}
                  onChange={e => setFreeListingLimit(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("E'lonning faollik muddati (kun)", "Срок активности объявления (дней)")}</label>
                <input 
                  type="number" 
                  value={listingActiveDays}
                  onChange={e => setListingActiveDays(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Bot */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 dark:text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{tr("Telegram Bildirishnomalar", "Telegram Уведомления")}</h2>
              <p className="text-sm text-gray-500">{tr("Yangi e'lonlar haqida Telegram orqali xabar olish", "Получать уведомления о новых объявлениях через Telegram")}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Bot Token", "Токен Бота")}</label>
              <input 
                type="text" 
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                value={telegramBotToken}
                onChange={e => setTelegramBotToken(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{tr("Admin Chat ID", "Chat ID Админа")}</label>
              <input 
                type="text" 
                placeholder={tr("Masalan: -100123456789", "Например: -100123456789")}
                value={telegramChatId}
                onChange={e => setTelegramChatId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition font-mono text-sm"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
