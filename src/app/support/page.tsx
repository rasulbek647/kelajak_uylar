"use client";

import { useState } from "react";
import Link from "next/link";

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Kelajak Uylar nima?",
      answer: "Kelajak Uylar — bu ko'chmas mulk sohasidagi barcha jarayonlarda (sotish, ijaraga berish va h.k.) to'g'ridan-to'g'ri yordam beruvchi onlayn platforma! Kelajak Uylar orqali siz, sotuvchi sifatida, osonlik bilan uyingizni sotishingiz yoki ijaraga bera olasiz. Xaridor sifatida esa siz xohlagan hududda uy sotib olish yoki ijaraga olish imkoniyatiga egasiz."
    },
    {
      question: "Kelajak Uylar dasturiga e'lonni qanday qo'shish mumkin?",
      answer: "- Avvalo, shaxsiy profilni ochishingiz kerak (ro'yxatdan o'tishni \"profil\" tugmasini bosish orqali boshlashingiz mumkin), so'ngra e'lon joylashtirishni boshlash uchun \"+\" Qo'shish tugmasini bosing. Joylashtirish narxiga qarab, e'lon bepul yoki pullik bo'lishi mumkin, e'lonni joylashtirishdan oldin akkauntingizni to'ldirishni unutmang! Buning haqida ko'proq ma'lumotni YouTube ijtimoiy tarmog'ida topishingiz mumkin!"
    },
    {
      question: "Kelajak Uylar dasturida hamyonni qanday to'ldirish mumkin?",
      answer: "- Avvalo, shaxsiy profilni ochishingiz kerak (ro'yxatdan o'tishni \"profil\" tugmasini bosish orqali boshlashingiz mumkin), so'ngra \"Mening profilim\" sahifasining yuqorisidagi \"To'ldirish\" tugmasini bosib, akkauntingizni to'ldirishingiz mumkin. Akkauntingizni to'ldirishda ID raqami to'g'ri ko'rsatilganiga ishonch hosil qiling! ID raqami \"Mening profilim\" sahifasining o'ng yuqori burchagida ko'rsatilgan! YouTube ijtimoiy tarmog'ida ko'proq ma'lumotni topishingiz mumkin!"
    }
  ];

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
        <div className="w-full lg:w-80 shrink-0">
          <h2 className="text-xl font-bold mb-6">Aloqalar</h2>
          
          <div className="flex flex-col gap-4">
            <Link href="#" className="flex items-center gap-4 text-gray-700 dark:text-gray-200 hover:text-yellow-500 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M14.072 2.8c1.378-1.572 2.015-2.227 2.015-2.8 0 .093-1.688.083-2.902.946-1.564 1.112-2.189 2.656-2.096 2.673 1.25-.138 2.373-.655 2.983-1.077zM15.427 18.271c-1.282 1.332-2.84 2.226-4.526 2.226-1.782 0-3.327-.92-4.22-2.261-2.253-3.385-.69-9.986 2.043-12.723.824-.827 2.072-1.314 3.167-1.314 1.764 0 2.99.782 4.195 1.554 1.144.733 2.152 1.378 3.553 1.378 1.401 0 2.502-.857 2.502-1.67-.14 2.062-1.604 4.098-4.232 5.09-1.921.724-2.88 2.035-2.88 3.518 0 1.543.91 2.951 2.677 3.738 1.536.685 3.149.336 4.385-.929-1.328 1.839-4.241 2.923-6.664 1.393z"/>
                </svg>
              </div>
              <span className="font-semibold">IOS uchun dastur</span>
            </Link>
            
            <Link href="#" className="flex items-center gap-4 text-gray-700 dark:text-gray-200 hover:text-yellow-500 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.523 15.3414C17.523 15.3414 17.523 15.3414 17.523 15.3414C18.2322 15.3414 18.847 14.8519 18.9958 14.1561C19.0631 13.8407 18.9958 13.5173 18.8109 13.2625L15.313 8.35821C15.0211 7.94981 14.4363 7.8488 14.0042 8.13264C13.5721 8.41648 13.4542 8.97906 13.7461 9.38746L17.244 14.2917L17.523 15.3414ZM6.47697 15.3414C6.47697 15.3414 6.47697 15.3414 6.47697 15.3414C5.76785 15.3414 5.153 14.8519 5.00424 14.1561C4.93685 13.8407 5.00424 13.5173 5.18915 13.2625L8.68702 8.35821C8.97891 7.94981 9.56372 7.8488 9.99582 8.13264C10.4279 8.41648 10.5458 8.97906 10.2539 9.38746L6.75604 14.2917L6.47697 15.3414Z" fill="currentColor"/><path d="M12.0001 2.37891C6.27315 2.37891 1.63086 7.0212 1.63086 12.7481C1.63086 18.4751 6.27315 23.1174 12.0001 23.1174C17.727 23.1174 22.3693 18.4751 22.3693 12.7481C22.3693 7.0212 17.727 2.37891 12.0001 2.37891ZM12.0001 20.3546C7.79815 20.3546 4.3937 16.9501 4.3937 12.7481C4.3937 8.54617 7.79815 5.14172 12.0001 5.14172C16.202 5.14172 19.6065 8.54617 19.6065 12.7481C19.6065 16.9501 16.202 20.3546 12.0001 20.3546Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="font-semibold">Android uchun dastur</span>
            </Link>
            
            <Link href="https://t.me/kelajakuylar_sms_bot" target="_blank" className="flex items-center gap-4 text-gray-700 dark:text-gray-200 hover:text-yellow-500 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </div>
              <span className="font-semibold">Telegram</span>
            </Link>
            
            <Link href="#" className="flex items-center gap-4 text-gray-700 dark:text-gray-200 hover:text-yellow-500 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.987.01-4.042.059-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 2.896a5.302 5.302 0 110 10.604 5.302 5.302 0 010-10.604zm0 1.802a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm3.438-2.628a1.196 1.196 0 11-2.392 0 1.196 1.196 0 012.392 0z"/>
                </svg>
              </div>
              <span className="font-semibold">Instagram</span>
            </Link>
            
            <Link href="#" className="flex items-center gap-4 text-gray-700 dark:text-gray-200 hover:text-yellow-500 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M21.582 6.186a2.684 2.684 0 00-1.884-1.895C17.986 3.8 12 3.8 12 3.8s-5.986 0-7.698.491A2.684 2.684 0 002.418 6.186C1.947 7.893 1.947 12 1.947 12s0 4.107.471 5.814a2.684 2.684 0 001.884 1.895C5.986 20.2 12 20.2 12 20.2s5.986 0 7.698-.491a2.684 2.684 0 001.884-1.895c.471-1.707.471-5.814.471-5.814s0-4.107-.471-5.814zM9.953 15.547V8.453L15.906 12l-5.953 3.547z"/>
                </svg>
              </div>
              <span className="font-semibold">YouTube</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
