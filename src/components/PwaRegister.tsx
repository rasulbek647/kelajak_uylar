"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("SW registered: ", registration))
        .catch((err) => console.log("SW registration failed: ", err));
    }
  }, []);

  return null;
}
