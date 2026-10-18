"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function FavoriteButton({ listingId, initialFavorite = false }: { listingId: string, initialFavorite?: boolean }) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleToggle = async () => {
    if (!session) {
      router.push("/login");
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
          body: JSON.stringify({ listingId })
        });
      } else {
        await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId })
        });
      }
      router.refresh(); // Tepadagi navbar va boshqalarni yangilash uchun
    } catch (error) {
      console.error(error);
      setIsFavorite(!newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`w-full font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 border-2 disabled:opacity-50 ${
        isFavorite 
          ? 'bg-yellow-50 text-yellow-400 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-red-400' 
          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-white'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFavorite ? 0 : 2} className={`w-6 h-6 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      {isFavorite ? "Sevimlilarga qo'shildi" : "Sevimlilarga qo'shish"}
    </button>
  );
}
