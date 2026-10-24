"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

declare global {
  interface Window {
    TelegramLoginCallback: (user: any) => void;
  }
}

interface TelegramLoginButtonProps {
  onSuccess?: (phone: string, name: string) => void;
  onError?: (msg: string) => void;
}

export default function TelegramLoginButton({ onSuccess, onError }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Callback funksiyasi
    window.TelegramLoginCallback = async (telegramUser: any) => {
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...telegramUser, region: "Toshkent" }),
        });
        const data = await res.json();

        if (!res.ok) {
          onError?.(data.message || "Xatolik yuz berdi");
          return;
        }

        // Qurilma va IP ma'lumotlarini olish
        const userAgent = navigator.userAgent || "";
        let ip = "Noma'lum";
        try {
          const ipRes = await fetch("https://api.ipify.org?format=json");
          const ipData = await ipRes.json();
          ip = ipData.ip || "Noma'lum";
        } catch (e) {}

        // Kriptografik imzolangan token orqali NextAuth session ochish
        const result = await signIn("credentials", {
          phone: data.phone,
          password: `__tg_verified__${data.loginToken}`,
          userAgent,
          ip,
          redirect: false,
        });

        if (result?.ok) {
          onSuccess?.(data.phone, data.name);
        } else {
          onError?.("Kirish amalga oshmadi: " + result?.error);
        }
      } catch (err) {
        onError?.("Telegram orqali kirish xatosi");
      }
    };

    // Telegram widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "kelajakuylar_sms_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "TelegramLoginCallback(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [onError, onSuccess]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-gray-500 text-xs font-medium">yoki</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>
      <div ref={containerRef} className="w-full flex justify-center" />
      <p className="text-xs text-gray-500 text-center">
        Telegram orqali bir bosimda kirish
      </p>
    </div>
  );
}
