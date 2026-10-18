"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";

type User = {
  id: string;
  name: string;
  phone: string;
  role: string;
  badge: string;
  region: string | null;
  avatar: string | null;
  createdAt: string;
  _count: { listings: number };
};

const BADGES = [
  { value: "NONE",     label: "Belgi yo'q",       starColor: "",               dot: "bg-gray-400",   color: "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400" },
  { value: "STAR",     label: "⭐ Top Rieltor",    starColor: "text-yellow-400", dot: "bg-yellow-400", color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-400" },
  { value: "VERIFIED", label: "✅ Tasdiqlangan",   starColor: "text-blue-500",   dot: "bg-blue-500",   color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  { value: "GOLD",     label: "🥇 Oltin",          starColor: "text-orange-400", dot: "bg-amber-500",  color: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400" },
  { value: "ELITE",    label: "🔴 Elite",           starColor: "text-yellow-500",    dot: "bg-yellow-500",    color: "bg-yellow-50 text-yellow-500 dark:bg-yellow-500/10 dark:text-red-400" },
];

function StarIcon({ color, size = "w-3.5 h-3.5" }: { color: string; size?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${size} ${color} shrink-0`}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function BadgePill({ badge }: { badge: string }) {
  const cfg = BADGES.find(b => b.value === badge) ?? BADGES[0];
  if (badge === "NONE") return <span className="text-xs text-gray-400">—</span>;
  const labelText = cfg.label.replace(/^[^ ]+ /, "");
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
      <StarIcon color={cfg.starColor} size="w-3 h-3" />
      {labelText}
    </span>
  );
}

export default function AdminUsersClient({ initialUsers }: { initialUsers: User[] }) {
  const { t, lang } = useLang();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [badgeMenuId, setBadgeMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, bottom: 0, left: 0, isUp: false });
  const [roleMenuId, setRoleMenuId] = useState<string | null>(null);
  const [roleMenuPos, setRoleMenuPos] = useState({ top: 0, bottom: 0, left: 0, isUp: false });
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  // Barcha pending o'zgarishlar
  const [pending, setPending] = useState<Record<string, { role?: string; badge?: string }>>({});

  const hasPending = Object.keys(pending).length > 0;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = users
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
    )
    .sort((a, b) => b._count.listings - a._count.listings);

  const handleRoleChange = (userId: string, newRole: string) => {
    setRoleMenuId(null);
    const original = users.find(u => u.id === userId);
    setPending(prev => {
      const updated = { ...prev };
      const existing = updated[userId] ?? {};
      existing.role = newRole;
      if (newRole === original?.role && !existing.badge) {
        delete updated[userId];
      } else if (newRole === original?.role) {
        const { role, ...rest } = existing;
        updated[userId] = rest;
      } else {
        updated[userId] = existing;
      }
      return updated;
    });
  };

  const handleBadgeChange = (userId: string, newBadge: string) => {
    setBadgeMenuId(null);
    const original = users.find(u => u.id === userId);
    setPending(prev => {
      const updated = { ...prev };
      const existing = updated[userId] ?? {};
      existing.badge = newBadge;
      if (newBadge === original?.badge && !existing.role) {
        delete updated[userId];
      } else if (newBadge === original?.badge) {
        const { badge, ...rest } = existing;
        updated[userId] = rest;
      } else {
        updated[userId] = existing;
      }
      return updated;
    });
  };

  const handleSaveAll = async () => {
    if (!hasPending) return;
    setSaving(true);
    try {
      const results = await Promise.all(
        Object.entries(pending).map(([userId, changes]) =>
          fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, ...changes }),
          }).then(r => ({ userId, changes, ok: r.ok }))
        )
      );

      const failed = results.filter(r => !r.ok);
      if (failed.length === 0) {
        setUsers(prev => prev.map(u => {
          const change = pending[u.id];
          return change ? { ...u, ...change } : u;
        }));
        setPending({});
        showToast(t.savedSuccess || "Saqlandi!");
      } else {
        showToast(`Xatolik`, "error");
      }
    } catch {
      showToast("Xatolik", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAll = () => {
    setPending({});
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    setDeleteLoadingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast(t.delete || "O'chirildi");
      } else {
        showToast("Xatolik", "error");
      }
    } catch {
      showToast("Xatolik", "error");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const totalUsers = users.length;
  const admins = users.filter(u => u.role === "ADMIN").length;
  const verified = users.filter(u => u.badge === "VERIFIED").length;
  const topRieltors = users.filter(u => ["STAR","GOLD","ELITE"].includes(u.badge)).length;

  // Tarjimalar helperi
  const getBadgeLabel = (val: string) => {
    if (val === "NONE") return lang === "uz" ? "➖ Belgi yo'q" : lang === "ru" ? "➖ Без значка" : "➖ No badge";
    const b = BADGES.find(x => x.value === val);
    return b ? b.label : val;
  };

  return (
    <div className="p-6 space-y-6" onClick={() => { setBadgeMenuId(null); setRoleMenuId(null); }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Sarlavha + Saqlash tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.usersTitle}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {lang === "uz" ? `Jami ${totalUsers} ta` : lang === "ru" ? `Всего ${totalUsers}` : `Total ${totalUsers}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasPending && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
              <span className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold bg-yellow-50 dark:bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-400/20">
                {Object.keys(pending).length}
              </span>
              <button
                onClick={handleCancelAll}
                disabled={saving}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-semibold transition"
              >
                X
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-yellow-400/25"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {t.save}
              </button>
            </div>
          )}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search + "..."}
            className="w-full sm:w-60 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t.totalUsers, value: totalUsers, emoji: "👥", from: "from-blue-500/10",   border: "border-blue-500/20" },
          { label: "Admins",      value: admins,     emoji: "🛡️", from: "from-purple-500/10", border: "border-purple-500/20" },
          { label: "Verified",    value: verified,   emoji: "✅", from: "from-green-500/10",  border: "border-green-500/20" },
          { label: "Top",         value: topRieltors,emoji: "⭐", from: "from-yellow-500/10", border: "border-yellow-500/20" },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.from} to-transparent border ${s.border} rounded-2xl p-4`}>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{s.emoji} {s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badge izohlar */}
      <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
          {lang === "uz" ? "Badge tizimi" : lang === "ru" ? "Система значков" : "Badge System"}
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            {
              badge: "STAR",
              desc: lang === "uz" ? "10+ e'lon (avtomatik yoki qo'lda)" : lang === "ru" ? "10+ объявлений (авто или вручную)" : "10+ listings (auto or manual)"
            },
            {
              badge: "VERIFIED",
              desc: lang === "uz" ? "Tasdiqlangan rieltor (faqat admin beradi)" : lang === "ru" ? "Проверенный риэлтор (только admin)" : "Verified realtor (admin only)"
            },
            {
              badge: "GOLD",
              desc: lang === "uz" ? "50+ e'lon, ishonchli (qo'lda beriladi)" : lang === "ru" ? "50+ объявлений, надёжный (вручную)" : "50+ listings, trusted (manual)"
            },
            {
              badge: "ELITE",
              desc: lang === "uz" ? "100+ e'lon, eng yuqori daraja" : lang === "ru" ? "100+ объявлений, высший уровень" : "100+ listings, top tier"
            },
          ].map(b => {
            const cfg = BADGES.find(x => x.value === b.badge)!;
            return (
              <div key={b.badge} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                  <StarIcon color={cfg.starColor} size="w-3 h-3" />
                  {cfg.label.replace(/^[^ ]+ /, "")}
                </span>
                <span className="text-gray-400">—</span>
                <span>{b.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 text-left text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-4">{t.user}</th>
                <th className="px-5 py-4">{t.phone}</th>
                <th className="px-5 py-4 text-center">{t.listingsNav}</th>
                <th className="px-5 py-4 text-center">Badge</th>
                <th className="px-5 py-4 text-center">{t.role}</th>
                <th className="px-5 py-4 text-center">{t.delete}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((user) => {
                const changes = pending[user.id];
                const currentRole  = changes?.role  ?? user.role;
                const currentBadge = changes?.badge ?? user.badge;
                const isChanged = !!changes && (changes.role !== undefined || changes.badge !== undefined);

                return (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      isChanged
                        ? "bg-red-50/60 dark:bg-yellow-400/5"
                        : "hover:bg-gray-50 dark:hover:bg-white/3"
                    }`}
                  >
                    {/* Foydalanuvchi */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm overflow-hidden">
                            {user.avatar
                              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              : user.name.charAt(0).toUpperCase()
                            }
                          </div>
                          {currentBadge !== "NONE" && (
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${BADGES.find(b => b.value === currentBadge)?.dot ?? "bg-gray-400"}`} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                          <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString("ru-RU")}</p>
                        </div>
                        {isChanged && (
                          <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/15 px-1.5 py-0.5 rounded-md ml-1">
                            o'zgartirildi
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Telefon */}
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{user.phone}</td>

                    {/* E'lonlar soni */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block font-bold text-sm px-2.5 py-0.5 rounded-full ${
                        user._count.listings >= 100 ? "bg-yellow-100 text-yellow-500 dark:bg-yellow-500/10 dark:text-red-400" :
                        user._count.listings >= 50  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                        user._count.listings >= 10  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-500" :
                        "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                      }`}>
                        {user._count.listings}
                      </span>
                    </td>

                    {/* Badge dropdown (Custom with Smart Fixed Position) */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (badgeMenuId === user.id) {
                            setBadgeMenuId(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const menuHeight = 240; // Menyu balandligi taxminan 240px

                            if (spaceBelow < menuHeight) {
                              // Pastda joy kam, tepaga qarab ochiladi
                              setMenuPos({ 
                                top: 0, 
                                bottom: window.innerHeight - rect.top + 4, 
                                left: rect.left + rect.width / 2, 
                                isUp: true 
                              });
                            } else {
                              // Pastda joy bor, pastga qarab ochiladi
                              setMenuPos({ 
                                top: rect.bottom + 4, 
                                bottom: 0, 
                                left: rect.left + rect.width / 2, 
                                isUp: false 
                              });
                            }
                            setBadgeMenuId(user.id);
                          }
                        }}
                        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border transition w-full ${
                          changes?.badge
                            ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-400/10"
                            : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10"
                        }`}
                      >
                        <BadgePill badge={currentBadge} />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-gray-400 ml-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {badgeMenuId === user.id && (
                        <div
                          style={{ 
                            position: 'fixed', 
                            top: menuPos.isUp ? 'auto' : menuPos.top, 
                            bottom: menuPos.isUp ? menuPos.bottom : 'auto', 
                            left: menuPos.left, 
                            transform: 'translateX(-50%)', 
                            zIndex: 99999 
                          }}
                          className={`${menuPos.isUp ? 'mb-1' : 'mt-1'} bg-white dark:bg-[#1e1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 w-52`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-[10px] font-bold text-gray-400 uppercase px-4 py-1.5 tracking-wider text-left">
                            {lang === "uz" ? "Badge tanlang" : lang === "ru" ? "Выберите значок" : "Choose badge"}
                          </p>
                          {BADGES.map(b => (
                            <button
                              key={b.value}
                              onClick={() => handleBadgeChange(user.id, b.value)}
                              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition ${currentBadge === b.value ? "bg-yellow-50 dark:bg-yellow-400/10" : ""}`}
                            >
                              {b.value === "NONE" ? (
                                <div className={`w-3 h-3 rounded-full shrink-0 ${b.dot}`} />
                              ) : (
                                <StarIcon color={b.starColor} size="w-3.5 h-3.5" />
                              )}
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {b.value === "NONE"
                                  ? (lang === "uz" ? "Yo'q" : lang === "ru" ? "Нет" : "None")
                                  : b.label.replace(/^[^ ]+ /, "")}
                              </span>
                              {currentBadge === b.value && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 ml-auto text-yellow-500">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Rol */}
                    <td className="px-5 py-4 text-center">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (roleMenuId === user.id) {
                              setRoleMenuId(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const spaceBelow = window.innerHeight - rect.bottom;
                              if (spaceBelow < 120) {
                                setRoleMenuPos({ 
                                  top: 0, 
                                  bottom: window.innerHeight - rect.top + 4, 
                                  left: rect.left + rect.width / 2, 
                                  isUp: true 
                                });
                              } else {
                                setRoleMenuPos({ 
                                  top: rect.bottom + 4, 
                                  bottom: 0, 
                                  left: rect.left + rect.width / 2, 
                                  isUp: false 
                                });
                              }
                              setBadgeMenuId(null);
                              setRoleMenuId(user.id);
                            }
                          }}
                          className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                            changes?.role
                              ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400"
                              : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10"
                          }`}
                        >
                          <span>{currentRole === "ADMIN" ? (lang === "uz" ? "Admin" : lang === "ru" ? "Администратор" : "Admin") : (lang === "uz" ? "Foydalanuvchi" : lang === "ru" ? "Пользователь" : "User")}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-gray-400 ml-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>

                        {roleMenuId === user.id && (
                          <div
                            style={{ 
                              position: 'fixed', 
                              top: roleMenuPos.isUp ? 'auto' : roleMenuPos.top, 
                              bottom: roleMenuPos.isUp ? roleMenuPos.bottom : 'auto', 
                              left: roleMenuPos.left, 
                              transform: 'translateX(-50%)', 
                              zIndex: 99999 
                            }}
                            className={`${roleMenuPos.isUp ? 'mb-1' : 'mt-1'} bg-white dark:bg-[#1e1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 w-44`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="text-[10px] font-bold text-gray-400 uppercase px-4 py-1.5 tracking-wider text-left">
                              {lang === "uz" ? "Rolni tanlang" : lang === "ru" ? "Выберите роль" : "Choose role"}
                            </p>
                            {[
                              { value: "USER", label: lang === "uz" ? "Foydalanuvchi" : lang === "ru" ? "Пользователь" : "User" },
                              { value: "ADMIN", label: lang === "uz" ? "Admin" : lang === "ru" ? "Администратор" : "Admin" }
                            ].map((r) => (
                              <button
                                key={r.value}
                                type="button"
                                onClick={() => handleRoleChange(user.id, r.value)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-semibold transition ${
                                  currentRole === r.value
                                    ? "bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 font-bold"
                                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                                }`}
                              >
                                <span>{r.label}</span>
                                {currentRole === r.value && (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-yellow-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* O'chirish */}
                    <td className="px-5 py-4 text-center">
                      {deleteLoadingId === user.id ? (
                        <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="w-8 h-8 rounded-lg text-red-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 hover:text-yellow-400 flex items-center justify-center transition mx-auto"
                          title="O'chirish"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-medium">Foydalanuvchi topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
