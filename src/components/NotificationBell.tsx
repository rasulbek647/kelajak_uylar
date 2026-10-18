"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function NotificationBell({ isAdminPanel = false }: { isAdminPanel?: boolean }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [readReportIds, setReadReportIds] = useState<string[]>([]);
  const [welcomeMsg, setWelcomeMsg] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // O'qilgan (ko'rilgan) shikoyatlar ID larini localStorage dan yuklash
  useEffect(() => {
    if (!isAdminPanel) return;
    try {
      const stored = localStorage.getItem("admin_read_reports");
      if (stored) {
        setReadReportIds(JSON.parse(stored));
      }
    } catch (_) {}
  }, [isAdminPanel]);

  // Agar admin Shikoyatlar sahifasiga (/admin/reports) kirsa, barcha shikoyatlar avtomatik "ko'rildi" deb belgilanadi
  useEffect(() => {
    if (isAdminPanel && pathname === "/admin/reports" && reports.length > 0) {
      const allIds = reports.map((r) => r.id);
      const updated = [...new Set([...readReportIds, ...allIds])];
      if (updated.length !== readReportIds.length) {
        setReadReportIds(updated);
        try {
          localStorage.setItem("admin_read_reports", JSON.stringify(updated));
        } catch (_) {}
      }
    }
  }, [pathname, reports, isAdminPanel, readReportIds]);

  // Oyna tashqarisiga bosganda yopish
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Asosiy sayt uchun welcome back logikasi (admin panelda xalaqit bermasligi uchun faqat asosiy saytda)
  useEffect(() => {
    if (!session || isAdminPanel) return;
    const lastVisitStr = localStorage.getItem("lastVisit");
    const now = new Date().getTime();
    
    if (lastVisitStr) {
      const lastVisit = parseInt(lastVisitStr, 10);
      const diffDays = (now - lastVisit) / (1000 * 60 * 60 * 24);
      if (diffDays >= 3) {
        setWelcomeMsg("🎉 Biz sizni kutib qoldik! Qaytganingizdan xursandmiz, bugun siz uchun ajoyib takliflarimiz bor!");
      }
    } else {
      setWelcomeMsg("👋 Xush kelibsiz! Kelajak Uylar bilan eng yaxshi uylarni toping.");
    }
    
    localStorage.setItem("lastVisit", now.toString());
  }, [session, isAdminPanel]);

  // Yangi xabarlarni tekshirish (har 10 soniyada)
  useEffect(() => {
    if (!session) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setUnreadMessages(data.unreadMessages || []);
          // Shikoyatlar faqat admin panelda ko'rsatiladi
          if (isAdminPanel && Array.isArray(data.reports)) {
            setReports(data.reports);
          }
        }
      } catch (e) {}
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [session, isAdminPanel]);

  if (!session) return null;

  // Faqat o'qilmagan (hali ko'rilmagan) shikoyatlarni hisoblash
  const unreadReports = isAdminPanel ? reports.filter((r) => !readReportIds.includes(r.id)) : [];
  const unreadCount = unreadMessages.length + unreadReports.length;
  const hasNotifications = unreadCount > 0 || (welcomeMsg !== null && !isAdminPanel) || (isAdminPanel && reports.length > 0);

  const handleMessageClick = (msg: any) => {
    setOpen(false);
    setUnreadMessages(prev => prev.filter(m => m.id !== msg.id));
    router.push(`/profile/messages?recipientId=${msg.senderId}&listingId=${msg.conversation?.listingId || ""}`);
  };

  // Shikoyat bosilganda uni darhol "ko'rildi" deb belgilash (qizil nuqtacha o'chadi)
  const handleReportClick = (report: any) => {
    setOpen(false);
    const updated = [...new Set([...readReportIds, report.id])];
    setReadReportIds(updated);
    try {
      localStorage.setItem("admin_read_reports", JSON.stringify(updated));
    } catch (_) {}
    router.push("/admin/reports");
  };

  // Barchasini o'qilgan deb belgilash — barcha qizil nuqtalar olinadi
  const handleMarkAllReportsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allIds = reports.map((r) => r.id);
    setReadReportIds(allIds);
    try {
      localStorage.setItem("admin_read_reports", JSON.stringify(allIds));
    } catch (_) {}
  };

  const handleClearWelcome = () => {
    setWelcomeMsg(null);
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("uz-UZ", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (_) {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition" 
        title="Xabarnomalar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111113]"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1a1b1e] rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-white/5 overflow-hidden z-[9999]">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">
              {isAdminPanel ? "Admin xabarnomalar" : "Xabarnomalar"}
            </h3>
            {unreadCount > 0 ? (
              <span className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
                {unreadCount} ta yangi
              </span>
            ) : null}
          </div>

          <div className="max-h-[440px] overflow-y-auto p-2">
            {!hasNotifications || (unreadCount === 0 && (!isAdminPanel || reports.length === 0)) ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                Yangi xabarnomalar yo&apos;q
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {/* Welcome Back (faqat asosiy saytda) */}
                {!isAdminPanel && welcomeMsg && (
                  <div className="p-3 rounded-xl bg-yellow-400/10 hover:bg-yellow-400/20 transition cursor-default relative pr-8 group">
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                      {welcomeMsg}
                    </p>
                    <button onClick={handleClearWelcome} className="absolute top-3 right-2 p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}

                {/* Shikoyatlar (FAQAT ADMIN PANELDA) */}
                {isAdminPanel && reports.length > 0 && (
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <span>Shikoyatlar ({reports.length})</span>
                      {unreadReports.length > 0 ? (
                        <button
                          onClick={handleMarkAllReportsRead}
                          className="text-[11px] text-yellow-500 hover:text-yellow-600 transition capitalize font-semibold"
                        >
                          Barchasini o&apos;qilgan qilish
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-500 font-medium lowercase">barchasi ko&apos;rilgan</span>
                      )}
                    </div>

                    {reports.map((report) => {
                      const isUnread = !readReportIds.includes(report.id);
                      return (
                        <div
                          key={report.id}
                          onClick={() => handleReportClick(report)}
                          className={`p-3 rounded-xl transition cursor-pointer flex gap-3 items-start border ${
                            isUnread
                              ? "bg-red-500/10 dark:bg-red-950/30 border-red-500/30 shadow-sm"
                              : "bg-transparent hover:bg-gray-100/70 dark:hover:bg-white/5 border-transparent opacity-60"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isUnread 
                              ? "bg-red-500 text-white shadow-sm" 
                              : "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`text-[11px] font-bold truncate ${isUnread ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
                                {isUnread ? "🔴 Yangi shikoyat" : "Ko'rilgan shikoyat"}: {report.reason}
                              </span>
                              <span className="text-[10px] text-gray-400 shrink-0">
                                {formatTime(report.createdAt)}
                              </span>
                            </div>
                            <p className={`text-[12px] truncate ${isUnread ? "font-bold text-gray-900 dark:text-white" : "font-normal text-gray-600 dark:text-gray-300"}`}>
                              🏠 {report.listingTitle}
                            </p>
                            {report.note && (
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {report.note}
                              </p>
                            )}
                          </div>
                          {/* QIZIL NUQTA: Faqat ko'rilmagan (unread) bo'lsa chiqadi, ko'rilganidan OLIB TASHLANADI */}
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5 animate-pulse" />
                          )}
                        </div>
                      );
                    })}

                    <Link
                      href="/admin/reports"
                      onClick={() => setOpen(false)}
                      className="text-center py-2 text-xs font-bold text-yellow-500 hover:text-yellow-600 hover:underline transition"
                    >
                      Barcha shikoyatlar sahifasiga o&apos;tish →
                    </Link>
                  </div>
                )}

                {/* Foydalanuvchi xabarlari */}
                {unreadMessages.map((msg, idx) => (
                  <div key={idx} onClick={() => handleMessageClick(msg)} className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-0.5 truncate">
                        <strong className="text-gray-900 dark:text-white">{msg.sender.name}</strong> dan yangi xabar
                      </p>
                      {msg.listingTitle && (
                        <p className="text-[11px] font-bold text-yellow-500 truncate mb-1">
                          🏠 {msg.listingTitle}
                        </p>
                      )}
                      <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
