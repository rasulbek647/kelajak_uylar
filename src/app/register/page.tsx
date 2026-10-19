"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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

// Telefon raqami to'g'riligini tekshirish
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("998") && digits.length === 12;
}

// Parol kuchini hisoblash
function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score++;
  if (password.length >= 12 && /[^a-zA-Z0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3;
}

// Parol talablarini tekshirish
function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
}

export default function RegisterPage() {
  const router = useRouter();
  const { t, lang } = useLang();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("Toshkent");
  const [regionOpen, setRegionOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const REGIONS = [
    "Toshkent",
    "Samarqand",
    "Buxoro",
    "Farg'ona",
    "Andijon",
    "Namangan",
    "Xorazm",
    "Qashqadaryo",
    "Surxondaryo",
    "Navoiy",
    "Jizzax",
    "Sirdaryo",
  ];

  // Tashqariga bosilganda viloyat menyusini yopish
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setRegionOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 6 ta alohida OTP katakchalari
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Telegram bot va sessiya holati
  const [sessionCreated, setSessionCreated] = useState(false);
  const [botLoading, setBotLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Real-vaqt validatsiya xatolari
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const passwordStrength = getPasswordStrength(password);

  const strengthLabel = [
    "",
    t.passwordStrengthWeak,
    t.passwordStrengthMedium,
    t.passwordStrengthStrong,
  ][passwordStrength];

  const strengthColor = ["", "bg-red-500", "bg-yellow-400", "bg-green-500"][passwordStrength];
  const strengthTextColor = ["", "text-red-400", "text-yellow-400", "text-green-400"][passwordStrength];

  // Forma to'g'ri to'ldirilganmi tekshiruvi (Telegram tugmasini faollashtirish uchun)
  const isFormValidForBot =
    name.trim().length > 0 &&
    isValidPhone(phone) &&
    isValidPassword(password) &&
    agreedToTerms;

  // 60 soniyalik qayta yuborish taymeri
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw.startsWith("+998")) {
      setPhone("+998");
      return;
    }
    const formatted = formatPhone(raw);
    setPhone(formatted);
    if (formatted.length > 4 && !isValidPhone(formatted)) {
      setPhoneError(t.phoneInvalidFormat);
    } else {
      setPhoneError("");
    }
  }, [t]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (val.length > 0 && !isValidPassword(val)) {
      setPasswordError(t.passwordTooWeak);
    } else {
      setPasswordError("");
    }
  }, [t]);

  // "Telegram botni ochish" bosilganda
  const handleOpenTelegramBot = async () => {
    if (!isFormValidForBot || botLoading || resendCooldown > 0) return;

    setError("");
    setBotLoading(true);
    setIsExpired(false);

    try {
      const cleanPhone = phone.replace(/\s+/g, "");
      const res = await fetch("/api/otp/telegram-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          lang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || (lang === "ru" ? "Xatolik yuz berdi" : "An error occurred"));
        setBotLoading(false);
        return;
      }

      setSessionCreated(true);
      setResendCooldown(60); // 60 soniya qayta yuborishni kutish

      // 5 daqiqadan so'ng muddati o'tgan deb belgilash
      setTimeout(() => {
        setIsExpired(true);
      }, 5 * 60 * 1000);

      // Telegram botni yangi oynada ochish
      if (data.botUrl) {
        window.open(data.botUrl, "_blank", "noopener,noreferrer");
      }

      // Birinchi katakka fokus berish
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    } catch {
      setError(lang === "ru" ? "Ошибка сети" : lang === "en" ? "Network error" : "Tarmoq xatosi");
    } finally {
      setBotLoading(false);
    }
  };

  // OTP katakchalarini boshqarish
  const handleOtpDigitChange = (index: number, val: string) => {
    const digitsOnly = val.replace(/\D/g, "");
    if (!digitsOnly) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }

    const digit = digitsOnly.slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    // Keyingi katakchaga avtomatik o'tish
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Nusxalangan kodni joylashtirish (Paste)
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtpDigits(updated);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Ro'yxatdan o'tish formasi yuborilganda
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullCode = otpDigits.join("");

    if (!name || fullCode.length !== 6) {
      setError(t.allFieldsRequired);
      return;
    }

    if (!isValidPhone(phone)) {
      setError(t.phoneInvalidFormat);
      return;
    }

    if (!isValidPassword(password)) {
      setError(t.passwordTooWeak);
      return;
    }

    if (!agreedToTerms) {
      setError(t.fillTerms);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\s+/g, ""),
          otpCode: fullCode,
          password,
          region,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message ||
            (lang === "ru" ? "Произошла ошибка" : lang === "en" ? "An error occurred" : "Xatolik yuz berdi")
        );
      } else {
        setSuccess(t.registerSuccess);
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 2000);
      }
    } catch {
      setError(lang === "ru" ? "Ошибка сети" : lang === "en" ? "Network error" : "Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen relative bg-[#1a1b1e] notranslate" translate="no">
      <div className="w-full flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[380px]">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-5 h-5">
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">KELAJAK UYLAR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">{t.registerTitle}</h2>
          <p className="text-gray-400 text-sm text-center mb-6">{t.createAccount}</p>

          {/* Muvaffaqiyat xabari */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center font-medium">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Ism */}
            <div>
              <label className="block text-[13px] font-bold text-white mb-2">{t.name}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 bg-transparent border border-gray-600 rounded-xl px-4 text-white font-medium focus:outline-none focus:border-white transition-colors"
                placeholder={t.namePlaceholder}
                required
              />
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-[13px] font-bold text-white mb-2">{t.phoneInput}</label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className={`w-full h-12 bg-transparent border rounded-xl px-4 text-white font-medium focus:outline-none transition-colors ${
                  phoneError ? "border-red-500 focus:border-red-400" : "border-gray-600 focus:border-white"
                }`}
                placeholder="+998 90 123 45 67"
                inputMode="numeric"
              />
              {phoneError && <p className="text-red-400 text-xs mt-1.5 ml-1">{phoneError}</p>}
            </div>

            {/* Viloyat (Fonga mos maxsus dropdown) */}
            <div className="relative" ref={regionRef}>
              <label className="block text-[13px] font-bold text-white mb-2">{t.region}</label>
              <button
                type="button"
                onClick={() => setRegionOpen((prev) => !prev)}
                className="w-full h-12 bg-[#2c2d31] border border-gray-600 rounded-xl px-4 text-white font-medium flex items-center justify-between focus:outline-none focus:border-yellow-400 hover:border-gray-500 transition-colors cursor-pointer text-left"
              >
                <span>{region}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${regionOpen ? "rotate-180 text-yellow-400" : ""}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {regionOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#2c2d31] border border-gray-600 rounded-xl shadow-2xl overflow-hidden z-50 max-h-56 overflow-y-auto divide-y divide-gray-700/50">
                  {REGIONS.map((r) => {
                    const isSelected = r === region;
                    return (
                      <div
                        key={r}
                        onClick={() => {
                          setRegion(r);
                          setRegionOpen(false);
                        }}
                        className={`px-4 py-3 text-sm font-medium cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-yellow-400/15 text-yellow-400 font-bold"
                            : "text-gray-200 hover:bg-[#38393e] hover:text-white"
                        }`}
                      >
                        <span>{r}</span>
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Parol */}
            <div>
              <label className="block text-[13px] font-bold text-white mb-2">{t.createPassword}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full h-12 bg-transparent border rounded-xl px-4 pr-12 text-white font-medium focus:outline-none transition-colors ${
                    passwordError ? "border-red-500 focus:border-red-400" : "border-gray-600 focus:border-white"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  aria-label={showPassword ? t.passwordHide : t.passwordShow}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Parol kuchi indikatori */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level ? strengthColor : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  {strengthLabel && (
                    <p className={`text-xs ${strengthTextColor}`}>{strengthLabel}</p>
                  )}
                </div>
              )}

              {/* Parol talablari */}
              <p className="text-gray-500 text-xs mt-1.5 ml-1">{t.passwordRequirements}</p>
              {passwordError && <p className="text-red-400 text-xs mt-1 ml-1">{passwordError}</p>}
            </div>

            {/* Oferta Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  agreedToTerms ? "bg-yellow-400 border-yellow-400" : "border-gray-500 group-hover:border-gray-300"
                }`}>
                  {agreedToTerms && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 leading-relaxed">
                <Link href="/oferta" className="text-white hover:underline">{t.termsOfService}</Link>
                {" "}{lang === "ru" ? "и" : lang === "en" ? "and" : "va"}{" "}
                <Link href="/privacy" className="text-white hover:underline">{t.privacyPolicy}</Link>
                {lang === "ru" ? " — ознакомлен и согласен" : lang === "en" ? " — I have read and agree" : "ga roziman"}
              </span>
            </label>

            {/* OTP Bo'limi (Telegram Bot orqali 1-bosish deep link) */}
            <div className="pt-3 border-t border-gray-700/80">
              <label className="block text-[13px] font-bold text-yellow-400 mb-1.5">
                📱 {t.confirmCodeLabel}
              </label>

              {/* Tushuntirish matni */}
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                {sessionCreated ? t.getOtpHintAfter : t.getOtpHintBefore}
              </p>

              {/* Telegram botni ochish tugmasi */}
              <button
                type="button"
                onClick={handleOpenTelegramBot}
                disabled={!isFormValidForBot || botLoading || resendCooldown > 0}
                className={`flex items-center justify-center gap-2 w-full h-11 mb-3 rounded-xl font-semibold text-sm transition-all ${
                  isFormValidForBot && resendCooldown === 0 && !botLoading
                    ? "bg-[#229ED9]/15 border border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9]/25 cursor-pointer shadow-sm shadow-[#229ED9]/10"
                    : "bg-gray-800/60 border border-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {botLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#229ED9]/30 border-t-[#229ED9] rounded-full animate-spin" />
                    {t.waiting}
                  </span>
                ) : resendCooldown > 0 ? (
                  <span>{t.resendWait.replace("{s}", resendCooldown.toString())}</span>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.203-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
                    </svg>
                    <span>{sessionCreated ? t.resendCode : t.openTelegramBot}</span>
                  </>
                )}
              </button>

              {/* 5 daqiqalik amal qilish muddati tugaganlik ogohlantirishi */}
              {isExpired && (
                <div className="mb-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center font-medium">
                  ⚠️ {t.codeExpired}
                </div>
              )}

              {/* 6 ta alohida katakcha */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-13 sm:w-13 sm:h-14 bg-[#2c2d31] border border-gray-600 rounded-xl text-center text-xl sm:text-2xl font-black text-white focus:outline-none focus:border-yellow-400 focus:bg-[#34353a] transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Xato xabarlari */}
            {error && (
              <p className="text-red-400 text-sm text-center font-medium bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                {error}
              </p>
            )}

            {/* Ro'yxatdan o'tish tugmasi */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms || otpDigits.join("").length !== 6}
              className={`w-full h-12 font-bold rounded-full transition-all mt-1 ${
                agreedToTerms && !loading && otpDigits.join("").length === 6
                  ? "bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer shadow-lg shadow-yellow-400/20"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {t.waiting}
                </span>
              ) : (
                t.registerBtn
              )}
            </button>

            {/* Ishonch yozuvi */}
            <p className="text-center text-[11px] text-gray-500 px-4 leading-relaxed">
              🔒 {t.trustNotice}
            </p>

            <Link
              href="/login"
              className="w-full h-12 flex items-center justify-center bg-[#2c2d31] text-white font-bold rounded-full hover:bg-[#38393e] transition-colors"
            >
              {t.alreadyHaveAccount}
            </Link>

            <TelegramLoginButton
              onSuccess={(phone) => {
                router.push(`/login?tg=1&phone=${encodeURIComponent(phone)}`);
              }}
              onError={(msg) => setError(msg)}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
