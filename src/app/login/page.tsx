"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TelegramLoginButton from "@/components/TelegramLoginButton";
import { useLang } from "@/components/LangProvider";

// Telefon raqamini formatlash: +998 XX XXX XX XX
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("998") ? digits.slice(3) : digits;

  let result = "+998";
  if (local.length > 0) result += " " + local.slice(0, 2);
  if (local.length > 2) result += " " + local.slice(2, 5);
  if (local.length > 5) result += " " + local.slice(5, 7);
  if (local.length > 7) result += " " + local.slice(7, 9);
  return result;
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("998") && digits.length === 12;
}

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  
  // Step 1: Telefon, Step 2: Parol
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryPhone = params.get("phone");
      if (queryPhone) {
        setPhone(formatPhone(queryPhone));
      }
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw.startsWith("+998")) {
      setPhone("+998");
      return;
    }
    setPhone(formatPhone(raw));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError(
        lang === "ru"
          ? "Неверный формат номера. Например: +998 90 123 45 67"
          : lang === "en"
          ? "Invalid phone format. E.g.: +998 90 123 45 67"
          : "Telefon raqam formati noto'g'ri. Masalan: +998 90 123 45 67"
      );
      return;
    }
    setError("");
    setStep(2);
  };

  const handleConfirmMethod = (method: "telegram" | "sms") => {
    // Kelajakda qaysi usul tanlanganiga qarab API ga so'rov ketishi mumkin
    setShowConfirmModal(false);
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Qurilma ma'lumotlarini olish
    const userAgent = navigator.userAgent || "";
    let ip = "Noma'lum";
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipRes.json();
      ip = ipData.ip || "Noma'lum";
    } catch {}

    const res = await signIn("credentials", {
      redirect: false,
      phone: phone.replace(/\s+/g, ""),
      password,
      userAgent,
      ip,
    });

    if (res?.error) {
      setError(lang === "ru" ? "Неверный номер телефона или код" : lang === "en" ? "Invalid phone number or code" : "Telefon raqam yoki kod xato");
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen relative">
    
      {/* Telefon tasdiqlash modali */}
      {showConfirmModal && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center" style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="bg-[#1e1f23] rounded-3xl p-7 w-full max-w-[340px] mx-4 shadow-2xl flex flex-col gap-4">
            {/* Telefon raqam */}
            <p className="text-white text-2xl font-bold text-center tracking-wide">
              {phone.replace(/\s+/g, "")}
            </p>
            <p className="text-white text-lg font-bold text-center">{t.isNumberCorrect}</p>
            <p className="text-gray-400 text-sm text-center">{t.chooseCodeMethod}</p>
            
            {/* Telegram tugmasi */}
            <button
              onClick={() => handleConfirmMethod("telegram")}
              className="w-full py-3.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-[15px] transition-colors"
            >
              {t.viaTelegram}
            </button>
            
            {/* SMS tugmasi */}
            <button
              onClick={() => handleConfirmMethod("sms")}
              className="w-full py-3.5 rounded-full bg-white hover:bg-gray-100 text-black font-bold text-[15px] transition-colors"
            >
              {t.viaSms}
            </button>
            
            {/* Tahrirlash tugmasi */}
            <button
              onClick={() => setShowConfirmModal(false)}
              className="w-full py-3.5 rounded-full bg-[#2e2f34] hover:bg-[#3a3b40] text-white font-bold text-[15px] transition-colors"
            >
              {t.edit}
            </button>
          </div>
        </div>
      )}

      {/* Chap qism (Rasm va Logo) */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-gray-100 overflow-hidden">
        {/* Orqa fon rasmi */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-black/20" />
        {/* Qoramtir gradient (yozuvlar aniq ko'rinishi uchun) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Logo va Tekst */}
        <div className="relative z-10 flex flex-col items-center gap-4 mt-20">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(250,204,21,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-8 h-8">
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
              </svg>
            </div>
            <span className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">KELAJAK UYLAR</span>
          </div>
          <p className="text-white/80 font-medium text-[15px] tracking-wide drop-shadow-sm">
            {lang === "ru" ? "Найдите дом своей мечты вместе с нами" : lang === "en" ? "Find your dream home with us" : "Orzuingizdagi uyni biz bilan toping"}
          </p>
        </div>
      </div>

      {/* O'ng qism (Forma) */}
      <div className="w-full lg:w-1/2 bg-[#1a1b1e] flex flex-col items-center justify-center relative p-4 sm:p-8">
        {/* Dekorativ nuqtalar (Tepa o'ng) */}
        <div className="absolute top-8 right-8 hidden sm:grid grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <div 
              key={`t-${i}`} 
              className="w-1.5 h-1.5 bg-white rounded-full" 
              style={{ animation: `dotScale 1.5s infinite ease-in-out ${i * 0.1}s` }}
            />
          ))}
        </div>
        
        {/* Dekorativ nuqtalar (Pastki chap) */}
        <div className="absolute bottom-8 left-8 hidden sm:grid grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <div 
              key={`b-${i}`} 
              className="w-1.5 h-1.5 bg-white rounded-full" 
              style={{ animation: `dotScale 1.5s infinite ease-in-out ${i * 0.1}s` }}
            />
          ))}
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes dotScale {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.6); opacity: 1; }
          }
        `}} />

        <div className="w-full max-w-[340px] z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-5 h-5">
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">KELAJAK UYLAR</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
            {step === 1 ? t.loginTitle : t.codeLoginTitle}
          </h2>

          <form onSubmit={step === 1 ? handleNext : handleLogin} className="flex flex-col gap-5">
            {step === 1 ? (
              <div>
                <label className="block text-[13px] font-bold text-white mb-2">{t.phoneInput}</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full h-12 bg-transparent border border-gray-600 rounded-xl px-4 text-white font-medium focus:outline-none focus:border-white transition-colors"
                  placeholder="+998 90 123 45 67"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[13px] font-bold text-white mb-2">{t.confirmCode}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-transparent border border-gray-600 rounded-xl px-4 text-white font-medium focus:outline-none focus:border-white transition-colors text-center tracking-widest text-lg"
                  placeholder="****"
                  autoFocus
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
            )}

            {step === 1 && (
              <p className="text-[#a1a1aa] text-[11px] text-center px-4 leading-tight mt-1">
                {t.termsNotice} <a href="/oferta" className="underline hover:text-white transition-colors">{t.footerTerms}</a>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors mt-2"
            >
              {loading ? t.waiting : step === 1 ? t.next : t.loginBtn}
            </button>

            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full h-12 bg-[#2c2d31] text-white font-bold rounded-full hover:bg-[#38393e] transition-colors"
                >
                  {t.guestContinue}
                </button>
                <Link
                  href="/register"
                  className="w-full h-12 flex items-center justify-center bg-transparent border border-[#2c2d31] text-white font-bold rounded-full hover:bg-[#2c2d31] transition-colors"
                >
                  {t.registerBtn}
                </Link>

                <TelegramLoginButton
                  onSuccess={async (phone, name) => {
                    router.push("/");
                  }}
                  onError={(msg) => setError(msg)}
                />
              </>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full h-12 bg-[#2c2d31] text-white font-bold rounded-full hover:bg-[#38393e] transition-colors"
              >
                {t.back}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
