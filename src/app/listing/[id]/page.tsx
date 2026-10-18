import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import SingleMapWidgetWrapper from "@/components/SingleMapWidgetWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ListingActions } from "@/components/ListingActions";
import { ShikoyatButton } from "@/components/ShikoyatButton";
import RatingSection from "@/components/RatingSection";
import ViewTracker from "@/components/ViewTracker";
import {
  ListingSellerButtons,
  ListingViewProfileBtn,
  ListingSectionTitle,
  ListingViewsBadge,
  ListingTimeAgo,
  ListingTags,
  ListingDetailsTable,
  ListingAmenitiesList,
  ListingSellerRole
} from "@/components/ListingDetailActions";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  let currentUserId = null;

  if (session?.user) {
    const user = await prisma.user.findUnique({ where: { phone: (session.user as any).phone } });
    if (user) currentUserId = user.id;
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: true,
      images: true,
      favoritedBy: currentUserId ? { where: { userId: currentUserId } } : false
    }
  });

  if (!listing) notFound();

  const isFav = currentUserId ? listing.favoritedBy.length > 0 : false;

  const similar = await prisma.listing.findMany({
    where: { id: { not: id }, type: listing.type, status: "ACTIVE", isHidden: false },
    include: { images: { take: 1 } },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  const sellerCard = (
    <div className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1e1f23] min-h-[200px]">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0">
          {listing.user.avatar ? (
            <img src={listing.user.avatar} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black font-bold text-xl sm:text-2xl">
              {listing.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">{listing.user.name}</h4>
          <ListingSellerRole ownerType={listing.ownerType} />
        </div>
      </div>
      <ListingViewProfileBtn userId={listing.user.id} />
    </div>
  );

  const ratingSection = (
    <div className="bg-gray-50 dark:bg-[#1e1f23] rounded-2xl md:rounded-3xl p-5 border border-gray-100 dark:border-white/5">
      <RatingSection listingId={listing.id} />
    </div>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-[#111113] transition-colors pb-12">
      <ViewTracker listingId={listing.id} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-6 lg:gap-12">
          
          {/* ── CHAP USTUN: Galereya + Desktopda Sotuvchi & Baholash ── */}
          <div className="space-y-5">
            {/* Galereya */}
            <div className="rounded-2xl md:rounded-3xl overflow-hidden mt-0 lg:mt-11">
              <ImageGallery images={listing.images} />
            </div>

            {/* Faqat desktopda chap tomonda ko'rsatiladi */}
            <div className="hidden lg:flex flex-col gap-5">
              {sellerCard}
              {ratingSection}
            </div>
          </div>

          {/* ── O'NG USTUN: Kontent ── */}
          <div className="space-y-5">
            {/* Vaqt va Ko'rishlar */}
            <div className="flex justify-end items-center gap-4 text-gray-400 dark:text-gray-500 text-sm">
              <ListingViewsBadge views={listing.views || 0} />
              <ListingTimeAgo createdAt={listing.createdAt} />
            </div>

            {/* Harakat tugmalari */}
            <ListingSellerButtons
              recipientId={listing.user.id}
              listingId={listing.id}
              phone={listing.user.phone}
            />

            {/* Teglar + ikonkalar */}
            <div className="flex items-center justify-between">
              <ListingTags dealType={listing.dealType} type={listing.type} />
              <ListingActions listingId={listing.id} phone={listing.user.phone} isFav={isFav} title={`${listing.title} - ${listing.price.toLocaleString("ru-RU")} ${listing.currency}`} iconsOnly />
            </div>

            {/* Sarlavha + Narx */}
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{listing.title}</h1>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {listing.price.toLocaleString("ru-RU")} <span className="text-xl text-yellow-500">{listing.currency}</span>
              </p>
            </div>

            {/* Ta'rif */}
            {listing.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            )}

            {/* Batafsil jadval */}
            <ListingDetailsTable
              ownerType={listing.ownerType}
              rooms={listing.rooms}
              area={listing.area}
              type={listing.type}
              dealType={listing.dealType}
            />

            {/* Qulayliklar */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="pt-3 border-t border-gray-100 dark:border-white/5">
                <ListingSectionTitle titleKey="amenities" />
                <ListingAmenitiesList amenities={listing.amenities} />
              </div>
            )}

            {/* Ovozli tavsif */}
            {listing.audioUrl && (
              <div className="pt-3 border-t border-gray-100 dark:border-white/5">
                <ListingSectionTitle titleKey="voiceDescription" />
                <audio controls src={listing.audioUrl} className="w-full" style={{ colorScheme: "light dark" }} />
              </div>
            )}

            {/* Joylashuv + Xarita */}
            <div className="pt-3 border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <ListingSectionTitle titleKey="locationTitle" />
                <ShikoyatButton listingId={listing.id} />
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0 text-yellow-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {listing.location}
              </p>
              {listing.lat && listing.lng && (
                <SingleMapWidgetWrapper lat={listing.lat} lng={listing.lng} title={listing.title} className="h-[220px] w-full rounded-2xl" />
              )}
            </div>

            {/* Faqat mobileda: Sotuvchi va Baholash e'lon ma'lumotlaridan keyin ko'rsatiladi */}
            <div className="flex lg:hidden flex-col gap-5 pt-4 border-t border-gray-100 dark:border-white/5">
              {sellerCard}
              {ratingSection}
            </div>
          </div>
        </div>

        {/* ─── Shunga o'xshash e'lonlar ─── */}
        {similar.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5">
            <ListingSectionTitle titleKey="similarListings" />
            <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar snap-x snap-mandatory">
              {similar.map((item) => (
                <Link
                  key={item.id}
                  href={`/listing/${item.id}`}
                  className="shrink-0 snap-start w-64 h-48 rounded-2xl overflow-hidden relative group"
                >
                  <img
                    src={item.images?.[0]?.url || "https://via.placeholder.com/400x300?text=Rasm+yo%27q"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                    <p className="text-white font-bold text-lg leading-tight mb-1">
                      {item.price.toLocaleString("ru-RU")} {item.currency}
                    </p>
                    <p className="text-white/90 text-sm font-medium line-clamp-2 leading-snug">{item.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
