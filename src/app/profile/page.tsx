"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { useLang } from "@/components/LangProvider";

// ─── Chiroyli Loading animatsiyasi ─────────────────────────────
function FancyLoader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex items-center justify-center">
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Markaziy doira */}
        <div className="w-16 h-16 rounded-full bg-white dark:bg-[#1e1f23] flex items-center justify-center z-10 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#facc15" className="w-8 h-8">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
        </div>
        {/* Aylanadigan nuqtalar */}
        {[0,1,2,3,4,5,6,7].map((i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-yellow-400"
            style={{
              top: `${50 - 42 * Math.cos((i * Math.PI * 2) / 8)}%`,
              left: `${50 + 42 * Math.sin((i * Math.PI * 2) / 8)}%`,
              transform: "translate(-50%, -50%)",
              animation: `orbitPulse 1.6s infinite ease-in-out ${i * 0.2}s`,
            }}
          />
        ))}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes orbitPulse {
            0%, 100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
            50% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}} />
      </div>
    </div>
  );
}

// ─── Muvaffaqiyat Modali ─────────────────────────────
function SuccessModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e1f23] rounded-3xl p-8 w-[340px] shadow-2xl flex flex-col items-center gap-4">
        {/* Animatsiyali doira va icon */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#2a2b30] flex items-center justify-center z-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#facc15" className="w-10 h-10">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z" clipRule="evenodd" />
            </svg>
          </div>
          {[0,1,2,3,4,5].map((i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full bg-yellow-400"
              style={{
                top: `${50 - 45 * Math.cos((i * Math.PI * 2) / 6)}%`,
                left: `${50 + 45 * Math.sin((i * Math.PI * 2) / 6)}%`,
                transform: "translate(-50%, -50%)",
                animation: `orbitPulse 1.4s infinite ease-in-out ${i * 0.23}s`,
              }}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.done}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">{t.profileUpdated}</p>
        <button
          onClick={onClose}
          className="w-full mt-2 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 rounded-full font-bold text-[15px] transition-colors shadow-md"
        >
          {t.good}
        </button>
      </div>
    </div>
  );
}

// ─── Ulashish Modali ─────────────────────────────
function ShareModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const { t, lang } = useLang();
  const [copied, setCopied] = useState(false);
  
  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareOptions = [
    { label: "Telegram", color: "#229ED9", href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(name)}`, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/></svg>
    )},
    { label: "WhatsApp", color: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(name + " " + url)}`, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
    )},
    { label: "Facebook", color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg>
    )},
    { label: "Twitter/X", color: "#000000", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(name)}`, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg>
    )},
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1e1f23] rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-gray-900 dark:text-white font-bold text-lg">{t.share}</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Havola */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#111113] rounded-2xl px-4 py-3 mb-5 border border-gray-200 dark:border-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
          <span className="text-gray-500 dark:text-gray-400 text-xs truncate flex-1">{url}</span>
          <button onClick={copyLink} className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition ${copied ? "bg-green-500 text-white" : "bg-yellow-400 text-black hover:bg-yellow-500"}`}>
            {copied ? (lang === 'ru' ? "Скопировано!" : lang === 'en' ? "Copied!" : "Nusxalandi!") : (lang === 'ru' ? "Копировать" : lang === 'en' ? "Copy" : "Nusxalash")}
          </button>
        </div>

        {/* Ijtimoiy tarmoqlar */}
        <p className="text-gray-500 text-xs mb-3">{lang === 'ru' ? "Поделиться через" : lang === 'en' ? "Share via" : "Orqali ulashish"}</p>
        <div className="grid grid-cols-4 gap-3">
          {shareOptions.map(opt => (
            <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: opt.color }}>
                {opt.icon}
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-[10px] text-center">{opt.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar menu ─────────────────────────────
function SidebarItem({ icon, label, active, href, onClick }: { icon: React.ReactNode; label: string; active?: boolean; href?: string; onClick?: () => void }) {
  const cls = `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer w-full ${
    active ? "bg-yellow-400 text-black shadow-sm" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2b30] hover:text-gray-900 dark:hover:text-white"
  }`;
  if (href) return <Link href={href} className={cls}>{icon}{label}</Link>;
  return <button className={cls} onClick={onClick}>{icon}{label}</button>;
}

// ─── Ana sahifa ─────────────────────────────
export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useLang();

  const [activeTab, setActiveTab] = useState<"profile" | "edit" | "sessions">(
    () => (searchParams.get("tab") === "sessions" ? "sessions" : "profile")
  );
  const [profileSubTab, setProfileSubTab] = useState<"elonlar" | "xaridor" | "tanlanganlar">("xaridor");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [phone, setPhone] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isRealtor, setIsRealtor] = useState(false);
  const [showPhone, setShowPhone] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");

  const [stats, setStats] = useState({ listingsCount: 0, viewsCount: 0, callsCount: 0, salesCount: 0 });
  const [listings, setListings] = useState<any[]>([]);

  const [deviceSessions, setDeviceSessions] = useState<any[]>([]);
  const [currentToken, setCurrentToken] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchSessions = async () => {
    try {
      const r = await fetch("/api/profile/sessions", { cache: "no-store" });
      const data = await r.json();
      console.log("[fetchSessions] response:", data);
      if (data.sessions) {
        setDeviceSessions(data.sessions);
        setCurrentToken(data.currentToken);
      }
    } catch(e) {
      console.error("[fetchSessions] error:", e);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setUserId(data.user.id || "");
            setName(data.user.name || "");
            setRegion(data.user.region || "");
            setPhone(data.user.phone || "");
            setAvatar(data.user.avatar || "");
            setIsRealtor(data.user.isRealtor || false);
            setShowPhone(data.user.showPhone ?? true);
            if (data.user.createdAt)
              setJoinedAt(new Date(data.user.createdAt).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" }));
            
            setListings(data.listings || []);
            if (data.stats) setStats(data.stats);
          } else {
            setName(data.name || "");
          }
        });
        
      fetchSessions();
    }
  }, [status, router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setAvatar(data.url);
      }
    } catch { setError(lang === "ru" ? "Ошибка при загрузке фото" : lang === "en" ? "Error uploading image" : "Rasm yuklashda xatolik"); }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, region, avatar, isRealtor, showPhone }),
      });
      if (res.ok) {
        setShowSuccess(true);
        // NextAuth sessiyasini darhol yangilaymiz — foydalanuvchi chiqib-kirishiga hojat yo'q
        await update({ image: avatar || null, name });
      }
      else { const d = await res.json(); setError(d.message || "Xatolik"); }
    } catch { setError(lang === "ru" ? "Ошибка сети" : lang === "en" ? "Network error" : "Tarmoq xatosi"); }
    setSaving(false);
  };

  const handleDeleteListing = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== id));
        setStats(prev => ({ ...prev, listingsCount: Math.max(0, prev.listingsCount - 1) }));
      } else {
        alert(lang === "ru" ? "Ошибка при удалении" : lang === "en" ? "Error deleting" : "O'chirishda xatolik yuz berdi");
      }
    } catch (err) {
      alert(lang === "ru" ? "Ошибка сети" : lang === "en" ? "Network error" : "Tarmoq xatosi");
    }
  };

  if (status === "loading") return <FancyLoader />;

  const username = (name || phone || (lang === "ru" ? "Пользователь" : lang === "en" ? "User" : "Foydalanuvchi")).toLowerCase().replace(/\s+/g, "_");
  
  // Barqaror 6-xonali ID generatsiya qilish
  const generateStableId = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 900000) + 100000;
  };
  const stableId = generateStableId((session?.user as any)?.id || phone || "joymee_user");
  
  const shareUrl = typeof window !== "undefined" && userId ? `${window.location.origin}/user/${userId}` : "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex flex-col md:flex-row pb-20 md:pb-0">
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
      {showShare && <ShareModal url={shareUrl} name={name} onClose={() => setShowShare(false)} />}

      {/* ── Chap Sidebar (Mobile uchun bottom navigation) ── */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 bg-gray-50 dark:bg-[#111113] border-r border-gray-200 dark:border-white/5 py-6 px-5 gap-1">
        <SidebarItem
          active={activeTab === "profile" || activeTab === "edit"}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
          label={t.profile}
          onClick={() => setActiveTab("profile")}
        />
        <SidebarItem
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
          label={t.balance}
          href="#"
        />
        <SidebarItem
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>}
          label={t.messages}
          href="/profile/messages"
        />
        <SidebarItem
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>}
          label={t.confirmProfile}
          href="#"
        />
        <SidebarItem
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
          label={t.activeSessions}
          active={activeTab === "sessions"}
          onClick={() => setActiveTab("sessions")}
        />

        <div className="mt-auto">
          <SidebarItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>}
            label={t.logout}
            onClick={() => signOut({ callbackUrl: window.location.origin })}
          />
        </div>
      </aside>

      {/* ── Asosiy kontent ── */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "profile" ? (
          // ── Profil ko'rinishi ──
          <div className="p-4 md:p-6 max-w-5xl">
            {/* Avatar + Ism + Tugmalar */}
            <div className="flex items-start gap-4 mb-8 flex-wrap">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400 shrink-0">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black text-2xl font-bold">
                    {name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-gray-900 dark:text-white text-xl md:text-2xl font-bold truncate">{username}</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30">
                    {t.verified}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">ID: {stableId}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-semibold">{name}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
                <button 
                  onClick={() => setShowShare(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1e1f23] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold hover:bg-gray-100 dark:hover:bg-[#2a2b30] border border-gray-200 dark:border-white/5 transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                  {t.share}
                </button>
                <button
                  onClick={() => setActiveTab("edit")}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs sm:text-sm font-bold transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                  {t.editProfile}
                </button>
              </div>
            </div>

            {/* Statistika */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                [stats.listingsCount.toString(), t.listingsNav], 
                [stats.viewsCount.toString(), lang === "ru" ? "Просмотры" : lang === "en" ? "Views" : "Ko'rishlar"], 
                [stats.callsCount.toString(), lang === "ru" ? "Звонки" : lang === "en" ? "Calls" : "Qo'ng'iroqlar"], 
                [stats.salesCount.toString(), lang === "ru" ? "Продажи" : lang === "en" ? "Sales" : "Sotuvlar"]
              ].map(([val, lbl]) => (
                <div key={lbl} className="bg-white dark:bg-[#1e1f23] rounded-2xl p-4 text-center md:text-left">
                  <p className="text-gray-900 dark:text-white text-2xl font-bold">{val}</p>
                  <p className="text-gray-500 text-sm">{lbl}</p>
                </div>
              ))}
            </div>

            {/* Tablar */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-white/5 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex gap-2 min-w-max">
                {[
                  { id: "elonlar", label: t.listingsNav, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" /></svg> },
                  { id: "xaridor", label: t.buyer, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg> },
                  { id: "tanlanganlar", label: t.favoritesTab, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setProfileSubTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-4 md:px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    profileSubTab === tab.id ? "border-white text-gray-900 dark:text-white" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
              </div>
            </div>

            {/* Tab kontent */}
            {profileSubTab === "elonlar" && (
              listings.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-[#1e1f23] flex items-center justify-center z-10 shadow-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#facc15" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
                      </svg>
                    </div>
                    {[0,1,2,3,4,5,6,7].map((i) => (
                      <div key={i} className="absolute rounded-full bg-yellow-400"
                        style={{
                          width: i % 2 === 0 ? "12px" : "7px",
                          height: i % 2 === 0 ? "12px" : "7px",
                          top: `${50 - 48 * Math.cos((i * Math.PI * 2) / 8)}%`,
                          left: `${50 + 48 * Math.sin((i * Math.PI * 2) / 8)}%`,
                          transform: "translate(-50%, -50%)",
                          animation: `tabOrbit 1.8s infinite ease-in-out ${i * 0.22}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-900 dark:text-white font-semibold text-lg mt-2">
                    {lang === "ru" ? "У вас нет объявлений" : lang === "en" ? "You have no listings" : "Sizda e'lonlar yo'q"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                  {listings.map(l => (
                    <ListingCard
                      key={l.id}
                      id={l.id}
                      title={l.title}
                      price={l.price}
                      currency={l.currency}
                      location={l.location}
                      rooms={l.rooms}
                      area={l.area}
                      imageUrl={l.images?.[0]?.url || "https://via.placeholder.com/800x600?text=Rasm+yo%27q"}
                      onDelete={handleDeleteListing}
                    />
                  ))}
                </div>
              )
            )}

            {profileSubTab === "xaridor" && (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-[#1e1f23] flex items-center justify-center z-10 shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#facc15" className="w-12 h-12">
                      <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507C2.28 19.482 3.105 20.25 4.05 20.25H4.5c.952 0 1.8-.694 1.8-1.652a.75.75 0 01.75-.75h.014c.402 0 .8.07 1.179.207l3.114 1.04a4.501 4.501 0 001.423.23H17.5c1.026 0 1.945-.694 2.054-1.715a11.959 11.959 0 00.092-1.501c0-.656-.057-1.3-.166-1.926a.75.75 0 00-.626-.625A4.498 4.498 0 0117.5 15h-3.126c-.573 0-1.077-.227-1.444-.596a4.498 4.498 0 01-1.063-1.74 9.04 9.04 0 00-2.5-3.913c-.346-.3-.752-.521-1.165-.6a.75.75 0 01-.558-.736 2.247 2.247 0 01.723-1.638 2.25 2.25 0 013.173.138l.26.28c.19.204.457.313.733.313h.014c.401 0 .8-.07 1.179-.207l1.04-.347a4.5 4.5 0 011.423-.23 4.5 4.5 0 014.5 4.5v.015a.75.75 0 01-.748.75c-.966 0-1.889.344-2.613.957a.75.75 0 01-1.005-.026A6.998 6.998 0 0012.75 9.75a6.998 6.998 0 00-4.887 2.003.75.75 0 01-1.005.026A3.996 3.996 0 004.245 10.5a.75.75 0 01-.748-.75v-.015a4.5 4.5 0 011.834-3.658z" />
                    </svg>
                  </div>
                  {[0,1,2,3,4,5,6,7].map((i) => (
                    <div key={i} className="absolute rounded-full bg-yellow-400"
                      style={{
                        width: i % 2 === 0 ? "12px" : "7px",
                        height: i % 2 === 0 ? "12px" : "7px",
                        top: `${50 - 48 * Math.cos((i * Math.PI * 2) / 8)}%`,
                        left: `${50 + 48 * Math.sin((i * Math.PI * 2) / 8)}%`,
                        transform: "translate(-50%, -50%)",
                        animation: `tabOrbit 1.8s infinite ease-in-out ${i * 0.22}s`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-gray-900 dark:text-white font-semibold text-lg mt-2">
                  {lang === "ru" ? "У вас нет объявлений" : lang === "en" ? "You have no listings" : "Sizda e'lonlar yo'q"}
                </p>
              </div>
            )}

            {profileSubTab === "tanlanganlar" && (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-[#1e1f23] flex items-center justify-center z-10 shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#facc15" className="w-12 h-12">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </div>
                  {[0,1,2,3,4,5,6,7].map((i) => (
                    <div key={i} className="absolute rounded-full bg-yellow-400"
                      style={{
                        width: i % 2 === 0 ? "12px" : "7px",
                        height: i % 2 === 0 ? "12px" : "7px",
                        top: `${50 - 48 * Math.cos((i * Math.PI * 2) / 8)}%`,
                        left: `${50 + 48 * Math.sin((i * Math.PI * 2) / 8)}%`,
                        transform: "translate(-50%, -50%)",
                        animation: `tabOrbit 1.8s infinite ease-in-out ${i * 0.22}s`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-gray-900 dark:text-white font-semibold text-lg mt-2">{t.noFavorites}</p>
              </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes tabOrbit {
                0%, 100% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.25; }
                50% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              }
            `}} />
            
            {/* Mobile menu (Sidebar links for mobile) */}
            <div className="md:hidden mt-10 mb-10 bg-white dark:bg-[#1e1f23] rounded-2xl overflow-hidden">
              <Link href="/profile/messages" className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                  <span className="font-semibold text-sm">{t.messages}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </Link>
              <button className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                  <span className="font-semibold text-sm">{t.balance}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
              <button className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>
                  <span className="font-semibold text-sm">{t.confirmProfile}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
              <button onClick={() => setActiveTab("sessions")} className="w-full flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  <span className="font-semibold text-sm">{t.activeSessions}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
              <button onClick={() => signOut({ callbackUrl: window.location.origin })} className="w-full flex items-center justify-between p-4 text-red-400 hover:bg-red-400/10 transition">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                  <span className="font-semibold text-sm">{t.logout}</span>
                </div>
              </button>
            </div>
          </div>
        ) : activeTab === "sessions" ? null : (
          // ── Profil tahrirlash ──
          <div className="p-6 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setActiveTab("profile")} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              </button>
              <h1 className="text-gray-900 dark:text-white text-xl font-bold">{t.editProfile}</h1>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8 p-4 bg-white dark:bg-[#1e1f23] rounded-2xl">
              <div className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black text-2xl font-bold">
                    {name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                </div>
                {uploading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-full"><div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>}
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">{name || (lang === "ru" ? "Без имени" : lang === "en" ? "No name" : "Ismsiz")}</p>
                <button onClick={() => fileInputRef.current?.click()} className="text-yellow-400 text-sm font-medium mt-1 hover:text-yellow-500 transition-colors">
                  {lang === "ru" ? "Изменить фото" : lang === "en" ? "Change photo" : "Rasmni o'zgartirish"}
                </button>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{t.fullName}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full h-12 bg-white dark:bg-[#1e1f23] border border-gray-200 dark:border-white/5 rounded-xl px-4 text-gray-900 dark:text-white focus:outline-none focus:border-yellow-400/50 transition-colors"
                  placeholder={lang === "ru" ? "Например: Алишер Навои" : lang === "en" ? "e.g. John Doe" : "Masalan: Alisher Navoiy"} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{t.phoneLabel}</label>
                <input type="text" 
                  value={phone?.startsWith("+tg") ? (lang === "ru" ? "Подключено через Telegram ✓" : lang === "en" ? "Connected via Telegram ✓" : "Telegram orqali ulangan ✓") : phone} 
                  disabled
                  className="w-full h-12 bg-white dark:bg-[#1e1f23] border border-gray-200 dark:border-white/5 rounded-xl px-4 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{t.description}</label>
                <textarea rows={3}
                  className="w-full bg-white dark:bg-[#1e1f23] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-yellow-400/50 transition-colors resize-none"
                  placeholder={lang === "ru" ? "Коротко о себе..." : lang === "en" ? "Briefly about yourself..." : "O'zingiz haqingizda qisqacha..."} />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {lang === "ru" ? "Я риелтор (Режим продавца)" : lang === "en" ? "I am a realtor (Seller mode)" : "Men realtorman (Sotuvchi rejimi)"}
                </label>
                <div onClick={() => setIsRealtor(!isRealtor)} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isRealtor ? 'bg-yellow-400' : 'bg-gray-600'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isRealtor ? 'translate-x-6' : ''}`} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {lang === "ru" ? "Показывать номер в профиле" : lang === "en" ? "Show phone number in profile" : "Profilda raqamni ko'rsatish"}
                </label>
                <div onClick={() => setShowPhone(!showPhone)} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${showPhone ? 'bg-yellow-400' : 'bg-gray-600'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${showPhone ? 'translate-x-6' : ''}`} />
                </div>
              </div>

              <button type="submit" disabled={saving || uploading}
                className="w-full h-12 mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
                {saving ? <><div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" /> {t.saving}</> : t.save}
              </button>
            </form>
          </div>
        )}

        {/* --- Faol seanslar --- */}
        {activeTab === "sessions" && (
          <div className="p-4 md:p-6 max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.activeSessions}</h1>
              <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {deviceSessions.length}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              {lang === "ru" ? "Все устройства, вошедшие в ваш аккаунт. Если увидите подозрительное устройство, завершите его сеанс." : lang === "en" ? "All devices logged into your account. If you see a suspicious device, remove it." : "Hisobingizga kirgan barcha qurilmalar. Shubhali qurilmani ko'rsangiz, uni chiqarib tashlang."}
            </p>

            {deviceSessions.length === 0 ? (
              <div className="bg-white dark:bg-[#1e1f23] rounded-2xl p-10 text-center border border-gray-100 dark:border-white/5">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {lang === "ru" ? "Пока нет сеансов" : lang === "en" ? "No sessions yet" : "Hozircha seanslar yo'q"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {lang === "ru" ? "Появится здесь при следующем входе" : lang === "en" ? "Will appear here upon next login" : "Qayta kirganingizda bu yerda ko'rinadi"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {deviceSessions.map((s: any) => {
                  const isCurrent = currentToken 
                    ? s.token === currentToken 
                    : deviceSessions.indexOf(s) === 0;
                  const ua = (s.userAgent || "").toLowerCase();
                  const isPhone = ua.includes("android") || ua.includes("iphone") || ua.includes("ipad") || ua.includes("mobile");
                  const lastActiveDate = new Date(s.lastActive);
                  const now = new Date();
                  const diffMs = now.getTime() - lastActiveDate.getTime();
                  const diffMin = Math.floor(diffMs / 60000);
                  const diffHour = Math.floor(diffMs / 3600000);
                  const diffDay = Math.floor(diffMs / 86400000);

                  let timeAgo = "";
                  if (isCurrent) timeAgo = lang === "ru" ? "Сейчас активен" : lang === "en" ? "Active now" : "Hozir faol";
                  else if (diffMin < 1) timeAgo = lang === "ru" ? "Только что" : lang === "en" ? "Just now" : "Hozirgina";
                  else if (diffMin < 60) timeAgo = lang === "ru" ? `${diffMin} мин назад` : lang === "en" ? `${diffMin}m ago` : `${diffMin} daqiqa oldin`;
                  else if (diffHour < 24) timeAgo = lang === "ru" ? `${diffHour} ч назад` : lang === "en" ? `${diffHour}h ago` : `${diffHour} soat oldin`;
                  else timeAgo = lang === "ru" ? `${diffDay} дн назад` : lang === "en" ? `${diffDay}d ago` : `${diffDay} kun oldin`;

                  const isDeleting = deletingId === s.id;

                  return (
                    <div
                      key={s.id}
                      className={`bg-white dark:bg-[#1e1f23] rounded-2xl p-4 border flex items-center justify-between gap-4 transition-opacity ${isDeleting ? "opacity-50" : "opacity-100"} ${
                        isCurrent
                          ? "border-yellow-400/40 dark:border-yellow-400/30"
                          : "border-gray-100 dark:border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isCurrent ? "bg-yellow-400/15" : "bg-gray-100 dark:bg-white/10"
                        }`}>
                          {isPhone ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${isCurrent ? "text-yellow-400" : "text-gray-500 dark:text-gray-400"}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${isCurrent ? "text-yellow-400" : "text-gray-500 dark:text-gray-400"}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                            </svg>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-gray-900 dark:text-white font-semibold text-sm">
                              {s.device || (lang === "ru" ? "Неизвестное устройство" : lang === "en" ? "Unknown device" : "Noma'lum qurilma")}
                            </p>
                            {isCurrent && (
                              <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                {t.you}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {timeAgo}{s.ip && s.ip !== "Noma'lum" ? ` • IP: ${s.ip}` : ""}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {lang === "ru" ? "Вход: " : lang === "en" ? "Logged in: " : "Kirgan: "}{new Date(s.createdAt).toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>

                      {!isCurrent && (
                        <button
                          disabled={isDeleting}
                          onClick={async () => {
                            setDeletingId(s.id);
                            try {
                              const res = await fetch(`/api/profile/sessions?tokenId=${s.id}`, {
                                method: "DELETE",
                              });
                              if (res.ok) {
                                setDeviceSessions(prev => prev.filter((x: any) => x.id !== s.id));
                              } else {
                                const err = await res.json();
                                console.error("Delete session failed:", err);
                                alert("Xatolik: " + (err.error || ""));
                              }
                            } catch (e) {
                              console.error("Delete session error:", e);
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                          className="shrink-0 text-red-500 hover:text-red-600 text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition border border-red-200 dark:border-red-500/20 disabled:opacity-50 flex items-center gap-1"
                        >
                          {isDeleting ? (
                            <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                          )}
                          {lang === "ru" ? "Завершить" : lang === "en" ? "Terminate" : "Chiqarish"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {deviceSessions.filter((s: any) => s.token !== currentToken).length > 0 && (
              <button
                disabled={deletingAll}
                onClick={async () => {
                  setDeletingAll(true);
                  try {
                    const res = await fetch("/api/profile/sessions?allOthers=true", {
                      method: "DELETE",
                    });
                    if (res.ok) {
                      setDeviceSessions(prev => prev.filter((s: any) => s.token === currentToken));
                    }
                  } catch (e) {
                    console.error("Delete all sessions error:", e);
                  } finally {
                    setDeletingAll(false);
                  }
                }}
                className="w-full mt-4 py-4 text-yellow-500 font-semibold hover:bg-yellow-500/10 rounded-xl transition-colors border border-yellow-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingAll ? (
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                ) : null}
                {lang === "ru" ? "Завершить все остальные сеансы" : lang === "en" ? "Log out from all other devices" : "Barcha boshqa qurilmalardan chiqarish"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
