"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function RatingSection({ listingId }: { listingId: string }) {
  const { data: session, status } = useSession();
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    // Oldin baho berganligini tekshir
    const rated = localStorage.getItem(`rated_${listingId}`);
    if (rated) setSubmitted(true);

    fetch(`/api/listings/${listingId}/rating`)
      .then(r => r.json())
      .then(data => {
        setAvgRating(data.avg || 0);
        setRatingCount(data.count || 0);
      });
  }, [listingId]);

  const handleSubmit = async () => {
    if (stars === 0) return;
    setLoading(true);
    try {
      await fetch(`/api/listings/${listingId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars, comment }),
      });
      setSubmitted(true);
      localStorage.setItem(`rated_${listingId}`, "true");
      setRatingCount(prev => prev + 1);
      setAvgRating(prev => ((prev * ratingCount) + stars) / (ratingCount + 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-5 border-t border-gray-100 dark:border-white/5">
      {/* Umumiy baho ko'rsatgich */}
      {ratingCount > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <svg
                key={i}
                className={`w-5 h-5 ${i <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                fill="currentColor" viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
            {avgRating.toFixed(1)} / 5
          </span>
          <span className="text-gray-400 text-sm">({ratingCount} baho)</span>
        </div>
      )}

      {/* Baho berish formasi */}
      <div className="bg-gray-50 dark:bg-[#1e1f23] rounded-2xl p-5 border border-gray-100 dark:border-white/5">
        <h3 className="text-center text-gray-900 dark:text-white font-bold text-base mb-4">
          E'longa baho bering
        </h3>

        {/* Foydalanuvchi kirmagan bo'lsa */}
        {status !== "loading" && !session ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Baho berish uchun tizimga kirishingiz kerak.
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full transition text-sm"
            >
              Kirish
            </Link>
          </div>
        ) : submitted ? (
          <div className="text-center py-4">
            <p className="text-green-500 font-semibold text-lg">✅ Bahongiz qabul qilindi!</p>
            <p className="text-gray-400 text-sm mt-1">Rahmat, fikringiz bizga muhim!</p>
          </div>
        ) : (
          <>
            {/* Yulduzlar */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setStars(i)}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-9 h-9 transition-colors ${
                      i <= (hovered || stars)
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Izoh */}
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Batafsil ma'lumot bering, bu bizning yaxshilanishimizga yordam beradi"
              className="w-full bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 resize-none h-24 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />

            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={stars === 0 || loading}
                className="px-10 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Yuborilmoqda..." : "Baholash"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
