"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

export function ListingSellerButtons({
  recipientId,
  listingId,
  phone,
}: {
  recipientId: string;
  listingId: string;
  phone?: string | null;
}) {
  const { t } = useLang();
  const hasPhone = Boolean(phone && phone.trim());

  if (!hasPhone) {
    return (
      <div className="w-full">
        <Link
          href={`/profile/messages?recipientId=${recipientId}&listingId=${listingId}`}
          className="w-full py-3.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition flex items-center justify-center"
        >
          {t.writeSeller}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href={`/profile/messages?recipientId=${recipientId}&listingId=${listingId}`}
        className="py-3.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition flex items-center justify-center"
      >
        {t.writeSeller}
      </Link>
      <a
        href={`tel:${phone}`}
        className="py-3.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold text-sm text-center transition"
      >
        {t.callSeller}
      </a>
    </div>
  );
}

export function ListingViewProfileBtn({ userId }: { userId: string }) {
  const { t } = useLang();
  return (
    <Link
      href={`/user/${userId}`}
      className="w-full text-center py-3.5 mt-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm hover:opacity-90 transition block"
    >
      {t.viewProfile}
    </Link>
  );
}

export function ListingSectionTitle({ titleKey }: { titleKey: "amenities" | "locationTitle" | "voiceDescription" | "similarListings" }) {
  const { t } = useLang();
  if (titleKey === "voiceDescription") {
    return <h3 className="text-gray-900 dark:text-white font-bold mb-2 text-sm">🎙 {t.voiceDescription}</h3>;
  }
  if (titleKey === "locationTitle") {
    return <h3 className="text-xl font-black text-gray-900 dark:text-white">{t.locationTitle}</h3>;
  }
  if (titleKey === "similarListings") {
    return <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5">{t.similarListings}</h2>;
  }
  return <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t.amenities}</h3>;
}

export function ListingViewsBadge({ views }: { views: number }) {
  const { t } = useLang();
  return <span>👁 {views} {t.viewsCount}</span>;
}

export function ListingTimeAgo({ createdAt }: { createdAt: string | Date }) {
  const { lang } = useLang();
  const diff = Date.now() - new Date(createdAt).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  let text = "";
  if (h < 1) text = lang === "ru" ? "Только что" : lang === "en" ? "Just now" : "Hozirgina";
  else if (h < 24) text = lang === "ru" ? `${h} ч. назад` : lang === "en" ? `${h}h ago` : `${h} soat oldin`;
  else if (d === 1) text = lang === "ru" ? "Вчера" : lang === "en" ? "Yesterday" : "Kecha";
  else text = lang === "ru" ? `${d} дн. назад` : lang === "en" ? `${d} days ago` : `${d} kun oldin`;

  return <span>{text}</span>;
}

export function ListingTags({ dealType, type }: { dealType: string; type: string }) {
  const { t } = useLang();
  const dt = dealType === "Sotish" ? t.dealSale : dealType === "Ijara" ? t.dealRent : dealType === "Kunlik ijara" ? t.dealDaily : dealType;
  const pt = type === "Kvartira" ? t.apartment : type === "Hovli uy" ? t.house : type === "Yer uchastkasi" ? t.land : type === "Ofis" ? t.office : type === "Tijorat joyi" ? t.commercial : type;

  return (
    <div className="flex gap-2 flex-wrap">
      <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase">
        {dt}
      </span>
      <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase">
        {pt}
      </span>
    </div>
  );
}

export function ListingDetailsTable({
  ownerType,
  rooms,
  area,
  type,
  dealType
}: {
  ownerType?: string | null;
  rooms: number;
  area: number;
  type: string;
  dealType: string;
}) {
  const { t } = useLang();
  const dt = dealType === "Sotish" ? t.dealSale : dealType === "Ijara" ? t.dealRent : dealType === "Kunlik ijara" ? t.dealDaily : dealType;
  const pt = type === "Kvartira" ? t.apartment : type === "Hovli uy" ? t.house : type === "Yer uchastkasi" ? t.land : type === "Ofis" ? t.office : type === "Tijorat joyi" ? t.commercial : type;
  const ot = ownerType === "Egasi" ? t.ownerChoice : ownerType === "Rieltor" ? t.realtor : (ownerType || t.ownerChoice);

  const rows = [
    { label: t.whoPosted, value: ot },
    { label: t.roomsCount, value: `${rooms}` },
    { label: t.areaSqm, value: `${area}` },
    { label: t.propertyType, value: pt },
    { label: t.dealType, value: dt },
  ];

  return (
    <div className="space-y-3 pt-1">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium shrink-0">{label}</span>
          <span className="flex-1 border-b border-dashed border-gray-200 dark:border-white/10" />
          <span className="text-gray-900 dark:text-white text-sm font-bold shrink-0">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function ListingAmenitiesList({ amenities }: { amenities: string[] }) {
  const { t } = useLang();
  const getAmenityLabel = (am: string) => {
    if (am === "Gaz") return t.amenityGas;
    if (am === "Suv") return t.amenityWater;
    if (am === "Svet") return t.amenityElec;
    if (am === "Internet/WiFi") return t.amenityInternet;
    if (am === "Konditsioner") return t.amenityAc;
    if (am === "Mebel") return t.amenityFurniture;
    if (am === "Avtoturargoh") return t.amenityParking;
    if (am === "Isitish tizimi") return t.amenityHeating;
    return am;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((am) => (
        <span key={am} className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-400/20">
          {am === "Gaz" && "🔥 "}{am === "Suv" && "💧 "}{am === "Svet" && "⚡ "}{am === "Internet/WiFi" && "📶 "}{am === "Konditsioner" && "❄️ "}{am === "Mebel" && "🛋️ "}{am === "Avtoturargoh" && "🚗 "}{am === "Isitish tizimi" && "🌡️ "}
          {getAmenityLabel(am)}
        </span>
      ))}
    </div>
  );
}

export function ListingSellerRole({ ownerType }: { ownerType?: string | null }) {
  const { t } = useLang();
  return (
    <p className="text-sm text-gray-500">
      {ownerType === "Egasi" ? t.ownerChoice : ownerType === "Rieltor" ? t.realtor : (ownerType || t.ownerChoice)}
    </p>
  );
}
