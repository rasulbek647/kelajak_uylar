"use client";

import Link from "next/link";
import { FC, useState } from "react";
import { useSession } from "next-auth/react";
import { useLang } from "@/components/LangProvider";

interface ListingProps {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  rooms: number;
  area: number;
  imageUrl: string;
  badge?: "TOP" | "VIP";
  isFavorite?: boolean;
  onDelete?: (id: string) => void;
  description?: string;
  type?: string;
  dealType?: string;
  ownerType?: string;
  createdAt?: string | Date;
  views?: number;
  imagesCount?: number;
  user?: { id?: string; name?: string; phone?: string; avatar?: string | null; isVerified?: boolean; showPhone?: boolean };
  layout?: "default" | "detailed" | "grid" | "list";
}

export const ListingCard: FC<ListingProps> = ({
  id,
  title,
  price,
  currency,
  location,
  rooms,
  area,
  imageUrl,
  badge,
  isFavorite: initialFav = false,
  onDelete,
  description,
  type = "Kvartira",
  dealType = "Sotish",
  ownerType = "Egasi",
  createdAt,
  views = 0,
  imagesCount = 1,
  user,
  layout = "default",
}) => {
  const [isFavorite, setIsFavorite] = useState(initialFav);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { t, lang } = useLang();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      window.location.href = "/login";
      return;
    }
    
    setLoading(true);
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);

    try {
      if (newStatus) {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: id })
        });
      } else {
        await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: id })
        });
      }
    } catch (error) {
      console.error(error);
      setIsFavorite(!newStatus);
    } finally {
      setLoading(false);
    }
  };

  const authorName = user?.name || "Kelajak Uylar";
  const sellerPhone = user?.showPhone !== false ? user?.phone : undefined;

  // Tarjima funksiyalari
  const translateDealType = (dt: string) => {
    if (dt === "Sotish" || dt === "Sotuv") return t.dealSale;
    if (dt === "Ijara") return t.dealRent;
    if (dt === "Kunlik ijara" || dt === "Kunlik") return t.dealDaily;
    return dt;
  };

  const translatePropertyType = (pt: string) => {
    if (pt === "Kvartira") return t.apartment;
    if (pt === "Hovli uy" || pt === "Hovli") return t.house;
    if (pt === "Yer uchastkasi" || pt === "Yer") return t.land;
    if (pt === "Ofis") return t.office;
    if (pt === "Tijorat joyi" || pt === "Tijorat") return t.commercial;
    return pt;
  };

  const translateOwnerType = (ot: string) => {
    if (ot === "Egasi") return t.ownerLabel;
    if (ot === "Rieltor") return t.realtorLabel;
    return ot;
  };

  const timeAgo = (() => {
    if (!createdAt) return "";
    const diff = Date.now() - new Date(createdAt).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (h < 1) return lang === "ru" ? "Только что" : lang === "en" ? "Just now" : "Hozirgina";
    if (h < 24) return lang === "ru" ? `${h} ч. назад` : lang === "en" ? `${h}h ago` : `${h} soat oldin`;
    if (d === 1) return lang === "ru" ? "Вчера" : lang === "en" ? "Yesterday" : "Kecha";
    return lang === "ru" ? `${d} дн. назад` : lang === "en" ? `${d} days ago` : `${d} kun oldin`;
  })();

  // ════════════════════════════════════════════════════════════════
  // ─── 1. BIRINCHI TUGMA: STANDART GRID REJIM (Mobile & Desktop) ───
  // ════════════════════════════════════════════════════════════════
  if (layout === "default" || layout === "grid") {
    return (
      <Link href={`/listing/${id}`} className="block group w-full h-full">
        <div className="bg-white dark:bg-[#181a1f] rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/60 hover:border-yellow-400/80 transition-all duration-300 border border-gray-200 dark:border-white/5 flex flex-col h-full group/card">
          {/* Rasm qismi */}
          <div className="relative w-full h-[150px] xs:h-[165px] sm:h-[180px] shrink-0 bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-200 dark:bg-gray-700">
                🏠
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

            {/* User avatar placeholder */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-2 py-0.5 z-10">
              <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-black text-[9px] font-bold">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-[10px] font-medium truncate max-w-[70px]">
                {authorName}
              </span>
            </div>

            {/* Badge (TOP/VIP) */}
            {badge && (
              <div className="absolute top-2.5 right-2.5 bg-yellow-400 text-gray-950 text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1 z-10 shadow-sm">
                ★ {badge}
              </div>
            )}

            {/* Rasmlar soni nishoni */}
            {imagesCount > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 z-10">
                📷 {imagesCount}
              </div>
            )}
          </div>

          {/* Ma'lumotlar qismi */}
          <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-grow relative bg-white dark:bg-[#181a1f]">
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight group-hover/card:text-yellow-500 transition-colors">
                {price.toLocaleString("ru-RU")} <span className="text-xs sm:text-sm text-yellow-500 font-bold">{currency}</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs truncate mt-1 font-medium">
                {title}
              </p>
              
              {/* Kichik parametrlar */}
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <span>🛋️ {rooms} x.</span>
                <span>•</span>
                <span>📐 {area} m²</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-white/5 gap-2">
              <div className="text-gray-400 dark:text-gray-500 text-[11px] truncate flex items-center gap-1 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-yellow-500 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span className="truncate">{location}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm(t.deleteConfirm)) {
                        onDelete(id);
                      }
                    }}
                    className="p-1.5 rounded-full transition hover:bg-yellow-50 dark:hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-500"
                    title={t.delete}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <Link
                    href={`/edit-listing/${id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-full transition hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-500"
                    title={t.editProfile}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </Link>
                )}
                <button
                  onClick={handleFavorite}
                  disabled={loading}
                  className={`p-1.5 rounded-full transition ${isFavorite ? "bg-red-50 dark:bg-red-500/10" : "hover:bg-gray-100 dark:hover:bg-white/10"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? "#ef4444" : "none"}
                    stroke={isFavorite ? "#ef4444" : "currentColor"}
                    strokeWidth={isFavorite ? 0 : 2}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"} transition-colors`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // ─── 2. IKKINCHI TUGMA: HAR BIR E'LON ALOHIDA, CHIROYLI EFFEKTLI REJIM ───
  // ════════════════════════════════════════════════════════════════
  return (
    <Link href={`/listing/${id}`} className="block group w-full">
      <div className="bg-white dark:bg-[#181a1f] rounded-2xl md:rounded-3xl overflow-hidden border border-gray-200/90 dark:border-white/5 hover:border-yellow-400 dark:hover:border-yellow-400/80 shadow-sm hover:shadow-2xl dark:hover:shadow-yellow-500/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row min-h-[220px]">
        
        {/* Chap tomon: Rasm */}
        <div className="relative w-full md:w-[280px] lg:w-[320px] h-[200px] xs:h-[220px] md:h-auto shrink-0 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-200 dark:bg-gray-700">
              🏠
            </div>
          )}

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Nishonlar (VIP / TOP / DealType) */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
            {badge && (
              <span className="bg-yellow-400 text-gray-950 text-[11px] font-black px-2.5 py-0.5 rounded-md tracking-wider shadow-md flex items-center gap-1">
                ★ {badge}
              </span>
            )}
            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase">
              {translateDealType(dealType)}
            </span>
          </div>

          {/* Foydalanuvchi avatari */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full pl-1 pr-2.5 py-1 z-10">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-yellow-400 flex items-center justify-center text-black text-[10px] font-bold shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                authorName.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-white text-[11px] font-medium truncate max-w-[100px]">
              {authorName}
            </span>
            {user?.isVerified && (
              <span className="text-green-400 text-[10px] font-bold" title={t.verifiedTooltip}>✓</span>
            )}
          </div>

          {/* Rasmlar soni nishoni */}
          {imagesCount > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1 z-10">
              📷 {imagesCount} {t.photosCount}
            </div>
          )}
        </div>

        {/* O'ng tomon: Ma'lumotlar va Tugmalar */}
        <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-between flex-1 gap-3.5 bg-white dark:bg-[#181a1f]">
          <div>
            {/* Narx va Sevimli */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors">
                  {price.toLocaleString("ru-RU")} <span className="text-base sm:text-lg text-yellow-500">{currency}</span>
                </h3>
                <h4 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mt-1 line-clamp-1">
                  {title}
                </h4>
              </div>
              <button
                onClick={handleFavorite}
                disabled={loading}
                className={`p-2.5 rounded-full transition-all shrink-0 ${isFavorite ? "bg-red-50 dark:bg-red-500/10 text-red-500" : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"}`}
                title={t.addFavorite}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? "#ef4444" : "none"}
                  stroke={isFavorite ? "#ef4444" : "currentColor"}
                  strokeWidth={isFavorite ? 0 : 2}
                  className="w-5 h-5 transition-transform active:scale-125"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </button>
            </div>

            {/* Parametrlar chipslari */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3">
              <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-gray-200/60 dark:border-white/5">
                🛋️ {rooms} {t.rooms}
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-gray-200/60 dark:border-white/5">
                📐 {area} m²
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 font-bold text-xs border border-yellow-200/50 dark:border-yellow-400/20">
                {translatePropertyType(type)}
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium text-xs">
                {translateOwnerType(ownerType)}
              </span>
            </div>

            {/* Tavsif qisqacha */}
            {description && (
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2.5 line-clamp-2 leading-relaxed">
                {description.split("---")[0]}
              </p>
            )}
          </div>

          {/* Manzil, sana va tezkor tugmalar */}
          <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-yellow-500 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span className="truncate max-w-[280px]">{location}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                {timeAgo && <span>🕒 {timeAgo}</span>}
                {views > 0 && <span>👁️ {views} {t.viewsLabel}</span>}
              </div>
            </div>

            {/* Tezkor aloqa tugmalari */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {user?.id && (
                <Link
                  href={`/profile/messages?recipientId=${user.id}&listingId=${id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  💬 {t.chatBtn}
                </Link>
              )}
              {sellerPhone && (
                <a
                  href={`tel:${sellerPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  📞 {t.callBtn}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
