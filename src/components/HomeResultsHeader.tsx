"use client";

import { useLang } from "@/components/LangProvider";

export default function HomeResultsHeader({ totalCount }: { totalCount: number }) {
  const { t } = useLang();

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
      <div>
        <h2 className="text-gray-900 dark:text-white font-bold text-xl">
          {t.foundCount}: {totalCount.toLocaleString("ru-RU")}
        </h2>
        <p className="text-gray-500 text-sm">
          {t.allListings}: {totalCount.toLocaleString("ru-RU")}
        </p>
      </div>
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
        </svg>
        {t.sortByDefault}
      </div>
    </div>
  );
}

export function VipListingsTitle() {
  const { t } = useLang();
  return <h2 className="text-gray-900 dark:text-white font-bold text-xl mb-4">{t.vipListings}</h2>;
}
