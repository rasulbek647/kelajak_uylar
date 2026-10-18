"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/components/LangProvider";

const LISTING_TYPES = [
  { value: "Barchasi", labelUz: "Barcha turlar", labelRu: "Все типы", labelEn: "All types" },
  { value: "Kvartira", labelUz: "Kvartira", labelRu: "Квартира", labelEn: "Apartment" },
  { value: "Hovli uy", labelUz: "Hovli uy", labelRu: "Дом / Участок", labelEn: "House" },
  { value: "Yer uchastkasi", labelUz: "Yer uchastkasi", labelRu: "Земельный участок", labelEn: "Land" },
  { value: "Ofis", labelUz: "Ofis", labelRu: "Офис", labelEn: "Office" },
  { value: "Tijorat joyi", labelUz: "Tijorat joyi", labelRu: "Коммерческая", labelEn: "Commercial" },
];

const TIME_FILTERS = [
  { value: "all", labelUz: "Barcha vaqt", labelRu: "За все время", labelEn: "All time" },
  { value: "week", labelUz: "Oxirgi hafta", labelRu: "За неделю", labelEn: "Last week" },
  { value: "month", labelUz: "Oxirgi oy", labelRu: "За месяц", labelEn: "Last month" },
];

const DEAL_TABS = [
  { value: "Sotish", labelUz: "Sotuv", labelRu: "Продажа", labelEn: "Buy" },
  { value: "Ijara", labelUz: "Ijara", labelRu: "Аренда", labelEn: "Rent" },
  { value: "Kunlik ijara", labelUz: "Kunlik", labelRu: "Посуточная", labelEn: "Daily" },
];

// ─── Ko'chmas mulk turi uchun alohida dropdown komponenti ───────────────────
interface TypeDropdownProps {
  value: string;
  onChange: (val: string) => void;
  lang: string;
  variant?: "pill" | "chip";
}

function TypeDropdown({ value, onChange, lang, variant = "chip" }: TypeDropdownProps) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openDropdown = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 180),
      });
    }
    setOpen(true);
  }, []);

  // Tashqarida bosilganda yopilsin
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (btnRef.current && btnRef.current.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  const getCurrentLabel = () => {
    if (!value || value === "Barchasi") {
      return lang === "uz" ? "Ko'chmas mulk turi" : lang === "ru" ? "Тип недвижимости" : "Property type";
    }
    const found = LISTING_TYPES.find((t) => t.value === value);
    if (!found) return value;
    return lang === "uz" ? found.labelUz : lang === "ru" ? found.labelRu : found.labelEn;
  };

  const isActive = value && value !== "Barchasi";

  const btnClass =
    variant === "pill"
      ? `bg-white/95 dark:bg-[#181a1f]/95 backdrop-blur-md border text-xs sm:text-sm font-semibold rounded-full px-4 py-2 transition shadow-lg flex items-center gap-1.5 ${
          isActive
            ? "border-yellow-400 text-yellow-500 dark:text-yellow-400 font-bold"
            : "border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100"
        }`
      : `flex items-center gap-1.5 border text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-4 py-2 transition ${
          isActive
            ? "bg-yellow-400/10 border-yellow-400 text-yellow-600 dark:text-yellow-400 font-bold shadow-sm"
            : "bg-gray-100 dark:bg-[#1f2229] border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
        }`;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={openDropdown}
        className={btnClass}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {variant === "pill" && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-yellow-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        )}
        <span>{getCurrentLabel()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {mounted && open && createPortal(
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-[9980]"
            onMouseDown={() => setOpen(false)}
            onTouchStart={() => setOpen(false)}
          />
          {/* dropdown list */}
          <div
            role="listbox"
            style={{
              position: "absolute",
              top: dropPos.top,
              left: dropPos.left,
              minWidth: dropPos.width,
              zIndex: 9999,
            }}
            className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 overflow-hidden animate-fadeIn"
          >
            {LISTING_TYPES.map((item) => {
              const label = lang === "uz" ? item.labelUz : lang === "ru" ? item.labelRu : item.labelEn;
              const isSel = value === item.value || (!value && item.value === "Barchasi");
              return (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(item.value);
                    setOpen(false);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
                    isSel
                      ? "bg-yellow-400/15 text-yellow-600 dark:text-yellow-400 font-bold"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  {isSel && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                  {!isSel && <span className="w-4 shrink-0" />}
                  {label}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export const FilterBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const isMapView = searchParams.get("view") === "map";

  const [type, setType] = useState(searchParams.get("type") || "Barchasi");
  const [dealType, setDealType] = useState(searchParams.get("dealType") || "Barchasi");
  const [rooms, setRooms] = useState(searchParams.get("rooms") || "Barchasi");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [time, setTime] = useState(searchParams.get("time") || "all");
  const [owner, setOwner] = useState(searchParams.get("owner") || "");
  const [searchText, setSearchText] = useState(searchParams.get("q") || "");
  const [amenities, setAmenities] = useState<string[]>(searchParams.getAll("amenities") || []);
  const [withImages, setWithImages] = useState(searchParams.get("withImages") === "true");
  const [layout, setLayout] = useState<"default" | "detailed">(
    (searchParams.get("layout") as "default" | "detailed") || "default"
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setType(searchParams.get("type") || "Barchasi");
    setDealType(searchParams.get("dealType") || "Barchasi");
    setRooms(searchParams.get("rooms") || "Barchasi");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setTime(searchParams.get("time") || "all");
    setOwner(searchParams.get("owner") || "");
    setWithImages(searchParams.get("withImages") === "true");
    setAmenities(searchParams.getAll("amenities") || []);
    setSearchText(searchParams.get("q") || "");
    const urlLayout = searchParams.get("layout") as "default" | "detailed";
    const saved = typeof window !== "undefined"
      ? (localStorage.getItem("kelajak_layout") as "default" | "detailed")
      : null;
    if (urlLayout) setLayout(urlLayout);
    else if (saved) setLayout(saved);
  }, [searchParams]);

  const switchLayout = (newLayout: "default" | "detailed") => {
    setLayout(newLayout);
    if (typeof window !== "undefined") {
      localStorage.setItem("kelajak_layout", newLayout);
      window.dispatchEvent(new CustomEvent("kelajak_layout_change", { detail: newLayout }));
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("layout", newLayout);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const buildParams = (overrides: Record<string, string | string[] | boolean> = {}) => {
    const params = new URLSearchParams();
    const vals = { type, dealType, rooms, minPrice, maxPrice, time, owner, amenities, withImages, layout, ...overrides };
    const currentQ = searchParams.get("q");
    if (currentQ) params.set("q", currentQ);
    if (vals.type && vals.type !== "Barchasi" && vals.type !== "") params.set("type", vals.type as string);
    if (vals.dealType && vals.dealType !== "Barchasi") params.set("dealType", vals.dealType as string);
    if (vals.rooms && vals.rooms !== "Barchasi") params.set("rooms", vals.rooms as string);
    if (vals.minPrice) params.set("minPrice", vals.minPrice as string);
    if (vals.maxPrice) params.set("maxPrice", vals.maxPrice as string);
    if (vals.time && vals.time !== "all") params.set("time", vals.time as string);
    if (vals.owner) params.set("owner", vals.owner as string);
    if (vals.withImages) params.set("withImages", "true");
    if (vals.layout) params.set("layout", vals.layout as string);
    if (Array.isArray(vals.amenities)) vals.amenities.forEach((am) => params.append("amenities", am));
    if (isMapView) params.set("view", "map");
    return params.toString();
  };

  const applyFilters = () => {
    setIsFilterModalOpen(false);
    router.push(`/?${buildParams()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(buildParams());
    if (searchText.trim()) params.set("q", searchText.trim());
    else params.delete("q");
    router.push(`/?${params.toString()}`);
  };

  const handleDealTab = (val: string) => {
    const newVal = dealType === val ? "Barchasi" : val;
    setDealType(newVal);
    router.push(`/?${buildParams({ dealType: newVal })}`);
  };

  const handleTimeFilter = (val: string) => {
    const newTime = time === val ? "all" : val;
    setTime(newTime);
    router.push(`/?${buildParams({ time: newTime })}`);
  };

  const handleOwnerFilter = () => {
    const newOwner = owner === "Egasi" ? "" : "Egasi";
    setOwner(newOwner);
    router.push(`/?${buildParams({ owner: newOwner })}`);
  };

  const handleTypeChange = (selectedVal: string) => {
    const newType = selectedVal || "Barchasi";
    setType(newType);
    router.push(`/?${buildParams({ type: newType })}`);
  };

  const toggleMapView = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isMapView) params.delete("view");
    else params.set("view", "map");
    router.push(`/?${params.toString()}`);
  };

  const tabLabel = (tab: (typeof DEAL_TABS)[0]) =>
    lang === "uz" ? tab.labelUz : lang === "ru" ? tab.labelRu : tab.labelEn;

  // ─── FILTER MODAL ───────────────────────────────────────────
  const renderFilterModal = () => {
    if (!isFilterModalOpen || !mounted) return null;
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
        <div className="bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden max-h-[88vh] animate-fadeIn">
          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100 dark:border-white/5 shrink-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {lang === "uz" ? "Barcha filtrlar" : lang === "ru" ? "Все фильтры" : "All Filters"}
            </h3>
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 flex flex-col gap-5 overflow-y-auto">
            {/* Mulk turi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                {lang === "uz" ? "Ko'chmas mulk turi" : lang === "ru" ? "Тип недвижимости" : "Property type"}
              </label>
              <div className="flex flex-wrap gap-2">
                {LISTING_TYPES.map((tItem) => {
                  const isSel = type === tItem.value || (!type && tItem.value === "Barchasi");
                  const itemLabel = lang === "uz" ? tItem.labelUz : lang === "ru" ? tItem.labelRu : tItem.labelEn;
                  return (
                    <button
                      key={tItem.value}
                      type="button"
                      onClick={() => setType(tItem.value)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        isSel
                          ? "bg-yellow-400 text-black border border-yellow-400 shadow-sm font-bold"
                          : "bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-yellow-400/50"
                      }`}
                    >
                      {itemLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Narx */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === "uz" ? "Narx (y.e.)" : lang === "ru" ? "Цена (у.е.)" : "Price (USD)"}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="0"
                  placeholder={lang === "uz" ? "Dan" : lang === "ru" ? "От" : "From"}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm outline-none focus:border-yellow-400"
                />
                <span className="text-gray-500 shrink-0">-</span>
                <input
                  type="number" min="0"
                  placeholder={lang === "uz" ? "Gacha" : lang === "ru" ? "До" : "To"}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Xonalar soni */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                {lang === "uz" ? "Xonalar soni" : lang === "ru" ? "Количество комнат" : "Rooms"}
              </label>
              <div className="flex flex-wrap gap-2">
                {["Barchasi", "1", "2", "3", "4", "5", "6+"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRooms(opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      rooms === opt
                        ? "bg-yellow-400 text-black border border-yellow-400 shadow-sm font-bold"
                        : "bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-yellow-400/50"
                    }`}
                  >
                    {opt === "Barchasi" ? (lang === "uz" ? "Barchasi" : lang === "ru" ? "Все" : "All") : opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Qulayliklar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                {lang === "uz" ? "Qulayliklar" : lang === "ru" ? "Удобства" : "Amenities"}
              </label>
              <div className="flex flex-wrap gap-2">
                {["Gaz", "Suv", "Svet", "Internet/WiFi", "Konditsioner", "Mebel", "Avtoturargoh", "Isitish tizimi"].map((am) => (
                  <label
                    key={am}
                    className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg group hover:border-yellow-400/50 transition"
                  >
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${amenities.includes(am) ? "bg-yellow-400 border-yellow-400 text-black" : "border-gray-400 dark:border-gray-500"}`}>
                      {amenities.includes(am) && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox" className="hidden"
                      checked={amenities.includes(am)}
                      onChange={(e) => {
                        if (e.target.checked) setAmenities([...amenities, am]);
                        else setAmenities(amenities.filter((a) => a !== am));
                      }}
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium select-none">{am}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Faqat rasmli */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${withImages ? "bg-yellow-400 border-yellow-400 text-black" : "border-gray-400 dark:border-gray-500"}`}>
                  {withImages && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" className="hidden" checked={withImages} onChange={(e) => setWithImages(e.target.checked)} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lang === "uz" ? "Faqat rasmli e'lonlar" : lang === "ru" ? "Только с фото" : "Only with photos"}
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={() => { setType("Barchasi"); setMinPrice(""); setMaxPrice(""); setRooms("Barchasi"); setAmenities([]); setWithImages(false); }}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium"
            >
              {lang === "uz" ? "Tozalash" : lang === "ru" ? "Сбросить" : "Clear"}
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-sm font-bold rounded-xl transition shadow-md"
            >
              {lang === "uz" ? "Ko'rsatish" : lang === "ru" ? "Показать" : "Show"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // ─── XARITA REJIMI ──────────────────────────────────────────
  if (isMapView) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 relative">
        {renderFilterModal()}

        {/* Qidiruv qatori */}
        <div className="flex items-center gap-2 bg-white/95 dark:bg-[#181a1f]/95 backdrop-blur-md rounded-full p-1.5 shadow-xl border border-gray-200 dark:border-white/10 w-full transition-colors duration-200">
          <button
            type="button"
            onClick={toggleMapView}
            className="w-10 h-10 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 rounded-full text-gray-950 transition shrink-0 shadow-sm"
            title={lang === "uz" ? "Ro'yxatga qaytish" : lang === "ru" ? "Вернуться к списку" : "Back to list"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={lang === "uz" ? "Qidirish..." : lang === "ru" ? "Поиск..." : "Search..."}
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm pl-9 pr-4 py-2 outline-none font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-gray-200 transition shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </button>
        </div>

        {/* Deal tabs */}
        <div className="flex bg-white/95 dark:bg-[#181a1f]/95 backdrop-blur-md rounded-full shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden w-full p-1 transition-colors duration-200">
          {DEAL_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleDealTab(tab.value)}
              className={`flex-1 py-1.5 text-xs sm:text-sm font-bold transition-all rounded-full ${
                dealType === tab.value
                  ? "bg-yellow-400 text-gray-950 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              {tabLabel(tab)}
            </button>
          ))}
        </div>

        {/* Filtr pills */}
        <div className="flex items-center justify-center gap-2 w-full flex-wrap">
          <TypeDropdown value={type} onChange={handleTypeChange} lang={lang} variant="pill" />

          <button
            type="button"
            onClick={handleOwnerFilter}
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border shadow-lg transition ${
              owner === "Egasi"
                ? "bg-yellow-400 text-gray-950 border-yellow-400 font-bold"
                : "bg-white/95 dark:bg-[#181a1f]/95 backdrop-blur-md border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-yellow-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            {lang === "uz" ? "Egasi" : lang === "ru" ? "Владелец" : "Owner"}
          </button>

          {TIME_FILTERS.filter((f) => f.value !== "all").map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleTimeFilter(f.value)}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border shadow-lg transition ${
                time === f.value
                  ? "bg-yellow-400 text-gray-950 border-yellow-400 font-bold"
                  : "bg-white/95 dark:bg-[#181a1f]/95 border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-yellow-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {lang === "uz" ? f.labelUz : lang === "ru" ? f.labelRu : f.labelEn}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── ODDIY RO'YXAT REJIMI ─────────────────────────────────────
  return (
    <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-white/5 pb-2.5 relative transition-colors z-20">
      {renderFilterModal()}

      <div className="max-w-screen-xl mx-auto">
        {/* Qator 1 */}
        <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          {/* Grid/List tugmalari */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl p-1 gap-1 border border-gray-200/50 dark:border-white/5 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => switchLayout("default")}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                layout === "default"
                  ? "bg-yellow-400 text-gray-950 shadow-md font-bold scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              title={lang === "uz" ? "Standart ko'rinish" : lang === "ru" ? "Стандартный вид" : "Standard view"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => switchLayout("detailed")}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                layout === "detailed"
                  ? "bg-yellow-400 text-gray-950 shadow-md font-bold scale-105"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
              title={lang === "uz" ? "Katta kartalar ko'rinishi" : lang === "ru" ? "Большие карточки" : "Detailed view"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
          </div>

          {/* Xaritada tugmasi */}
          <button
            type="button"
            onClick={toggleMapView}
            className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 text-xs sm:text-[13px] font-semibold px-3 sm:px-4 py-2 rounded-full transition shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            {lang === "uz" ? "Xaritada" : lang === "ru" ? "На карте" : "Map"}
          </button>

          <div className="flex-1" />

          {/* Filtrlar tugmasi */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 text-xs sm:text-[13px] font-semibold px-3.5 sm:px-5 py-2 rounded-full transition shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            {lang === "uz" ? "Filtrlar" : lang === "ru" ? "Фильтры" : "Filters"}
          </button>
        </div>

        {/* Qator 2: Deal tabs */}
        <div className="px-3 sm:px-6 pb-2.5">
          <div className="flex bg-gray-100 dark:bg-[#1f2229] rounded-2xl overflow-hidden p-1 border border-gray-200/50 dark:border-white/5">
            {DEAL_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleDealTab(tab.value)}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold transition-all rounded-xl ${
                  dealType === tab.value
                    ? "bg-yellow-400 text-gray-950 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tabLabel(tab)}
              </button>
            ))}
          </div>
        </div>

        {/* Qator 3: Filter chips */}
        <div className="px-3 sm:px-6 flex items-center gap-2 pb-1 flex-wrap">
          {/* Ko'chmas mulk turi — custom dropdown, 100% barcha qurilmalarda ishlaydi */}
          <TypeDropdown value={type} onChange={handleTypeChange} lang={lang} variant="chip" />

          {/* Egasi */}
          <button
            type="button"
            onClick={handleOwnerFilter}
            className={`shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-4 py-2 transition border ${
              owner === "Egasi"
                ? "bg-yellow-400 text-gray-950 border-yellow-400 font-bold shadow-sm"
                : "bg-gray-100 dark:bg-[#1f2229] hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${owner === "Egasi" ? "text-gray-900" : "text-gray-500 dark:text-gray-400"}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            {lang === "uz" ? "Egasi" : lang === "ru" ? "Владелец" : "Owner"}
          </button>

          {/* Oxirgi hafta / Oxirgi oy */}
          {TIME_FILTERS.filter((f) => f.value !== "all").map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleTimeFilter(f.value)}
              className={`shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl border transition ${
                time === f.value
                  ? "bg-yellow-400 text-gray-950 border-yellow-400 font-bold shadow-sm"
                  : "bg-gray-100 dark:bg-[#1f2229] hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${time === f.value ? "text-gray-900" : "opacity-70"}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {lang === "uz" ? f.labelUz : lang === "ru" ? f.labelRu : f.labelEn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
