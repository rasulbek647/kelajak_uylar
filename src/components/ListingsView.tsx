"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import Pagination from "@/components/Pagination";

interface ListingsViewProps {
  listings: any[];
  currentUserId: string | null;
  page: number;
  totalPages: number;
  initialLayout?: "default" | "detailed";
}

export default function ListingsView({
  listings,
  currentUserId,
  page,
  totalPages,
  initialLayout = "default",
}: ListingsViewProps) {
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<"default" | "detailed">(
    (searchParams.get("layout") as "default" | "detailed") || initialLayout
  );

  useEffect(() => {
    const urlLayout = searchParams.get("layout") as "default" | "detailed";
    const saved = localStorage.getItem("kelajak_layout") as "default" | "detailed";
    if (urlLayout) {
      setLayout(urlLayout);
    } else if (saved) {
      setLayout(saved);
    } else {
      setLayout("default");
    }

    const handleLayoutChange = (e: any) => {
      if (e.detail === "default" || e.detail === "detailed") {
        setLayout(e.detail);
      }
    };

    window.addEventListener("kelajak_layout_change", handleLayoutChange);
    return () => window.removeEventListener("kelajak_layout_change", handleLayoutChange);
  }, [searchParams]);

  if (listings.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-[#181a1f] rounded-3xl border border-gray-200 dark:border-white/5">
        <div className="flex justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-300 dark:text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">E'lonlar topilmadi</h3>
        <p className="text-gray-500 text-sm">Boshqa parametrlarni tanlab ko'ring</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {layout === "detailed" ? (
        // ─── 2-TUGMA: HAR BIR E'LON ALOHIDA, CHIROYLI EFFEKTLI REJIM ───
        <div className="flex flex-col gap-4 animate-fadeIn">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              price={listing.price}
              currency={listing.currency}
              location={listing.location}
              rooms={listing.rooms}
              area={listing.area}
              imageUrl={listing.images[0]?.url || "https://via.placeholder.com/800x600?text=Rasm+yo%27q"}
              badge={listing.isVip ? "VIP" : listing.isTop ? "TOP" : undefined}
              isFavorite={currentUserId ? listing.favoritedBy?.length > 0 : false}
              description={listing.description}
              type={listing.type}
              dealType={listing.dealType}
              ownerType={listing.ownerType}
              createdAt={listing.createdAt}
              views={listing.views}
              imagesCount={listing.images?.length || 1}
              user={listing.user}
              layout="detailed"
            />
          ))}
        </div>
      ) : (
        // ─── 1-TUGMA: OLDINGI STANDART REJIM (100% asl holatdagi 5 ustunli jadval) ───
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fadeIn">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              price={listing.price}
              currency={listing.currency}
              location={listing.location}
              rooms={listing.rooms}
              area={listing.area}
              imageUrl={listing.images[0]?.url || "https://via.placeholder.com/800x600?text=Rasm+yo%27q"}
              badge={listing.isVip ? "VIP" : listing.isTop ? "TOP" : undefined}
              isFavorite={currentUserId ? listing.favoritedBy?.length > 0 : false}
              description={listing.description}
              type={listing.type}
              dealType={listing.dealType}
              ownerType={listing.ownerType}
              createdAt={listing.createdAt}
              views={listing.views}
              imagesCount={listing.images?.length || 1}
              user={listing.user}
              layout="default"
            />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
