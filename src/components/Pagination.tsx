"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `/?${params.toString()}`;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
      <button
        onClick={() => router.push(createPageUrl(currentPage - 1))}
        disabled={currentPage <= 1}
        className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold disabled:opacity-50 transition hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Oldingi
      </button>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => router.push(createPageUrl(page))}
            className={`w-10 h-10 rounded-xl font-bold transition ${
              page === currentPage
                ? "bg-yellow-400 text-black shadow-sm"
                : "bg-white dark:bg-[#1a1b1f] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/5"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push(createPageUrl(currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold disabled:opacity-50 transition hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Keyingi
      </button>
    </div>
  );
}
