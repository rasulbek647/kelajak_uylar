import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { Translate } from "@/components/Translate";

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userPhone = (session.user as any).phone;
  const user = await prisma.user.findUnique({ where: { phone: userPhone } });
  
  if (!user) {
    redirect("/login");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        include: { images: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="flex-1 bg-gray-50 dark:bg-[#0f0f11] py-6 sm:py-8 transition-colors">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-8"><Translate id="savedListings" /></h1>
        
        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#16171b] rounded-3xl border border-gray-200 dark:border-white/5">
            <div className="text-5xl mb-4 opacity-50">💛</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2"><Translate id="noFavorites" /></h3>
            <p className="text-gray-500"><Translate id="noFavoritesHint" /></p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {favorites.map((fav) => (
              <ListingCard
                key={fav.listing.id}
                id={fav.listing.id}
                title={fav.listing.title}
                price={fav.listing.price}
                currency={fav.listing.currency}
                location={fav.listing.location}
                rooms={fav.listing.rooms}
                area={fav.listing.area}
                imageUrl={fav.listing.images[0]?.url || "https://via.placeholder.com/800x600?text=Rasm+yo%27q"}
                isFavorite={true}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
