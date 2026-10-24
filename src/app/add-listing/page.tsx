"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { UZBEKISTAN_REGIONS } from "@/data/uzbekistan";
import AudioRecorder from "@/components/AudioRecorder";
import { useLang } from "@/components/LangProvider";
import { validateListingNumbers } from "@/lib/listing-validation";

const LocationPickerWrapper = dynamic(
  () => import("@/components/LocationPickerWrapper"),
  { ssr: false }
);

export default function AddListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLang();

  // Wizard qadamlari
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<"seller" | "buyer" | null>(null);
  const [selectedDealType, setSelectedDealType] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerType, setOwnerType] = useState<"Rieltor" | "Egasi">("Rieltor");
  const [condition, setCondition] = useState<"Ikkinchi qo'l" | "Yangi bino">("Yangi bino");
  const [phone, setPhone] = useState("+998");

  const [rooms, setRooms] = useState("");
  const [area, setArea] = useState("");
  const [renovation, setRenovation] = useState("");
  const [floor, setFloor] = useState("");
  const [totalFloors, setTotalFloors] = useState("");

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("so'm");

  const [country, setCountry] = useState("O'zbekiston");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [lat, setLat] = useState<number>(41.2995);
  const [lng, setLng] = useState<number>(69.2401);
  const [showMap, setShowMap] = useState(false);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioObjectUrl, setAudioObjectUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 10) {
        setError("Ko'pi bilan 10 ta rasm yuklash mumkin.");
        return;
      }
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...filesArray]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setError("");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError("Kamida 1 ta rasm yuklang");
      return;
    }
    if (!title || !price || !area || !rooms || !region || !district) {
      setError("Barcha majburiy maydonlarni to'ldiring");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];
      for (const file of images) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      }

      let uploadedAudioUrl: string | null = null;
      if (audioBlob) {
        const audioFormData = new FormData();
        audioFormData.append("audio", audioBlob, "voice.webm");
        const audioRes = await fetch("/api/upload-audio", {
          method: "POST",
          body: audioFormData,
        });
        const audioData = await audioRes.json();
        if (audioData.url) uploadedAudioUrl = audioData.url;
      }

      const finalLocation = `${region}, ${district}`;
      const extraDetails: string[] = [];
      if ((selectedType || "Kvartira") === "Kvartira" && condition && condition.trim()) {
        extraDetails.push(`Kvartira turi: ${condition.trim()}`);
      }
      if (renovation && renovation.trim()) {
        extraDetails.push(`Ta'mir: ${renovation.trim()}`);
      }
      if (floor && totalFloors) {
        extraDetails.push(`Qavat: ${floor}/${totalFloors}`);
      } else if (floor) {
        extraDetails.push(`Qavat: ${floor}`);
      }
      if (phone && phone.trim()) {
        extraDetails.push(`Telefon: ${phone.trim()}`);
      }

      const baseDesc = (description || "").trim();
      const finalDescription = extraDetails.length > 0
        ? (baseDesc ? `${baseDesc}\n---\n${extraDetails.join("\n")}` : extraDetails.join("\n"))
        : baseDesc;

      const listingData = {
        title,
        description: finalDescription,
        price: parseFloat(price),
        currency,
        location: finalLocation,
        rooms: parseInt(rooms),
        area: parseFloat(area),
        type: selectedType || "Kvartira",
        dealType: selectedDealType || "Sotish",
        ownerType,
        lat,
        lng,
        audioUrl: uploadedAudioUrl,
        images: uploadedUrls,
        amenities,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingData),
      });

      if (res.ok) {
        router.push("/profile");
      } else {
        const data = await res.json();
        setError(data.message || "Xatolik yuz berdi");
      }
    } catch (err) {
      setError("Tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") return <div className="min-h-screen bg-gray-50 dark:bg-[#16171b] flex items-center justify-center text-gray-900 dark:text-white">Yuklanmoqda...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16171b] text-gray-900 dark:text-white font-sans pb-20 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Orqaga + sarlavha */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (step === 1) router.push("/");
              else if (step === 2) setStep(1);
              else setStep(2);
            }}
            className="inline-flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg hover:opacity-80 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {t.back}
          </button>
          <h1 className="text-2xl font-bold mt-4">{t.addListing}</h1>
        </div>

        {/* QADAM 1: Sotuvchi/Xaridor */}
        {step === 1 && (
          <div className="space-y-1 max-w-sm">
            <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-4 ml-2">
              {lang === "ru" ? "Как продавец" : lang === "en" ? "As a seller" : "Sotuvchi sifatida"}
            </p>
            {[
              { 
                label: lang === "ru" ? "Сдам посуточно" : lang === "en" ? "Rent out daily" : "Kunlik ijaraga beraman", 
                dealType: "Kunlik ijara", 
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> 
              },
              { 
                label: lang === "ru" ? "Сдам в аренду" : lang === "en" ? "Rent out" : "Ijaraga beraman", 
                dealType: "Ijara", 
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> 
              },
              { 
                label: lang === "ru" ? "Продам" : lang === "en" ? "Sell" : "Sotaman", 
                dealType: "Sotish", 
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959s-.186.676-.401.959c-.221.29-.349.634-.349 1.003 0 1.036 1.007 1.875 2.25 1.875s2.25-.84 2.25-1.875c0-.369-.128-.713-.349-1.003-.215-.283-.401-.604-.401-.959Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12h-9m1.5-3h6M12 15h.01" /></svg> 
              },
            ].map(opt => (
              <button
                key={opt.dealType}
                onClick={() => { setSelectedRole("seller"); setSelectedDealType(opt.dealType); setStep(2); }}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition text-left group"
              >
                <div className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition">
                  {opt.icon}
                </div>
                <span className="font-semibold text-[15px] text-gray-900 dark:text-white">{opt.label}</span>
              </button>
            ))}

            <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-4 mt-8 ml-2">
              {lang === "ru" ? "Как покупатель" : lang === "en" ? "As a buyer" : "Xaridor sifatida"}
            </p>
            {[
              { 
                label: lang === "ru" ? "Сниму в аренду" : lang === "en" ? "Rent" : "Ijaraga olaman", 
                dealType: "Ijara", 
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              },
              { 
                label: lang === "ru" ? "Куплю" : lang === "en" ? "Buy" : "Sotib olaman", 
                dealType: "Sotish", 
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959s-.186.676-.401.959c-.221.29-.349.634-.349 1.003 0 1.036 1.007 1.875 2.25 1.875s2.25-.84 2.25-1.875c0-.369-.128-.713-.349-1.003-.215-.283-.401-.604-.401-.959Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12h-9m1.5-3h6M12 15h.01" /></svg> 
              },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => { setSelectedRole("buyer"); setSelectedDealType(opt.dealType); setStep(2); }}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition text-left group"
              >
                <div className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition">
                  {opt.icon}
                </div>
                <span className="font-semibold text-[15px] text-gray-900 dark:text-white">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* QADAM 2: Mulk turi */}
        {step === 2 && (
          <div className="space-y-1 max-w-sm">
            {[
              { 
                label: t.apartment, 
                type: "Kvartira", 
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg> 
              },
              { 
                label: t.house, 
                type: "Hovli uy", 
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> 
              },
              { 
                label: t.commercial, 
                type: "Tijorat joyi", 
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg> 
              },
              { 
                label: t.office, 
                type: "Ofis", 
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg> 
              },
              { 
                label: t.land, 
                type: "Yer uchastkasi", 
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5M12 3v18" /></svg> 
              },
            ].map(opt => (
              <button
                key={opt.type}
                onClick={() => { setSelectedType(opt.type); setStep(3); }}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition text-left group"
              >
                <div className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition">
                  {opt.icon}
                </div>
                <span className="font-semibold text-[15px] text-gray-900 dark:text-white">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* QADAM 3: Asosiy form */}
        {step === 3 && (
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
            <span>{selectedDealType === "Sotish" ? t.dealSale : selectedDealType === "Ijara" ? t.dealRent : selectedDealType === "Kunlik ijara" ? t.dealDaily : selectedDealType}</span>
            <span>&gt;</span>
            <span>{selectedType === "Kvartira" ? t.apartment : selectedType === "Hovli uy" ? t.house : selectedType === "Yer uchastkasi" ? t.land : selectedType === "Ofis" ? t.office : selectedType === "Tijorat joyi" ? t.commercial : selectedType}</span>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Rasmlar */}
          <div className="bg-white dark:bg-[#1a1b1f] rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.photos}</h2>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{images.length}/10</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t.photosNotice}</p>
            
            <div className="flex flex-wrap gap-4">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative w-32 h-32 rounded-2xl overflow-hidden group border border-gray-200 dark:border-white/10">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition hover:bg-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  {idx === 0 && <span className="absolute bottom-2 left-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-md">{t.mainPhoto}</span>}
                </div>
              ))}
              {images.length < 10 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-[#1f2229] border border-transparent hover:border-gray-300 dark:hover:border-white/10 flex flex-col items-center justify-center gap-2 transition cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 dark:text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                </button>
              )}
            </div>
            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
          </div>

          {/* Sarlavha & Tavsif & Audio */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.listingTitle}</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder={t.titlePlaceholder}
                className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white font-medium transition-colors shadow-sm dark:shadow-none" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-800 dark:text-white">{t.descriptionLabel}</label>
                <span className="text-gray-500 dark:text-gray-400 text-xs">{description.length}/1000</span>
              </div>
              <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 1000))} required placeholder={t.descriptionPlaceholder} rows={4}
                className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white font-medium transition-colors resize-none shadow-sm dark:shadow-none" />
            </div>

            <AudioRecorder
              onAudioReady={(blob, url) => {
                setAudioBlob(blob);
                setAudioObjectUrl(url);
              }}
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 pt-4">
            
            {/* 1-ustun */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.whoPosted}</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setOwnerType("Rieltor")} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition ${ownerType === "Rieltor" ? "bg-yellow-400 text-black shadow-md" : "bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>{t.realtor}</button>
                  <button type="button" onClick={() => setOwnerType("Egasi")} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition ${ownerType === "Egasi" ? "bg-yellow-400 text-black shadow-md" : "bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>{t.ownerChoice}</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.apartmentType}</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setCondition("Ikkinchi qo'l")} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition ${condition === "Ikkinchi qo'l" ? "bg-yellow-400 text-black shadow-md" : "bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>{t.secondary}</button>
                  <button type="button" onClick={() => setCondition("Yangi bino")} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition ${condition === "Yangi bino" ? "bg-yellow-400 text-black shadow-md" : "bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>{t.newBuilding}</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.phoneTitle}</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 font-bold text-gray-900 dark:text-white transition-colors shadow-sm dark:shadow-none" />
              </div>
            </div>

            {/* 2-ustun */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.roomsCount}</label>
                <input type="number" min="1" value={rooms} onChange={(e) => setRooms(e.target.value)} required placeholder={t.roomsPlaceholder}
                  className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white font-medium transition-colors shadow-sm dark:shadow-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.areaSqm}</label>
                <input type="number" min="1" value={area} onChange={(e) => setArea(e.target.value)} required placeholder={t.areaPlaceholder}
                  className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white font-medium transition-colors shadow-sm dark:shadow-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.renovation}</label>
                <div className="relative">
                  <select value={renovation} onChange={(e) => setRenovation(e.target.value)}
                    className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 text-gray-900 dark:text-white font-medium appearance-none transition-colors shadow-sm dark:shadow-none">
                    <option value="" disabled className="text-gray-400 dark:text-gray-500">{t.chooseRenovation}</option>
                    <option value="Yevrota'mir">{t.euroRenovation}</option>
                    <option value="O'rtacha">{t.mediumRenovation}</option>
                    <option value="Ta'mirsiz">{t.noRenovation}</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute right-4 top-4 text-gray-400 dark:text-gray-500 pointer-events-none"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.floor}</label>
                <input type="number" min="1" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder={t.floorPlaceholder}
                  className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white font-medium transition-colors shadow-sm dark:shadow-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.totalFloors}</label>
                <input type="number" min="1" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} placeholder={t.totalFloorsPlaceholder}
                  className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white font-medium transition-colors shadow-sm dark:shadow-none" />
              </div>
            </div>

            {/* 3-ustun */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.price}</label>
                <div className="flex bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-transparent rounded-2xl items-center pr-2 focus-within:ring-2 focus-within:ring-yellow-400 dark:focus-within:ring-1 dark:focus-within:ring-white/20 transition-colors shadow-sm dark:shadow-none">
                  <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder={t.pricePlaceholder}
                      className="w-full bg-transparent px-4 py-3.5 border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white font-medium" />
                  <div className="flex rounded-xl p-1 gap-1 shrink-0 bg-gray-100 dark:bg-[#282b33]">
                    <button type="button" onClick={() => setCurrency("so'm")} className={`px-4 py-2.5 rounded-lg font-bold text-xs transition ${currency === "so'm" ? "bg-yellow-400 text-black shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                      {currency === "so'm" ? "✓ so'm" : "so'm"}
                    </button>
                    <button type="button" onClick={() => setCurrency("y.e")} className={`px-4 py-2.5 rounded-lg font-bold text-xs transition ${currency === "y.e" ? "bg-yellow-400 text-black shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                      {currency === "y.e" ? "✓ y.e" : "y.e"}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.country}</label>
                <div className="relative">
                  <select value={country} onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 text-gray-900 dark:text-white font-medium appearance-none transition-colors shadow-sm dark:shadow-none">
                    <option value="O'zbekiston">{lang === "ru" ? "Узбекистан" : lang === "en" ? "Uzbekistan" : "O'zbekiston"}</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute right-4 top-4 text-gray-400 dark:text-gray-500 pointer-events-none"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.region}</label>
                <div className="relative">
                  <select value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(""); }} required
                    className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 text-gray-900 dark:text-white font-medium appearance-none transition-colors shadow-sm dark:shadow-none">
                    <option value="" disabled className="text-gray-400 dark:text-gray-500">{t.region}</option>
                    {Object.keys(UZBEKISTAN_REGIONS).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute right-4 top-4 text-gray-400 dark:text-gray-500 pointer-events-none"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.district}</label>
                <div className="relative">
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} required disabled={!region}
                    className="w-full bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-none px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-1 dark:focus:ring-white/20 text-gray-900 dark:text-white font-medium appearance-none transition-colors shadow-sm dark:shadow-none disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-[#1a1b1f] disabled:cursor-not-allowed">
                    <option value="" disabled className="text-gray-400 dark:text-gray-500">{t.district}</option>
                    {region && UZBEKISTAN_REGIONS[region]?.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute right-4 top-4 text-gray-400 dark:text-gray-500 pointer-events-none"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </div>

            </div>
          </div>

          {/* Xarita */}
          <div className="pt-4">
            <label className="block text-sm font-bold text-gray-800 dark:text-white mb-2">{t.locationOptional}</label>
            {!showMap ? (
              <div 
                onClick={() => setShowMap(true)}
                className="bg-white dark:bg-[#1f2229] border border-gray-200 dark:border-transparent rounded-2xl p-6 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282b33] group flex justify-between items-center shadow-sm dark:shadow-none"
              >
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t.addLocation}</h3>
                  <ul className="text-gray-500 dark:text-gray-400 text-xs font-medium space-y-1 list-disc pl-4">
                    <li>{t.locationTip1}</li>
                    <li>{t.locationTip2}</li>
                  </ul>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 dark:text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5-7.5" /></svg>
              </div>
            ) : (
              <div className="space-y-4">
                <LocationPickerWrapper 
                  lat={lat} 
                  lng={lng} 
                  onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowMap(false)}
                  className="text-yellow-500 hover:text-yellow-400 dark:hover:text-red-400 font-bold text-sm transition-colors"
                >
                  {t.removeMap}
                </button>
              </div>
            )}
          </div>

          {/* Qulayliklar */}
          <div className="bg-white dark:bg-[#1a1b1f] rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-colors">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.amenities}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: "Gaz", label: t.amenityGas },
                { key: "Suv", label: t.amenityWater },
                { key: "Svet", label: t.amenityElec },
                { key: "Internet/WiFi", label: t.amenityInternet },
                { key: "Konditsioner", label: t.amenityAc },
                { key: "Mebel", label: t.amenityFurniture },
                { key: "Avtoturargoh", label: t.amenityParking },
                { key: "Isitish tizimi", label: t.amenityHeating },
              ].map(am => (
                <label key={am.key} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${amenities.includes(am.key) ? "bg-yellow-400 border-yellow-400 text-black" : "border-gray-300 dark:border-gray-600 group-hover:border-yellow-400"}`}>
                    {amenities.includes(am.key) && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" /></svg>}
                  </div>
                  <input type="checkbox" className="hidden" checked={amenities.includes(am.key)}
                    onChange={(e) => {
                      if (e.target.checked) setAmenities([...amenities, am.key]);
                      else setAmenities(amenities.filter(a => a !== am.key));
                    }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium select-none">{am.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-yellow-50 dark:bg-yellow-500/10 text-yellow-400 dark:text-red-400 px-4 py-3 rounded-xl font-bold text-sm border border-yellow-200 dark:border-yellow-500/20">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 pb-10">
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full sm:w-auto px-12 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold py-4 rounded-full text-base transition disabled:opacity-50 shadow-md"
            >
              {saving ? t.submitting : t.submitReady}
            </button>
          </div>
        </form>
        </div>
        )}
      </div>
    </div>
  );
}

