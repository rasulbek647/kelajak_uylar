"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useLang } from "./LangProvider";
import { AgentSidebar } from "./AgentSidebar";
import NotificationBell from "./NotificationBell";

const UserAvatar = ({ src, name, className = "w-8 h-8" }: { src: string | null | undefined, name: string | null | undefined, className?: string }) => {
  const [imgState, setImgState] = useState({ currentSrc: src, loaded: false, failed: false });

  if (src !== imgState.currentSrc) {
    setImgState({ currentSrc: src, loaded: false, failed: false });
  }

  const hasImage = !!(src && src !== "null" && !imgState.failed);

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div className={`${className} bg-yellow-400 text-black rounded-full flex items-center justify-center ${hasImage && imgState.loaded ? "hidden" : ""}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[60%] h-[60%]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      {hasImage && (
        <img
          key={src as string}
          src={src as string}
          alt={name || "Profil"}
          className={`absolute inset-0 w-full h-full rounded-full object-cover transition-opacity duration-300 ${imgState.loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgState(prev => ({ ...prev, loaded: true }))}
          onError={() => setImgState(prev => ({ ...prev, failed: true, loaded: false }))}
        />
      )}
    </div>
  );
};

export const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { lang, setLang, t } = useLang();
  
  const [searchText, setSearchText] = useState(searchParams.get("q") || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [agentSidebarOpen, setAgentSidebarOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark";
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("theme");
    }
  };

  // Login va Admin sahifalarida navbarni yashirish — barcha hookdan KEYIN
  if (pathname === "/login" || pathname.startsWith("/admin")) return null;

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchText.trim()) {
      params.set("q", searchText.trim());
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
    setMobileSearchOpen(false);
  };

  const handleLang = (val: "uz" | "ru" | "en") => {
    setLang(val);
    setLangOpen(false);
    router.refresh();
  };

  const langDropdown = (
    <div className="relative">
      <button
        onClick={() => setLangOpen(!langOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition text-xs sm:text-sm font-bold tracking-wide border border-gray-200/80 dark:border-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
        <span suppressHydrationWarning>{lang.toUpperCase()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2.5 h-2.5 ml-0.5 opacity-60">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {langOpen && (
        <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1.5 bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-28 overflow-hidden z-[200] p-1 animate-fadeIn">
          {(["uz", "ru", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => handleLang(l)}
              className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-between ${
                lang === l
                  ? "bg-yellow-400 text-black shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              <span>{l === "uz" ? "O'zbek" : l === "ru" ? "Русский" : "English"}</span>
              <span className="text-[10px] opacity-60 uppercase">{l}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const ProfileMenu = () => {
    return session ? (
      <div className="relative ml-1">
        <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-lg transition">
          <UserAvatar src={session.user?.image} name={session.user?.name} />
        </button>
        {menuOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-[#1e1f23] rounded-2xl shadow-2xl border border-white/5 py-2 z-[9999] overflow-hidden">
          <Link href="/profile" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[15px] font-semibold text-white hover:bg-white/5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {t.profile}
          </Link>
          
          <Link href="/profile/messages" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[15px] font-semibold text-white hover:bg-white/5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {t.messages}
          </Link>

          <div className="flex items-center gap-3 px-4 py-3 text-[15px] font-semibold text-gray-500 dark:text-gray-600 cursor-not-allowed select-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            {t.balance} <span className="ml-auto text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full">{t.comingSoon}</span>
          </div>

          {(session.user as any)?.role === "ADMIN" && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-[15px] font-semibold text-white hover:bg-white/5 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t.adminPanel}
            </Link>
          )}

          <div className="my-1 border-t border-white/5" />
          
          <button
            onClick={() => { setMenuOpen(false); signOut({ callbackUrl: window.location.origin }); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-[15px] font-semibold text-white hover:bg-white/5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {t.logout}
          </button>
        </div>
      )}
    </div>
  ) : (
    <Link href="/login" className="ml-1 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
      <span className="hidden sm:block">{t.login}</span>
    </Link>
  );
  };

  const Logo = () => (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-5 h-5">
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>
      </div>
      <span className="hidden sm:block text-lg font-bold text-gray-900 dark:text-white tracking-tight">KELAJAK UYLAR</span>
    </Link>
  );

  return (
    <>
      <nav className="bg-white dark:bg-[#111113] text-gray-900 dark:text-white sticky top-0 z-50 border-b border-gray-200 dark:border-white/5 transition-colors">
        <div className="px-3 sm:px-6 max-w-screen-xl mx-auto">
          <div className="flex items-center h-[56px] gap-2">
            <Logo />
            
            {/* Desktop: lang + theme */}
            <div className="hidden sm:flex items-center gap-1">
              {langDropdown}
              <button
                onClick={toggleTheme}
                suppressHydrationWarning
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition shrink-0"
                title={isDark ? "Yorug' rejim" : "Qorong'i rejim"}
              >
                {isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.773-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Desktop search */}
            <div className="hidden sm:flex flex-1 max-w-2xl mx-auto">
              <div className="w-full flex items-center bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition rounded-xl border border-gray-200 dark:border-white/10 h-9 overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-3 text-gray-400 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder={lang === "uz" ? "Qidirish..." : lang === "ru" ? "Поиск..." : "Search..."}
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 text-sm px-3 py-2 outline-none"
                />
              </div>
            </div>

            {/* Mobile: search icon + lang + theme */}
            <div className="flex sm:hidden items-center gap-1 ml-auto">
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                title="Qidirish"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
              {langDropdown}
              <button
                onClick={toggleTheme}
                suppressHydrationWarning
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                title={isDark ? "Yorug' rejim" : "Qorong'i rejim"}
              >
                {isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.773-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Right buttons (desktop) */}
            <div className="hidden sm:flex items-center gap-0.5 shrink-0">
              <button 
                onClick={() => setAgentSidebarOpen(true)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition hidden md:flex" 
                title="Agentlar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </button>
              <button 
                onClick={() => {
                  if (!session) setLoginModalOpen(true);
                  else router.push("/favorites");
                }}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition" 
                title="Sevimlilar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
              <Link href="/add-listing" className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold px-4 py-1.5 rounded-full text-sm transition mx-2">
                {t.addListing}
              </Link>
              <NotificationBell />
              <ProfileMenu />
            </div>

            {/* Mobile right: notification + profile */}
            <div className="flex sm:hidden items-center gap-1">
              <NotificationBell />
              <ProfileMenu />
            </div>
          </div>
        </div>

        {/* Mobile search bar - slide down */}
        {mobileSearchOpen && (
          <div className="sm:hidden px-3 pb-3 animate-fadeIn">
            <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 h-11 overflow-hidden shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-3 text-gray-400 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                autoFocus
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder={lang === "uz" ? "Qidirish..." : lang === "ru" ? "Поиск..." : "Search..."}
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 text-sm px-3 py-2 outline-none"
              />
              <button onClick={handleSearch} className="px-4 text-gray-950 dark:text-white bg-yellow-400 hover:bg-yellow-500 font-bold text-xs h-full flex items-center transition">
                OK
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation (Native App Style) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111113]/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-white/10 flex items-center justify-around h-16 px-2 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)]">
        <Link href="/" className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-all ${pathname === "/" ? "text-yellow-500 dark:text-yellow-400 font-bold scale-105" : "text-gray-500 dark:text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill={pathname === "/" ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={pathname === "/" ? 1.5 : 2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-[10px] tracking-tight">{t.home}</span>
        </Link>
        <button
          onClick={() => { if (!session) setLoginModalOpen(true); else router.push("/favorites"); }}
          className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-all ${pathname === "/favorites" ? "text-yellow-500 dark:text-yellow-400 font-bold scale-105" : "text-gray-500 dark:text-gray-400"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill={pathname === "/favorites" ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={pathname === "/favorites" ? 1.5 : 2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span className="text-[10px] tracking-tight">{t.favorites}</span>
        </button>
        <Link href="/add-listing" className="flex flex-col items-center gap-0.5 flex-1 py-1 group">
          <div className="w-12 h-12 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center -mt-6 shadow-lg shadow-yellow-500/30 ring-4 ring-white dark:ring-[#111113] active:scale-95 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.8} stroke="black" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 mt-0.5">{t.addListing.split(" ")[0]}</span>
        </Link>
        <Link href={session ? "/profile/messages" : "/login"} className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-all ${pathname.startsWith("/profile/messages") ? "text-yellow-500 dark:text-yellow-400 font-bold scale-105" : "text-gray-500 dark:text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill={pathname.startsWith("/profile/messages") ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={pathname.startsWith("/profile/messages") ? 1.5 : 2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span className="text-[10px] tracking-tight">{t.messages}</span>
        </Link>
        <Link href={session ? "/profile" : "/login"} className={`flex flex-col items-center gap-0.5 flex-1 py-1 transition-all ${pathname === "/profile" ? "text-yellow-500 dark:text-yellow-400 font-bold scale-105" : "text-gray-500 dark:text-gray-400"}`}>
          {session ? (
            <UserAvatar src={session.user?.image} name={session.user?.name} className="w-5 h-5 rounded-full ring-1 ring-yellow-400/50" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
          <span className="text-[10px] tracking-tight">{t.profile}</span>
        </Link>
      </div>

      <AgentSidebar isOpen={agentSidebarOpen} onClose={() => setAgentSidebarOpen(false)} />
      
      {loginModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative border border-gray-100 dark:border-white/5 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.noAccountTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-[15px] mb-8 leading-relaxed">
              {t.noAccountDesc}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLoginModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-[15px] bg-gray-100 dark:bg-[#2c2d31] hover:bg-gray-200 dark:hover:bg-[#38393e] text-gray-900 dark:text-white transition-colors"
              >
                {t.cancel}
              </button>
              <Link
                href="/login"
                onClick={() => setLoginModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-[15px] bg-yellow-400 hover:bg-yellow-500 text-gray-950 transition-colors text-center"
              >
                {t.login}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
