"use client";

import { useState, useEffect } from "react";

interface SettingsData {
  contactPhone?: string;
  telegramUrl?: string;
  instagramUrl?: string;
}

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [settings, setSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Kelajak Uylar nima?",
      answer: "Kelajak Uylar — O'zbekiston bo'ylab ko'chmas mulk oldi-sotdisi va ijarasiga ixtisoslashgan zamonaviy onlayn platforma. Sayt orqali xonadonlar, hovli uylar, yer uchastkalari hamda tijorat obyektlarini osongina topishingiz yoki o'z e'loningizni joylashtirishingiz mumkin."
    },
    {
      question: "Kelajak Uylar saytida e'lon qanday joylashtiriladi?",
      answer: "E'lon berish uchun avval saytda ro'yxatdan o'ting yoki profilingizga kiring. So'ngra yuqori paneldagi \"+ E'lon berish\" tugmasini bosing, bitim va mulk turini tanlang, rasmlar, narx, manzil va boshqa kerakli parametrlarni to'ldirib, e'lonni tasdiqlang."
    },
    {
      question: "E'lonim nega darhol saytda ko'rinmayapti?",
      answer: "Barcha yangi e'lonlar xavfsizlik va ma'lumotlar sifatini ta'minlash maqsadida moderatsiyadan o'tkaziladi. Agar tizim sozlamalarida avto-tasdiqlash yoqilgan bo'lsa, e'lon darhol faol bo'ladi. Aks holda moderatorlarimiz tomonidan qisqa muddat ichida tekshirilib, tasdiqlangach umumiy qidiruvda ko'rinadi."
    },
    {
      question: "Sotuvchi bilan qanday bog'lanish mumkin?",
      answer: "Har bir e'lon sahifasida sotuvchiga to'g'ridan-to'g'ri qo'ng'iroq qilish yoki sayt ichidagi xabarlar orqali yozish imkoniyati mavjud. DIQQAT: Xavfsizlik maqsadida obyektni ko'rmasdan va hujjatlarni shaxsan tekshirmasdan oldindan zakalat yoki pul o'tkazmasligingizni qat'iy tavsiya qilamiz!"
    },
    {
      question: "Shubhali e'lon yoki sotuvchi ustidan qanday shikoyat qilish mumkin?",
      answer: "Agar e'londa noto'g'ri ma'lumot, eskirgan narx yoki firibgarlik alomatlarini sezsangiz, e'lon sahifasidagi \"Shikoyat qilish\" tugmasini bosing va sababini tanlang. Administratorlarimiz ushbu murojaatni zudlik bilan ko'rib chiqadi."
    }
  ];

  const contactPhone = settings?.contactPhone?.trim();
  const telegramUrl = settings?.telegramUrl?.trim();
  const instagramUrl = settings?.instagramUrl?.trim();
  const hasContacts = Boolean(
    (contactPhone && contactPhone !== "") ||
    (telegramUrl && telegramUrl !== "#") ||
    (instagramUrl && instagramUrl !== "#")
  );

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-10 pt-6 sm:pt-20">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10">Qo'llab-quvvatlash</h1>
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* FAQ Section */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-6">Tez-tez so'raladigan savollar</h2>
          
          <div className="flex flex-col gap-2 border-t border-gray-200 dark:border-white/10">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-white/10">
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between py-5 text-left font-semibold hover:text-yellow-500 transition-colors"
                >
                  {faq.question}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2} 
                    stroke="currentColor" 
                    className={`w-5 h-5 transition-transform duration-200 ${openFaq === index ? 'rotate-180 text-yellow-500' : 'text-gray-400'}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                <div className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[15px] pb-6">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Contacts Section */}
        {hasContacts && (
          <div className="w-full lg:w-80 shrink-0">
            <h2 className="text-xl font-bold mb-6">Aloqalar</h2>
            
            <div className="flex flex-col gap-4">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-4 text-gray-700 dark:text-gray-200 hover:text-yellow-500 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.89-1.414-5.236-3.76-6.65-6.65l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <span className="font-semibold">{contactPhone}</span>
                </a>
              )}

              {telegramUrl && telegramUrl !== "#" && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-gray-700 dark:text-gray-200 hover:text-yellow-500 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                  </div>
                  <span className="font-semibold">Telegram</span>
                </a>
              )}

              {instagramUrl && instagramUrl !== "#" && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-gray-700 dark:text-gray-200 hover:text-yellow-500 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span className="font-semibold">Instagram</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
