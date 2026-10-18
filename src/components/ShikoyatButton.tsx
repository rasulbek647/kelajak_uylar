"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShikoyatModal } from "@/components/ShikoyatModal";

export function ShikoyatButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      {open && <ShikoyatModal onClose={() => setOpen(false)} listingId={listingId} />}
      <button
        onClick={handleClick}
        className="px-5 py-2 rounded-full font-medium text-sm text-yellow-500 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition dark:bg-yellow-900/50 dark:border-yellow-700/50 dark:text-red-400 dark:hover:bg-yellow-800/60"
      >
        Shikoyat qilish
      </button>
    </>
  );
}
