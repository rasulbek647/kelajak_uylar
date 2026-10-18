"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ListingActions({
  listingId,
  phone,
  isFav,
  title = "Kelajak Uylar E'loni",
  iconsOnly = false,
  withoutPhone = false,
}: {
  listingId: string;
  phone: string;
  isFav: boolean;
  title?: string;
  iconsOnly?: boolean;
  withoutPhone?: boolean;
}) {
  const [fav, setFav] = useState(isFav);
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const toggleFav = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    const newFav = !fav;
    setFav(newFav);
    await fetch("/api/favorites", {
      method: newFav ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
  };

  const copyLink = async () => {
    const shareData = {
      title: title,
      text: title,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.error("Ulashish bekor qilindi yoki xato:", err);
      }
    }
    
    // Fallback to clipboard
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (iconsOnly) {
    return (
      <div className="flex items-center gap-3">
        {/* Saqlash icon */}
        <button onClick={toggleFav} title={fav ? "Saqlangan" : "Saqlash"}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill={fav ? "#ef4444" : "none"} stroke={fav ? "#ef4444" : "currentColor"}
            strokeWidth={2} className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        {/* Ulashish icon */}
        <button onClick={copyLink} title={copied ? "Nusxalandi!" : "Ulashish"}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={2} stroke="currentColor"
            className={`w-6 h-6 transition ${copied ? "text-green-500" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Telefon qilish */}
      {!withoutPhone && (
        <a
          href={`tel:${phone}`}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3.5 rounded-full transition flex items-center justify-center gap-2 text-sm mb-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.89-1.414-5.236-3.76-6.65-6.65l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          {phone}
        </a>
      )}
      {/* Saqlash + Ulashish */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={toggleFav}
          className={`flex-1 py-3 rounded-full border text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
            fav
              ? "bg-yellow-50 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-700/40 text-yellow-500"
              : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          {fav ? "Saqlandi" : "Saqlash"}
        </button>
        <button
          onClick={copyLink}
          className="flex-1 py-3 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          {copied ? "Nusxalandi!" : "Ulashish"}
        </button>
      </div>
    </>
  );
}
