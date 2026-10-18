"use client";

import { updateListingStatus, deleteListing } from "./actions";
import { useTransition, useState } from "react";

export function ListingAdminActions({ listingId, currentStatus }: { listingId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = (status: string) => {
    startTransition(() => {
      updateListingStatus(listingId, status);
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      deleteListing(listingId);
    });
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="flex gap-2 items-center flex-wrap">
        {currentStatus !== 'ACTIVE' && (
          <button 
            onClick={() => handleStatusChange('ACTIVE')} 
            disabled={isPending}
            className="text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
          >
            Tasdiqlash
          </button>
        )}
        
        {currentStatus !== 'REJECTED' && (
          <button 
            onClick={() => handleStatusChange('REJECTED')} 
            disabled={isPending}
            className="text-white bg-yellow-500 hover:bg-yellow-700 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
          >
            Rad etish
          </button>
        )}
        
        <button 
          onClick={() => setShowDeleteConfirm(true)} 
          disabled={isPending}
          className="text-white bg-yellow-500 hover:bg-yellow-400 px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50"
        >
          O'chirish
        </button>
      </div>

      {/* Custom delete confirm modal - no browser confirm() */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white dark:bg-[#1e1f23] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg text-center mb-2">E'lonni o'chirish</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">Bu e'lonni o'chirishni tasdiqlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-white font-semibold text-sm transition disabled:opacity-50"
              >
                {isPending ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
