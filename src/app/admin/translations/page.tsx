"use client";

import { useState, useEffect, useRef } from "react";
import { dict } from "@/lib/lang";
import { useLang } from "@/components/LangProvider";

interface TranslationItem {
  key: string;
  category: string;
  uz: string;
  ru: string;
  en: string;
}

// 3 tilda kategoriya nomlari
const CATEGORIES = [
  { id: "all",     uz: "Barchasi",              ru: "Все",                   en: "All" },
  { id: "nav",     uz: "🧭 Menyu va Navbar",     ru: "🧭 Меню и Навбар",     en: "🧭 Menu & Navbar" },
  { id: "home",    uz: "🏠 Asosiy sahifa",       ru: "🏠 Главная страница",   en: "🏠 Home Page" },
  { id: "filter",  uz: "🔍 Qidiruv va Filtrlar", ru: "🔍 Поиск и Фильтры",   en: "🔍 Search & Filters" },
  { id: "listing", uz: "📋 E'lonlar va Kartalar", ru: "📋 Объявления и Карты", en: "📋 Listings & Cards" },
  { id: "profile", uz: "👤 Profil va Xabarlar",  ru: "👤 Профиль и Сообщения",en: "👤 Profile & Messages" },
  { id: "admin",   uz: "⚙️ Admin va Tizim",      ru: "⚙️ Админ и Система",   en: "⚙️ Admin & System" },
];

// Ko'p tilli UI matnlari
const UI = {
  uz: {
    title: "🌐 Til va Matnlar Boshqaruvi",
    subtitle: "Saytning barcha matnlarini O'zbek, Rus va Ingliz tillarida qo'lda kiriting va tahrirlang",
    addNew: "+ Yangi matn qo'shish",
    save: "💾 Saqlash",
    saving: "Saqlanmoqda...",
    saved: "✅ Saqlandi!",
    searchPlaceholder: "Matn yoki kalit bo'yicha qidirish...",
    colKey: "Kalit (ID)",
    addTitle: "Yangi matn kiritish",
    keyLabel: "Kalit (masalan: bannerTitle)",
    uzLabel: "🇺🇿 O'zbekcha matn",
    ruLabel: "🇷🇺 Ruscha matn",
    enLabel: "🇬🇧 Inglizcha matn",
    cancel: "Bekor qilish",
    add: "Qo'shish",
  },
  ru: {
    title: "🌐 Управление Языками и Текстами",
    subtitle: "Вручную вводите и редактируйте все тексты сайта на Узбекском, Русском и Английском языках",
    addNew: "+ Добавить новый текст",
    save: "💾 Сохранить",
    saving: "Сохранение...",
    saved: "✅ Сохранено!",
    searchPlaceholder: "Поиск по тексту или ключу...",
    colKey: "Ключ (ID)",
    addTitle: "Добавить новый текст",
    keyLabel: "Ключ (например: bannerTitle)",
    uzLabel: "🇺🇿 Текст на узбекском",
    ruLabel: "🇷🇺 Текст на русском",
    enLabel: "🇬🇧 Текст на английском",
    cancel: "Отмена",
    add: "Добавить",
  },
  en: {
    title: "🌐 Language & Text Management",
    subtitle: "Manually enter and edit all site texts in Uzbek, Russian and English languages",
    addNew: "+ Add new text",
    save: "💾 Save",
    saving: "Saving...",
    saved: "✅ Saved!",
    searchPlaceholder: "Search by text or key...",
    colKey: "Key (ID)",
    addTitle: "Add new text",
    keyLabel: "Key (e.g. bannerTitle)",
    uzLabel: "🇺🇿 Uzbek text",
    ruLabel: "🇷🇺 Russian text",
    enLabel: "🇬🇧 English text",
    cancel: "Cancel",
    add: "Add",
  },
};

function getCategoryForKey(k: string): string {
  if (k.startsWith("admin") || k.endsWith("Nav") || k === "manageListings" || k === "approve" || k === "reject") return "admin";
  if (k.startsWith("add") || k === "profile" || k === "logout" || k === "login" || k === "home" || k === "favorites" || k === "messages" || k === "balance") return "nav";
  if (k.startsWith("hero") || k.startsWith("new") || k === "vipListings" || k === "foundCount" || k === "allListings") return "home";
  if (k.startsWith("all") || k === "search" || k === "onMap" || k === "filters" || k === "price" || k === "from" || k === "to" || k === "amenities" || k === "photosOnly" || k === "clear" || k === "show") return "filter";
  if (k.startsWith("cabinet") || k === "myListings" || k === "buyer" || k === "favoritesTab" || k === "share" || k === "editProfile" || k === "activeSessions" || k === "writeMessage" || k === "deleteChat") return "profile";
  return "listing";
}

export default function AdminTranslationsPage() {
  const { lang } = useLang();
  const ui = UI[lang];

  const [items, setItems] = useState<TranslationItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newUz, setNewUz] = useState("");
  const [newRu, setNewRu] = useState("");
  const [newEn, setNewEn] = useState("");

  // Mouse wheel bilan gorizontal scroll uchun ref
  const catScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Asosiy dict kalitlarini TranslationItem ga aylantiramiz
    const keys = Object.keys(dict.uz);
    const initialItems: TranslationItem[] = keys.map(k => ({
      key: k,
      category: getCategoryForKey(k),
      uz: (dict.uz as any)[k] || "",
      ru: (dict.ru as any)[k] || "",
      en: (dict.en as any)[k] || "",
    }));

    // 2. Serverdagi custom tarjimalarni olib kelib ustiga yozamiz
    fetch("/api/translations")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          const customKeys = new Set([
            ...Object.keys(data.uz || {}),
            ...Object.keys(data.ru || {}),
            ...Object.keys(data.en || {}),
          ]);

          const updated = [...initialItems];

          // Mavjud kalitlarni yangilaymiz
          updated.forEach(item => {
            if (data.uz?.[item.key]) item.uz = data.uz[item.key];
            if (data.ru?.[item.key]) item.ru = data.ru[item.key];
            if (data.en?.[item.key]) item.en = data.en[item.key];
          });

          // Yangi qo'shilgan kalitlarni qo'shamiz
          customKeys.forEach(ck => {
            if (!updated.some(u => u.key === ck)) {
              updated.push({
                key: ck,
                category: getCategoryForKey(ck),
                uz: data.uz?.[ck] || "",
                ru: data.ru?.[ck] || "",
                en: data.en?.[ck] || "",
              });
            }
          });

          setItems(updated);
        } else {
          setItems(initialItems);
        }
      })
      .catch(() => setItems(initialItems));
  }, []);

  // Mouse wheel => gorizontal scroll (sichqoncha uchun)
  useEffect(() => {
    const el = catScrollRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const handleChange = (key: string, langKey: "uz" | "ru" | "en", val: string) => {
    setItems(prev => prev.map(item => item.key === key ? { ...item, [langKey]: val } : item));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const payload = {
        uz: {} as Record<string, string>,
        ru: {} as Record<string, string>,
        en: {} as Record<string, string>,
      };

      items.forEach(item => {
        payload.uz[item.key] = item.uz;
        payload.ru[item.key] = item.ru;
        payload.en[item.key] = item.en;
      });

      const res = await fetch("/api/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(true);
        localStorage.setItem("kelajak_custom_translations", JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent("kelajak_lang_change"));
        setTimeout(() => setSaved(false), 3000);
      } else {
        const d = await res.json();
        setError(d.error || "Saqlashda xatolik");
      }
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    if (!newKey.trim()) return;
    const cleanKey = newKey.trim().replace(/\s+/g, "_");
    setItems(prev => [
      {
        key: cleanKey,
        category: getCategoryForKey(cleanKey),
        uz: newUz.trim(),
        ru: newRu.trim(),
        en: newEn.trim(),
      },
      ...prev,
    ]);
    setNewKey("");
    setNewUz("");
    setNewRu("");
    setNewEn("");
    setNewModalOpen(false);
  };

  const filtered = items.filter(item => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      !search ||
      item.key.toLowerCase().includes(search.toLowerCase()) ||
      item.uz.toLowerCase().includes(search.toLowerCase()) ||
      item.ru.toLowerCase().includes(search.toLowerCase()) ||
      item.en.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Kategoriya nomini joriy tilga qarab olish
  const catLabel = (cat: typeof CATEGORIES[0]) =>
    lang === "uz" ? cat.uz : lang === "ru" ? cat.ru : cat.en;

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      {/* Sarlavha va Harakat tugmalari */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            {ui.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {ui.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setNewModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-sm font-bold transition flex items-center gap-2"
          >
            {ui.addNew}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 px-6 py-2.5 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2 shadow-md text-sm"
          >
            {saving ? ui.saving : saved ? ui.saved : ui.save}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-500/20 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Qidiruv va Kategoriya filtri */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-[#181a1f] p-4 rounded-2xl border border-gray-200 dark:border-white/5">
        {/* Kategoriyalar — mouse wheel + overflow scroll */}
        <div
          ref={catScrollRef}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide cursor-pointer"
          style={{ scrollBehavior: "smooth" }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                activeCategory === cat.id
                  ? "bg-yellow-400 text-gray-950 shadow-sm"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {catLabel(cat)}
            </button>
          ))}
        </div>

        {/* Qidiruv */}
        <div className="relative w-full md:w-64 flex-shrink-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={ui.searchPlaceholder}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      {/* Matnlar Jadvali */}
      <div className="bg-white dark:bg-[#181a1f] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-44">{ui.colKey}</th>
                <th className="py-3 px-4">🇺🇿 O'zbekcha</th>
                <th className="py-3 px-4">🇷🇺 Русский</th>
                <th className="py-3 px-4">🇬🇧 English</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
              {filtered.map(item => (
                <tr key={item.key} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 px-4 align-top">
                    <span className="font-mono text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 px-2 py-1 rounded-md block break-all">
                      {item.key}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.uz}
                      onChange={e => handleChange(item.key, "uz", e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-yellow-400 transition"
                      placeholder="O'zbekcha..."
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.ru}
                      onChange={e => handleChange(item.key, "ru", e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-yellow-400 transition"
                      placeholder="Русский..."
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.en}
                      onChange={e => handleChange(item.key, "en", e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-yellow-400 transition"
                      placeholder="English..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yangi matn qo'shish modali */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1f23] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ui.addTitle}</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{ui.keyLabel}</label>
              <input
                type="text"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="bannerTitle"
                className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{ui.uzLabel}</label>
              <input
                type="text"
                value={newUz}
                onChange={e => setNewUz(e.target.value)}
                placeholder="O'zbekcha yozuv"
                className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{ui.ruLabel}</label>
              <input
                type="text"
                value={newRu}
                onChange={e => setNewRu(e.target.value)}
                placeholder="Русский текст"
                className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{ui.enLabel}</label>
              <input
                type="text"
                value={newEn}
                onChange={e => setNewEn(e.target.value)}
                placeholder="English text"
                className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setNewModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                {ui.cancel}
              </button>
              <button
                onClick={handleAddNew}
                className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold text-sm shadow-md transition"
              >
                {ui.add}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
