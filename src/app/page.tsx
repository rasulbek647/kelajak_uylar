import { FilterBar } from "@/components/FilterBar";
import { ListingCard } from "@/components/ListingCard";
import ListingsView from "@/components/ListingsView";
import MapWrapper from "@/components/MapWrapper";
import Pagination from "@/components/Pagination";
import HomeResultsHeader, { VipListingsTitle } from "@/components/HomeResultsHeader";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PUBLIC_USER_SELECT } from "@/lib/server-utils";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const session = await getServerSession(authOptions);
  
  let currentUserId = null;
  if (session?.user) {
    const user = await prisma.user.findUnique({ where: { phone: (session.user as any).phone } });
    if (user) currentUserId = user.id;
  }

  const dealType = resolvedParams.dealType || "Barchasi";
  const type = resolvedParams.type || "Barchasi";
  const time = resolvedParams.time || "all";
  const minPrice = resolvedParams.minPrice ? parseInt(resolvedParams.minPrice) : null;
  const maxPrice = resolvedParams.maxPrice ? parseInt(resolvedParams.maxPrice) : null;
  
  const where: any = { status: "ACTIVE", isHidden: false };
  if (dealType !== "Barchasi") where.dealType = dealType;
  if (type !== "Barchasi") where.type = type;
  if (resolvedParams.q) {
    where.title = { contains: resolvedParams.q };
  }
  if (minPrice !== null || maxPrice !== null) {
    where.price = {};
    if (minPrice !== null) where.price.gte = minPrice;
    if (maxPrice !== null) where.price.lte = maxPrice;
  }
  if (resolvedParams.rooms && resolvedParams.rooms !== "Barchasi") {
    if (resolvedParams.rooms.endsWith("+")) {
      where.rooms = { gte: parseInt(resolvedParams.rooms) };
    } else {
      where.rooms = parseInt(resolvedParams.rooms);
    }
  }
  if (time === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    where.createdAt = { gte: weekAgo };
  } else if (time === "month") {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    where.createdAt = { gte: monthAgo };
  }

  if (resolvedParams.owner === "Egasi") where.ownerType = "Egasi";
  
  if (resolvedParams.withImages === "true") {
    where.images = { some: {} };
  }

  let amenitiesArr: string[] = [];
  if (resolvedParams.amenities) {
    amenitiesArr = Array.isArray(resolvedParams.amenities)
      ? resolvedParams.amenities
      : [resolvedParams.amenities];
    
    if (amenitiesArr.length > 0) {
      where.amenities = { hasEvery: amenitiesArr };
    }
  }

  const page = parseInt(resolvedParams.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const listings = await prisma.listing.findMany({
    where,
    include: { 
      images: true,
      user: { select: PUBLIC_USER_SELECT },
      favoritedBy: currentUserId ? { where: { userId: currentUserId } } : false
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: skip,
  });

  const totalFilteredCount = await prisma.listing.count({ where });
  const totalPages = Math.ceil(totalFilteredCount / limit);
  const totalCount = await prisma.listing.count({ where: { status: "ACTIVE", isHidden: false } });

  const isMapView = resolvedParams.view === "map";
  
  // Real VIP listings query (faqat 1-sahifada ko'rsatamiz)
  let vipListings: any[] = [];
  if (page === 1 && !isMapView) {
    vipListings = await prisma.listing.findMany({
      where: { ...where, isVip: true },
      include: {
        images: true,
        user: { select: PUBLIC_USER_SELECT },
        favoritedBy: currentUserId ? { where: { userId: currentUserId } } : false
      },
      orderBy: { createdAt: "desc" },
      take: 10, // Maks 10 ta VIP
    });
  }
  
  const topListings = listings;

  return (
    <main
      className={`flex-1 bg-white dark:bg-gray-950 transition-colors ${
        isMapView ? "overflow-hidden -mb-6 sm:-mb-10 min-h-[calc(100dvh-56px)]" : "pb-12"
      }`}
      style={isMapView ? { height: 'calc(100dvh - 56px)', position: 'relative' } : {}}
    >
      {isMapView ? (
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* Xarita to'liq ekran */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <MapWrapper listings={listings} />
          </div>
          
          {/* Floating FilterBar xarita ustida */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-screen-xl px-4 z-[900] pointer-events-none">
            <div className="pointer-events-auto">
              <FilterBar />
            </div>
          </div>
        </div>
      ) : (
        <>
          <FilterBar />

          {vipListings.length > 0 && (
            <section className="max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5">
              <VipListingsTitle />
              <div className="relative">
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide no-scrollbar snap-x snap-mandatory">
                  {vipListings.map((listing) => {
                    const sellerName = listing.user?.name || "Kelajak Uylar";
                    const sellerInitial = (listing.user?.name || "K").charAt(0).toUpperCase();

                    return (
                      <a
                        key={listing.id}
                        href={`/listing/${listing.id}`}
                        className="snap-start shrink-0 w-[200px] xs:w-[220px] sm:w-[240px] relative rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl border border-gray-200/80 dark:border-white/5 hover:border-yellow-400/80 transition-all duration-300"
                      >
                        <div className="relative h-[200px] w-full bg-gray-100 dark:bg-gray-800">
                          {listing.images[0] ? (
                            <img
                              src={listing.images[0].url}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl">🏠</div>
                          )}
                          <div className="absolute top-3 right-3 bg-yellow-400 text-gray-950 text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider">VIP</div>
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                              {sellerInitial}
                            </div>
                            <span className="text-white text-[11px] font-medium truncate max-w-[80px]">{sellerName}</span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
                            <p className="text-white font-bold text-base leading-tight">
                              {listing.price.toLocaleString("ru-RU")} {listing.currency}
                            </p>
                            <p className="text-gray-300 text-xs mt-0.5 line-clamp-2 leading-tight">{listing.title}</p>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-1.5 mt-3">
                  {vipListings.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? "w-5 bg-yellow-400" : "w-1.5 bg-gray-300 dark:bg-gray-600"}`} />
                  ))}
                </div>
              </div>
            </section>
          )}

          <HomeResultsHeader totalCount={totalCount} />

          <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ListingsView
              listings={listings}
              currentUserId={currentUserId}
              page={page}
              totalPages={totalPages}
              initialLayout={(resolvedParams.layout as "default" | "detailed") || "default"}
            />
          </section>
        </>
      )}
    </main>
  );
}
