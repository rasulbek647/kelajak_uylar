"use client";

import { useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  type: string;
  dealType: string;
  status: string;
  isVip: boolean;
  createdAt: string;
  user: { name: string; phone: string };
  images: { url: string }[];
};

export default function AdminListingsClient({ initialListings }: { initialListings: Listing[] }) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    if (!confirm(`E'lon statusini "${newStatus}" ga o'zgartirasizmi?`)) return;
    setLoadingId(listingId);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, status: newStatus }),
      });
      if (res.ok) {
        setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: newStatus } : l));
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm(`Bu e'lonni butunlay o'chirib tashlaysizmi?`)) return;
    setLoadingId(listingId);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== listingId));
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Barcha e'lonlar</h1>
          <p className="text-gray-500 mt-1">Jami: {filtered.length} ta</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e1f23] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
          >
            <option value="ALL">Barcha statuslar</option>
            <option value="PENDING">Kutilmoqda</option>
            <option value="ACTIVE">Faol</option>
            <option value="REJECTED">Rad etilgan</option>
          </select>
          <input
            type="text"
            placeholder="E'lon nomi yoki manzil..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e1f23] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#111113] rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#16171b] text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest border-b border-gray-200 dark:border-white/5">
                <th className="p-5 font-semibold">E'lon</th>
                <th className="p-5 font-semibold">Turi</th>
                <th className="p-5 font-semibold">Egasi</th>
                <th className="p-5 font-semibold">Narxi</th>
                <th className="p-5 font-semibold text-center">Status</th>
                <th className="p-5 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 dark:text-gray-600">
                    E'lon topilmadi
                  </td>
                </tr>
              ) : filtered.map(listing => (
                <tr key={listing.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5 max-w-[250px]">
                    <Link href={`/listing/${listing.id}`} target="_blank" className="font-bold text-gray-900 dark:text-white hover:text-yellow-700 block mb-1 text-[15px] line-clamp-2">
                      {listing.title}
                    </Link>
                    <div className="text-gray-500 text-xs flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>
                      {listing.location}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="bg-gray-100 dark:bg-[#1e1f23] text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-semibold">{listing.type}</span>
                    <div className="text-xs text-gray-500 mt-1">{listing.dealType}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-semibold text-gray-900 dark:text-white">{listing.user.name}</div>
                    <div className="text-xs text-gray-500">{listing.user.phone}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1e1f23] inline-block px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5 whitespace-nowrap">
                      {listing.price.toLocaleString('ru-RU')} <span className="text-xs text-gray-500">{listing.currency}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    {listing.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1.5 text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-400/20 mb-1">
                        <span className="w-1.5 h-1.5 bg-yellow-500 dark:bg-yellow-400 rounded-full animate-pulse"></span> Kutilmoqda
                      </span>
                    )}
                    {listing.status === 'ACTIVE' && (
                      <span className="inline-flex items-center gap-1.5 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-400/10 px-3 py-1 rounded-full text-xs font-bold border border-green-200 dark:border-green-400/20 mb-1">
                        <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full"></span> Faol
                      </span>
                    )}
                    {listing.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1.5 text-yellow-500 dark:text-red-400 bg-yellow-100 dark:bg-red-400/10 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 dark:border-red-400/20 mb-1">
                        <span className="w-1.5 h-1.5 bg-yellow-500 dark:bg-red-400 rounded-full"></span> Rad etilgan
                      </span>
                    )}
                    {listing.isVip && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-400/10 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200 dark:border-purple-400/20">
                          👑 VIP
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={async () => {
                          setLoadingId(listing.id);
                          await fetch(`/api/admin/listings`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: listing.id, isVip: !listing.isVip }),
                          });
                          setListings(prev => prev.map(l => l.id === listing.id ? { ...l, isVip: !l.isVip } : l));
                          setLoadingId(null);
                        }}
                        className="px-2 py-1.5 text-xs font-bold rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition"
                      >
                        VIP {listing.isVip ? "Olib tashlash" : "Qilish"}
                      </button>

                      {listing.status !== 'ACTIVE' && (
                        <button 
                          onClick={() => handleStatusChange(listing.id, 'ACTIVE')}
                          disabled={loadingId === listing.id}
                          className="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 hover:bg-green-500 hover:text-white p-2 rounded-lg transition disabled:opacity-50"
                          title="Tasdiqlash"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                        </button>
                      )}
                      {listing.status !== 'REJECTED' && (
                        <button 
                          onClick={() => handleStatusChange(listing.id, 'REJECTED')}
                          disabled={loadingId === listing.id}
                          className="bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white p-2 rounded-lg transition disabled:opacity-50"
                          title="Rad etish"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M13.28 11.47a.75.75 0 01-1.06 1.06l-2.22-2.22-2.22 2.22a.75.75 0 11-1.06-1.06l2.22-2.22-2.22-2.22a.75.75 0 011.06-1.06l2.22 2.22 2.22-2.22a.75.75 0 011.06 1.06l-2.22 2.22 2.22 2.22zM10 2a8 8 0 100 16 8 8 0 000-16z" clipRule="evenodd" /></svg>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(listing.id)}
                        disabled={loadingId === listing.id}
                        className="bg-yellow-50 text-yellow-400 dark:bg-yellow-500/10 dark:text-red-400 hover:bg-yellow-500 hover:text-white p-2 rounded-lg transition disabled:opacity-50"
                        title="O'chirish"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm3.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                      </button>
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
