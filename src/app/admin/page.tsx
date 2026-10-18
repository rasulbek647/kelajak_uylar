import { prisma } from "@/lib/prisma";
import { Translate } from "@/components/Translate";
import Link from "next/link";
import { ListingAdminActions } from "./ListingAdminActions";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);

  const [
    totalUsers, totalListings, pendingListings, activeListings,
    newUsersWeek, newListingsWeek, recentListings
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.listing.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.listing.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, phone: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asosiy panel</h1>
          <p className="text-gray-500 mt-1">Platforma statistikasi va oxirgi harakatlar</p>
        </div>
      </div>

      {/* STATISTIKALAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jami foydalanuvchilar */}
        <div className="bg-white dark:bg-[#111113] p-5 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-blue-50 dark:bg-[#1e1f23] rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            </div>
            {newUsersWeek > 0 && <span className="text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">+{newUsersWeek}</span>}
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Jami foydalanuvchilar</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalUsers}</p>
          </div>
        </div>

        {/* Jami elonlar */}
        <div className="bg-white dark:bg-[#111113] p-5 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-yellow-50 dark:bg-[#1e1f23] rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
            </div>
            {newListingsWeek > 0 && <span className="text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">+{newListingsWeek}</span>}
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Jami e'lonlar</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalListings}</p>
          </div>
        </div>

        {/* Faol elonlar */}
        <div className="bg-white dark:bg-[#111113] p-5 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-green-50 dark:bg-[#1e1f23] rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Faol e'lonlar</h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{activeListings}</p>
          </div>
        </div>

        {/* Kutilayotgan elonlar */}
        <div className="bg-white dark:bg-[#111113] p-5 rounded-3xl border border-gray-200 dark:border-white/5 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-orange-50 dark:bg-[#1e1f23] rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Kutilmoqda</h3>
            <p className="text-3xl font-black text-orange-500">{pendingListings}</p>
          </div>
        </div>
      </div>

      {/* JADVAL */}
      <div className="bg-white dark:bg-[#111113] rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/50 transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yangi e'lonlar</h2>
            <p className="text-sm text-gray-500 mt-1">Yaqinda qo'shilganlar</p>
          </div>
          <Link href="/admin/listings" className="px-4 py-2 bg-gray-100 dark:bg-[#1e1f23] hover:bg-gray-200 text-gray-900 dark:text-white text-sm font-semibold rounded-xl">
            Barchasini ko'rish
          </Link>
        </div>

        {/* Mobile: karta ko'rinish */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-white/5">
          {recentListings.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-600">E'lonlar yo'q</div>
          ) : recentListings.map(listing => (
            <div key={listing.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/listing/${listing.id}`} target="_blank" className="font-bold text-gray-900 dark:text-white hover:text-yellow-700 block text-sm leading-tight mb-1 truncate">
                    {listing.title}
                  </Link>
                  <div className="text-gray-500 text-xs truncate">{listing.location}</div>
                </div>
                {listing.status === 'PENDING' && (
                  <span className="flex items-center gap-1.5 text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span> Kutilmoqda
                  </span>
                )}
                {listing.status === 'ACTIVE' && (
                  <span className="flex items-center gap-1.5 text-green-700 bg-green-100 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Faol
                  </span>
                )}
                {listing.status === 'REJECTED' && (
                  <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-100 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Rad
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">{listing.user.name}</div>
                  <div className="text-xs text-gray-500">{listing.price.toLocaleString('ru-RU')} {listing.currency}</div>
                </div>
                <ListingAdminActions listingId={listing.id} currentStatus={listing.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: jadval ko'rinish */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#16171b] text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-gray-200 dark:border-white/5">
                <th className="p-5 font-semibold">E'lon</th>
                <th className="p-5 font-semibold">Foydalanuvchi</th>
                <th className="p-5 font-semibold">Narx</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentListings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 dark:text-gray-600">
                    E'lonlar yo'q
                  </td>
                </tr>
              ) : recentListings.map(listing => (
                <tr key={listing.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="p-5">
                    <Link href={`/listing/${listing.id}`} target="_blank" className="font-bold text-gray-900 dark:text-white hover:text-yellow-700 block mb-1">
                      {listing.title}
                    </Link>
                    <div className="text-gray-500 text-xs">{listing.location}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-semibold text-gray-900 dark:text-white">{listing.user.name}</div>
                    <div className="text-xs text-gray-500">{listing.user.phone}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1e1f23] inline-block px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5">
                      {listing.price.toLocaleString('ru-RU')} <span className="text-xs text-gray-500">{listing.currency}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    {listing.status === 'PENDING' && (
                      <span className="flex items-center gap-2 text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-full text-xs font-bold w-max">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span> Kutilmoqda
                      </span>
                    )}
                    {listing.status === 'ACTIVE' && (
                      <span className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1.5 rounded-full text-xs font-bold w-max">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Faol
                      </span>
                    )}
                    {listing.status === 'REJECTED' && (
                      <span className="flex items-center gap-2 text-yellow-500 bg-yellow-100 px-3 py-1.5 rounded-full text-xs font-bold w-max">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Rad etilgan
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end">
                      <ListingAdminActions listingId={listing.id} currentStatus={listing.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
