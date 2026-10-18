"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { t, lang } = useLang();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"elonlar" | "xaridor">("elonlar");

  // Filters State
  const [dealTypeFilter, setDealTypeFilter] = useState("E'lon maqsadi");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("Mulk toifasi");
  const [sortFilter, setSortFilter] = useState("Saralash");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/user/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.message === "Foydalanuvchi topilmadi") {
          setNotFound(true);
        } else {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-6xl">🏚️</div>
        <h1 className="text-gray-900 dark:text-white text-2xl font-bold">{t.userNotFound}</h1>
        <Link href="/" className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-500 transition">
          {t.backToHome}
        </Link>
      </div>
    );
  }

  const username = (user.name || "Foydalanuvchi").toLowerCase().replace(/\s+/g, "_");

  let filteredListings = user.listings ? [...user.listings] : [];

  if (dealTypeFilter !== "E'lon maqsadi" && dealTypeFilter !== "Xammasi") {
    if (dealTypeFilter === "Kunlik ijaraga beraman") {
      filteredListings = filteredListings.filter((l: any) => l.dealType === "Kunlik ijara");
    } else if (dealTypeFilter === "Ijaraga beraman") {
      filteredListings = filteredListings.filter((l: any) => l.dealType === "Ijara");
    } else if (dealTypeFilter === "Sotaman") {
      filteredListings = filteredListings.filter((l: any) => l.dealType === "Sotish");
    } else {
      filteredListings = [];
    }
  }

  if (propertyTypeFilter !== "Mulk toifasi" && propertyTypeFilter !== "Barchasi") {
    filteredListings = filteredListings.filter((l: any) => l.type === propertyTypeFilter);
  }

  if (sortFilter === "Eng yangilari") {
    filteredListings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortFilter === "Arzonlari") {
    filteredListings.sort((a: any, b: any) => a.price - b.price);
  } else if (sortFilter === "Qimmatlari") {
    filteredListings.sort((a: any, b: any) => b.price - a.price);
  }

  const isFiltered = dealTypeFilter !== "E'lon maqsadi" || propertyTypeFilter !== "Mulk toifasi" || sortFilter !== "Saralash";

  const clearFilters = () => {
    setDealTypeFilter("E'lon maqsadi");
    setPropertyTypeFilter("Mulk toifasi");
    setSortFilter("Saralash");
  };

  const dealTypeOptions = ["Xammasi", "Kunlik ijaraga beraman", "Ijaraga beraman", "Sotaman", "Ijaraga olaman", "Sotib olaman"];
  const propertyTypeOptions = ["Barchasi", "Kvartira", "Hovli uy", "Yer uchastkasi", "Ofis", "Tijorat joyi"];
  const sortOptions = ["Eng yangilari", "Arzonlari", "Qimmatlari"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111113] transition-colors pb-20 w-full font-sans">
      <div className="w-full max-w-[1200px] mx-auto px-4 pt-4 sm:pt-10">

        {/* Yuqori qism (Header) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden shrink-0 bg-yellow-100 dark:bg-[#f8c9b9]">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black text-4xl font-bold">
                  {user.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Ism va ID */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-gray-900 dark:text-white text-2xl font-bold">{username}</h1>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30">
                    {t.verified}
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">ID: {user.id.slice(0, 6)}</p>
            </div>
          </div>

          {/* Harakat tugmalari */}
          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto mt-2 sm:mt-0">
            {user.phone && (
              <a
                href={`tel:${user.phone}`}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-gray-200 dark:bg-[#f3f4f6] text-black font-bold text-sm rounded-full hover:bg-gray-300 dark:hover:bg-gray-200 transition text-center"
              >
                📞 {t.callSeller}
              </a>
            )}
            <Link
              href={`/profile/messages?recipientId=${user.id}`}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-yellow-400 text-black font-bold text-sm rounded-full hover:bg-yellow-500 transition text-center"
            >
              💬 {t.writeSeller}
            </Link>
          </div>
        </div>

        {/* To'liq ism */}
        <h2 className="text-gray-900 dark:text-white text-xl font-bold mt-8 mb-5">{user.name}</h2>

        {/* Statistika */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#1e1f23] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            <p className="text-gray-900 dark:text-white text-2xl font-bold mb-1">{user.listingsCount}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.listingsNav}</p>
          </div>
          <div className="bg-white dark:bg-[#1e1f23] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            <p className="text-gray-900 dark:text-white text-2xl font-bold mb-1">{user.listings?.reduce((sum: number, l: any) => sum + (l.views || 0), 0) || 0}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.viewsLabel}</p>
          </div>
          <div className="bg-white dark:bg-[#1e1f23] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            <p className="text-gray-900 dark:text-white text-2xl font-bold mb-1">0</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.callsLabel}</p>
          </div>
          <div className="bg-white dark:bg-[#1e1f23] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            <p className="text-gray-900 dark:text-white text-2xl font-bold mb-1">0</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.salesLabel}</p>
          </div>
        </div>

        {/* Tablar */}
        <div className="flex border-b border-gray-200 dark:border-[#27272a] mb-6">
          <button
            onClick={() => setActiveTab("elonlar")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[15px] font-bold border-b-2 transition-colors ${
              activeTab === "elonlar"
                ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                : "border-transparent text-gray-400 dark:text-[#9ca3af] hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
            {t.listingsNav}
          </button>
          <button
            onClick={() => setActiveTab("xaridor")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[15px] font-bold border-b-2 transition-colors ${
              activeTab === "xaridor"
                ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                : "border-transparent text-gray-400 dark:text-[#9ca3af] hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {t.buyer}
          </button>
        </div>

        {/* Filtrlar */}
        {activeTab === "elonlar" && (
          <div className="flex flex-wrap items-center gap-3 mb-8" ref={filterRef}>
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="text-gray-500 dark:text-[#9ca3af] text-[13px] flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition mr-2"
              >
                ✕ {t.clear}
              </button>
            )}

            {/* E'lon maqsadi */}
            <div className="relative w-full sm:w-[240px]">
              <button
                onClick={() => setActiveDropdown(activeDropdown === "deal" ? null : "deal")}
                className="w-full bg-gray-200 dark:bg-[#27272a] rounded-full py-2.5 px-6 text-[13px] font-medium text-gray-700 dark:text-gray-300 text-center cursor-pointer hover:bg-gray-300 dark:hover:bg-[#3f3f46] transition truncate select-none"
              >
                {dealTypeFilter}
              </button>
              {activeDropdown === "deal" && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#27272a] border border-gray-200 dark:border-white/10 rounded-2xl py-2 z-20 shadow-xl overflow-hidden">
                  {dealTypeOptions.map(opt => (
                    <div
                      key={opt}
                      onClick={() => { setDealTypeFilter(opt); setActiveDropdown(null); }}
                      className="px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#3f3f46] cursor-pointer text-sm text-gray-700 dark:text-gray-300 transition select-none"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mulk toifasi */}
            <div className="relative w-full sm:w-[240px]">
              <button
                onClick={() => setActiveDropdown(activeDropdown === "prop" ? null : "prop")}
                className="w-full bg-gray-200 dark:bg-[#27272a] rounded-full py-2.5 px-6 text-[13px] font-medium text-gray-700 dark:text-gray-300 text-center cursor-pointer hover:bg-gray-300 dark:hover:bg-[#3f3f46] transition truncate select-none"
              >
                {propertyTypeFilter}
              </button>
              {activeDropdown === "prop" && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#27272a] border border-gray-200 dark:border-white/10 rounded-2xl py-2 z-20 shadow-xl overflow-hidden">
                  {propertyTypeOptions.map(opt => (
                    <div
                      key={opt}
                      onClick={() => { setPropertyTypeFilter(opt); setActiveDropdown(null); }}
                      className="px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#3f3f46] cursor-pointer text-sm text-gray-700 dark:text-gray-300 transition select-none"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saralash */}
            <div className="relative w-full sm:w-[240px]">
              <button
                onClick={() => setActiveDropdown(activeDropdown === "sort" ? null : "sort")}
                className="w-full bg-gray-200 dark:bg-[#27272a] rounded-full py-2.5 px-6 text-[13px] font-medium text-gray-700 dark:text-gray-300 text-center cursor-pointer hover:bg-gray-300 dark:hover:bg-[#3f3f46] transition truncate select-none"
              >
                {sortFilter}
              </button>
              {activeDropdown === "sort" && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#27272a] border border-gray-200 dark:border-white/10 rounded-2xl py-2 z-20 shadow-xl overflow-hidden">
                  {sortOptions.map(opt => (
                    <div
                      key={opt}
                      onClick={() => { setSortFilter(opt); setActiveDropdown(null); }}
                      className="px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#3f3f46] cursor-pointer text-sm text-gray-700 dark:text-gray-300 transition select-none"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* E'lonlar ro'yxati */}
        {activeTab === "elonlar" && (
          filteredListings.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M165.7 87.5C170.8 111.4 153.2 136.6 130.4 146.9C114.5 154 103.8 171.1 94.7 185.3C83.2 203.2 56 195.9 51.5 174.6C48.7 161.4 34 153 22 146C1.1 133.7 -5.4 105.8 4.6 84.4C11.5 69.5 7.4 51.2 16.4 37.8C27.9 20.6 52.3 22.8 70 32C84 39.3 100.9 37.8 116.1 32.9C139.4 25.3 158.9 56 165.7 87.5Z" fill="#f3f4f6" />
                  <circle cx="95" cy="105" r="30" fill="#facc15" />
                  <path d="M115 125 L135 145" stroke="#facc15" strokeWidth="12" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-gray-700 dark:text-white font-medium text-[15px]">{t.noListings}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredListings.map((l: any) => (
                <Link
                  key={l.id}
                  href={`/listing/${l.id}`}
                  className="w-full rounded-2xl md:rounded-3xl overflow-hidden relative group border border-gray-200 dark:border-white/5 bg-white dark:bg-[#1e1f23] shadow-sm hover:shadow-xl transition-all duration-300"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    src={l.images?.[0]?.url || "https://via.placeholder.com/400x300?text=Rasm+yo%27q"}
                    alt={l.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {l.status === "ACTIVE" && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-black text-[11px] font-bold px-2 py-1 rounded shadow-lg z-10 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                      VIP
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                    <p className="text-white font-bold text-base sm:text-xl leading-tight mb-1">
                      {l.price.toLocaleString("ru-RU")} {l.currency}
                    </p>
                    <p className="text-white/90 text-sm font-medium line-clamp-2 leading-snug">{l.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Xaridor bo'limi */}
        {activeTab === "xaridor" && (
          <div className="py-16 text-center">
            <p className="text-gray-500 text-lg">{t.inDevelopment}</p>
          </div>
        )}

      </div>
    </div>
  );
}
