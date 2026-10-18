"use client";
import { useEffect, useRef } from "react";

export default function ViewTracker({ listingId }: { listingId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      const viewed = localStorage.getItem(`viewed_${listingId}`);
      if (!viewed) {
        localStorage.setItem(`viewed_${listingId}`, "true");
        fetch(`/api/listings/${listingId}`, { method: "PATCH" })
          .catch(e => {
            console.error(e);
            localStorage.removeItem(`viewed_${listingId}`);
          });
      }
    }
  }, [listingId]);

  return null;
}
