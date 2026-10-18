"use client";

import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/components/LangProvider";

interface Agent {
  id: string;
  name: string;
  phone: string;
  avatar: string | null;
  badge: string;
  listingsCount: number;
}

const BADGE_CONFIG: Record<string, { color: string; label: string }> = {
  STAR:     { color: "text-yellow-400", label: "Top Rieltor" },
  VERIFIED: { color: "text-blue-500",   label: "Tasdiqlangan" },
  GOLD:     { color: "text-orange-400",  label: "Oltin" },
  ELITE:    { color: "text-yellow-500",    label: "Elite" },
};

function StarIcon({ color, size = "w-4 h-4" }: { color: string; size?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${size} ${color} shrink-0`}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function BadgeIcon({ badge }: { badge: string }) {
  const cfg = BADGE_CONFIG[badge];
  if (!cfg) return null;
  return (
    <span title={cfg.label} className="shrink-0 flex items-center justify-center">
      <StarIcon color={cfg.color} size="w-3.5 h-3.5" />
    </span>
  );
}

export function AgentSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lang } = useLang();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce qidiruv
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAgents = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setAgents(data);
    } catch {
      // xatolik e'tiborsiz qoldiriladi
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchAgents(debouncedQuery);
  }, [isOpen, debouncedQuery, fetchAgents]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[340px] bg-white dark:bg-[#151518] shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {lang === "ru" ? "Риелторы" : lang === "en" ? "Agents" : "Rieltorlar"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Qidiruv */}
        <div className="p-5 shrink-0">
          <div className="relative flex items-center bg-gray-100 dark:bg-[#252529] rounded-xl h-11 overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400/50 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-4 text-gray-500 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder={lang === "ru" ? "Поиск риелтора..." : lang === "en" ? "Search agent..." : "Rieltor ismini kiriting..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-full bg-transparent text-[13px] px-3 text-gray-900 dark:text-white placeholder-gray-500 outline-none"
            />
            {loading && (
              <div className="mr-3 w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          {loading ? (
            <p className="text-[11px] font-semibold text-gray-500 mt-3 px-1">
              {lang === "ru" ? "Загрузка..." : lang === "en" ? "Loading..." : "Yuklanmoqda..."}
            </p>
          ) : agents.length > 0 ? (
            <p className="text-[11px] font-semibold text-gray-500 mt-3 px-1">
              {lang === "ru" ? `${agents.length} риелторов` : lang === "en" ? `${agents.length} agents` : `${agents.length} ta rieltor`}
            </p>
          ) : null}
        </div>

        {/* Ro'yxat */}
        <div className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
          {!loading && agents.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm font-medium">
                {lang === "ru" ? "Риелторы не найдены" : lang === "en" ? "No agents found" : "Rieltor topilmadi"}
              </p>
            </div>
          )}

          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer mb-1"
            >
              {/* Avatar */}
              <div className="relative shrink-0 w-[48px] h-[48px]">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-lg overflow-hidden border border-gray-200 dark:border-white/10">
                  {agent.avatar ? (
                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                  ) : (
                    agent.name.charAt(0).toUpperCase()
                  )}
                </div>
                {/* Badge dot */}
                {agent.badge !== "NONE" && BADGE_CONFIG[agent.badge] && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#151518] flex items-center justify-center">
                    <StarIcon color={BADGE_CONFIG[agent.badge].color} size="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Ma'lumot */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-white truncate">
                    {agent.name}
                  </h3>
                  <BadgeIcon badge={agent.badge} />
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                  {agent.phone}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[12px] font-bold text-gray-900 dark:text-white">
                    {agent.listingsCount}
                  </span>
                  <span className="text-[12px] text-gray-500 font-normal">ta e'lon</span>
                </div>
              </div>

              {/* O'q */}
              <div className="shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
