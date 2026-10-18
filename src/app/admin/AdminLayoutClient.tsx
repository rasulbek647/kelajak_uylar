"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import NotificationBell from "@/components/NotificationBell";
import { useLang } from "@/components/LangProvider";

// Admin panelining o'z so'z lug'ati (LangProvider ning t dan tashqari qo'shimcha so'zlar)
const adminDict = {
  uz: {
    dashboard: "Dashboard",
    listings: "E'lonlar",
    users: "Foydalanuvchilar",
    settings: "Sozlamalar",
    reports: "Shikoyatlar",
    adminPanel: "Admin Panel",
    adminTitle: "Admin",
    logout: "Chiqish",
    backToSite: "Saytga qaytish",
    adminRole: "Administrator",
    translationsMenu: "Til va Matnlar",
  },
  ru: {
    dashboard: "Дашборд",
    listings: "Объявления",
    users: "Пользователи",
    settings: "Настройки",
    reports: "Жалобы",
    adminPanel: "Админ Панель",
    adminTitle: "Админ",
    logout: "Выйти",
    backToSite: "Вернуться на сайт",
    adminRole: "Администратор",
    translationsMenu: "Языки и Тексты",
  },
  en: {
    dashboard: "Dashboard",
    listings: "Listings",
    users: "Users",
    settings: "Settings",
    reports: "Reports",
    adminPanel: "Admin Panel",
    adminTitle: "Admin",
    logout: "Logout",
    backToSite: "Back to site",
    adminRole: "Administrator",
    translationsMenu: "Languages & Texts",
  },
};

export default function AdminLayoutClient({ children, adminName, adminImage }: { children: React.ReactNode, adminName: string, adminImage: string | null }) {
  const pathname = usePathname();
  // Global LangProvider dan foydalanish — admin va sayt tili bir xil bo'ladi
  const { lang, setLang } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on path change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const t = adminDict[lang];

  const navItems = [
    { href: "/admin", label: t.dashboard, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
    { href: "/admin/listings", label: t.listings, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12.25" /></svg> },
    { href: "/admin/users", label: t.users, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> },
    { href: "/admin/translations", label: t.translationsMenu, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" /></svg> },
    { href: "/admin/settings", label: t.settings, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.78.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { href: "/admin/reports", label: t.reports, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
  ];

  return (
    <div className="dark">
      <div className="flex h-[100dvh] bg-[#F4F4F6] dark:bg-black text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chap Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-white dark:bg-[#111113] border-r border-gray-200 dark:border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between gap-3 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgb(250,204,21,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-6 h-6">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">KELAJAK UYLAR</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t.adminPanel}</p>
              </div>
            </div>
            {/* Close button on mobile */}
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menyu */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold text-sm ${
                    isActive
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e1f23] hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Pastki qism */}
          <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-2 transition-colors">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e1f23] hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              {t.backToSite}
            </Link>
            <button onClick={() => signOut({ callbackUrl: window.location.origin })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-yellow-500 dark:text-red-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 hover:text-yellow-400 dark:hover:text-yellow-300 transition-colors text-sm font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
              {t.logout}
            </button>
          </div>
        </aside>

        {/* Asosiy kontent */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0 w-full lg:w-auto">
          {/* Header */}
          <header className="h-16 lg:h-20 bg-white dark:bg-[#111113] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 lg:px-10 transition-colors shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
                {navItems.find(i => i.href === pathname)?.label || t.adminTitle}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Til tanlash - global LangProvider bilan sinxronlashadi */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 lg:px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-xs lg:text-sm font-bold text-gray-700 dark:text-gray-300 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 hidden sm:block">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  {lang.toUpperCase()}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {langOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-[#1e1f23] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl w-28 overflow-hidden z-[200]">
                    {(["uz", "ru", "en"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => { setLang(l); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition ${
                          lang === l
                            ? "bg-yellow-400 text-black"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                        }`}
                      >
                        {l === "uz" ? "🇺🇿 UZ" : l === "ru" ? "🇷🇺 RU" : "🇬🇧 EN"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <NotificationBell isAdminPanel={true} />
              <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-gray-200 dark:border-white/10 transition-colors">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-[2px] shrink-0">
                  <div className="w-full h-full bg-white dark:bg-[#111113] rounded-full border-2 border-transparent flex items-center justify-center overflow-hidden">
                    {adminImage ? (
                      <img src={adminImage} alt={adminName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-[#1e1f23] flex items-center justify-center text-gray-900 dark:text-white font-bold text-xs lg:text-sm">
                        {adminName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{adminName}</p>
                  <p className="text-xs text-gray-500">{t.adminRole}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
