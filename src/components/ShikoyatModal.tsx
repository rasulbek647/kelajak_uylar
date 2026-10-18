"use client";

import { useState } from "react";

const REASONS_MAP = {
  uz: [
    "Bitim tuzildi, narx kelishildi",
    "Eski e'lon — allaqachon sotilgan yoki ijaraga berilgan",
    "Soxta e'lon yoki noto'g'ri ma'lumot",
    "Boshqa",
  ],
  ru: [
    "Сделка состоялась, цена согласована",
    "Старое объявление — уже продано или сдано",
    "Мошенническое объявление или неверная информация",
    "Другое",
  ],
  en: [
    "Deal made, price agreed",
    "Old listing — already sold or rented",
    "Fake listing or incorrect information",
    "Other",
  ],
};

const T = {
  uz: { title: "Shikoyat", submit: "Yuborish", close: "Yopish", placeholder: "Izoh qoldiring...", thanks: "Shikoyatingiz uchun rahmat!" },
  ru: { title: "Жалоба", submit: "Отправить", close: "Закрыть", placeholder: "Оставьте комментарий...", thanks: "Спасибо за вашу жалобу!" },
  en: { title: "Report", submit: "Send", close: "Close", placeholder: "Leave a comment...", thanks: "Thank you for your report!" },
};

type Lang = "uz" | "ru" | "en";

export function ShikoyatModal({
  onClose,
  listingId,
}: {
  onClose: () => void;
  listingId: string;
}) {
  const [lang, setLang] = useState<Lang>("uz");
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const reasons = REASONS_MAP[lang];
  const t = T[lang];
  const lastReason = reasons[reasons.length - 1]; // "Boshqa" / "Другое" / "Other"
  // "Boshqa" tanlanganda izoh majburiy
  const canSubmit = selected !== null && (selected !== lastReason || note.trim().length > 0);

  const handleSend = () => {
    if (!canSubmit) return;
    setSent(true);
    fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, reason: selected, note: note.trim() || undefined }),
    }).catch(() => {});
  };

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1e1f23] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <h3 className="text-gray-900 dark:text-white font-bold text-lg">{t.title}</h3>
          <div className="flex items-center gap-2">
            {/* Til tanlash */}
            <div className="flex gap-1">
              {(["uz", "ru", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setSelected(null); setNote(""); }}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition ${
                    lang === l
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {sent ? (
          /* ── Muvaffaqiyat ekrani (3-rasm) ── */
          <div className="px-5 py-8 text-center">
            <p className="text-gray-800 dark:text-gray-200 text-base font-medium">{t.thanks}</p>
          </div>
        ) : (
          /* ── Sabablar ro'yxati ── */
          <div className="px-5 pt-3">
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelected(reason)}
                  className="w-full flex items-center justify-between py-4 text-left gap-4 group"
                >
                  <span className={`text-sm leading-snug ${
                    selected === reason
                      ? "text-gray-900 dark:text-white font-medium"
                      : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                  }`}>
                    {reason}
                  </span>
                  {/* Radio */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                    selected === reason
                      ? "border-gray-700 dark:border-gray-200"
                      : "border-gray-300 dark:border-gray-600 group-hover:border-gray-500 dark:group-hover:border-gray-400"
                  }`}>
                    {selected === reason && (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-700 dark:bg-gray-200" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* "Boshqa" tanlanganda izoh maydoni */}
            {selected === lastReason && (
              <div className="pb-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.placeholder}
                  rows={3}
                  autoFocus
                  className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-gray-400 dark:focus:border-white/30 resize-none transition"
                />
              </div>
            )}
          </div>
        )}

        {/* Footer tugma */}
        <div className="px-4 pb-5 pt-1">
          {sent ? (
            <button
              onClick={onClose}
              className="w-full py-4 rounded-full font-bold text-base bg-yellow-400 hover:bg-yellow-500 text-gray-950 transition shadow-md"
            >
              {t.close}
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSubmit}
              className={`w-full py-4 rounded-full font-bold text-base transition ${
                canSubmit
                  ? "bg-yellow-400 hover:bg-yellow-500 text-gray-950 cursor-pointer shadow-md"
                  : "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? "..." : t.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
