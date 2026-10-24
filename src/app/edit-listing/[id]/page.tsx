"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { validateListingNumbers, normalizeCurrency } from "@/lib/listing-validation";

const LocationPickerWrapper = dynamic(
  () => import("@/components/LocationPickerWrapper"),
  { ssr: false }
);

const DEAL_TYPES = ["Sotish", "Ijara", "Kunlik ijara"];
const PROPERTY_TYPES = ["Kvartira", "Uy/Hovli", "Xonalar", "Dacha", "Yer uchastkasi", "Tijorat ko'chmas mulki", "Garaj", "Boshqa"];
const AMENITIES_LIST = ["Mebel", "Konditsioner", "Internet", "Muzlatgich", "Kir yuvish mashinasi", "Plita", "Televizor", "Parkovka", "Qo'riqxona", "Lift", "Balkon", "Ombor xonasi"];

const UZBEKISTAN_REGIONS: Record<string, string[]> = {
  "Toshkent sh.": ["Yunusobod", "Mirzo-Ulug'bek", "Shayxontohur", "Olmazor", "Bektemir", "Chilonzor", "Uchtepa", "Yakkasaroy", "Yashnobod", "Sergeli", "Mirobod"],
  "Toshkent vil.": ["Angren", "Bekobod", "Bo'ka", "Bo'stonliq", "Chinoz", "Qibray", "O'rtachirchiq", "Oqoltin", "Parkent", "Piskent", "Quyi Chirchiq", "Yuqori Chirchiq", "Zangiota"],
  "Samarqand vil.": ["Samarqand sh.", "Kattaqo'rg'on", "Bulung'ur", "Ishtixon", "Jomboy", "Narpay", "Nurobod", "Oqdaryo", "Payariq", "Paxtachi", "Qo'shrabot", "Toyloq", "Urgut"],
  "Farg'ona vil.": ["Farg'ona sh.", "Qo'qon", "Marg'ilon", "Oltiariq", "Bag'dod", "Beshariq", "Buvayda", "Dangara", "Furqat", "O'zbekiston", "Quva", "Rishton", "So'x", "Toshloq", "Uchko'prik", "Yozyovon"],
  "Andijon vil.": ["Andijon sh.", "Asaka", "Baliqchi", "Bo'z", "Buloqboshi", "Jalaquduq", "Xo'jaobod", "Izboskan", "Klichev", "Marhamat", "Oltinko'l", "Paxtaobod", "Qo'rg'ontepa", "Shahrixon", "Ulug'nor"],
  "Namangan vil.": ["Namangan sh.", "Chortoq", "Chust", "Kosonsoy", "Mingbuloq", "Norin", "Pop", "To'raqo'rg'on", "Uchqo'rg'on", "Uychi", "Yangiqo'rg'on"],
  "Qashqadaryo vil.": ["Qarshi sh.", "Chiroqchi", "Dehqonobod", "G'uzor", "Kasbi", "Kitob", "Koson", "Mirishkor", "Muborak", "Nishon", "Qamashi", "Shahrisabz", "Yakkabog'"],
  "Surxondaryo vil.": ["Termiz sh.", "Angor", "Bandixon", "Boysun", "Denov", "Jarqo'rg'on", "Muzrabot", "Oltinsoy", "Qiziriq", "Qumqo'rg'on", "Sariosiyo", "Sherobod", "Sho'rchi", "Uzun"],
  "Buxoro vil.": ["Buxoro sh.", "G'ijduvon", "Jondor", "Kogon", "Olot", "Peshku", "Qorako'l", "Qorovulbozor", "Romitan", "Shofirkon", "Vobkent"],
  "Xorazm vil.": ["Urganch sh.", "Bog'ot", "Gurlan", "Xazarasp", "Xiva", "Xonqa", "Shovot", "Tuproqqal'a", "Yangiariq", "Yangibozor"],
  "Navoiy vil.": ["Navoiy sh.", "Karmana", "Konimex", "Navbahor", "Nurota", "Qiziltepa", "Tomdi", "Uchquduq", "Xatirchi"],
  "Jizzax vil.": ["Jizzax sh.", "Arnasoy", "Baxmal", "Do'stlik", "Forish", "G'allaorol", "Mirzacho'l", "Paxtakor", "Yangiobod", "Zarbdor", "Zafarobod", "Zomin"],
  "Sirdaryo vil.": ["Guliston sh.", "Boyovut", "Mirzaobod", "Oqoltin", "Sardoba", "Sayxunobod", "Xovos"],
  "Qoraqalpog'iston": ["Nukus sh.", "Amudaryo", "Beruniy", "Chimboy", "Ellikkala", "Kegeyli", "Mo'ynoq", "Nukus", "Qanliko'l", "Qorao'zak", "Qo'ng'irot", "Shumanay", "Taxtako'pir", "To'rtko'l", "Xo'jayli"],
};

export default function EditListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerType, setOwnerType] = useState<"Rieltor" | "Egasi">("Egasi");
  const [dealType, setDealType] = useState("Sotish");
  const [propertyType, setPropertyType] = useState("Kvartira");
  const [rooms, setRooms] = useState("");
  const [area, setArea] = useState("");
  const [floor, setFloor] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("so'm");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [lat, setLat] = useState<number>(41.2995);
  const [lng, setLng] = useState<number>(69.2401);
  const [showMap, setShowMap] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);

  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Ma'lumotlarni yuklash - auth tayyor bo'lgandan keyin
  useEffect(() => {
    if (!listingId) return;
    if (status === "loading") return; // auth tayyorlanmaguncha kutamiz
    if (status === "unauthenticated") return;

    setIsLoading(true);
    fetch(`/api/listings/${listingId}`, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("API xatosi: " + res.status);
        return res.json();
      })
      .then(data => {
        if (data.listing) {
          const l = data.listing;
          setTitle(l.title || "");
          setDescription(l.description || "");
          setOwnerType(l.ownerType || "Egasi");
          setDealType(l.dealType || "Sotish");
          setPropertyType(l.type || "Kvartira");
          setRooms(l.rooms != null ? String(l.rooms) : "");
          setArea(l.area != null ? String(l.area) : "");
          setPrice(l.price != null ? String(l.price) : "");
          setCurrency(normalizeCurrency(l.currency));
          setAmenities(Array.isArray(l.amenities) ? l.amenities : []);
          if (l.location) {
            const parts = l.location.split(", ");
            setRegion(parts[0] || "");
            setDistrict(parts[1] || "");
          }
          if (l.lat && l.lng) {
            setLat(parseFloat(String(l.lat)));
            setLng(parseFloat(String(l.lng)));
            setShowMap(true);
          }
          if (Array.isArray(l.images)) setExistingImages(l.images);
        } else {
          setError("E'lon topilmadi yoki ruxsat yo'q");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("E'lon ma'lumotlarini yuklab bo'lmadi. Iltimos, sahifani yangilang.");
        setIsLoading(false);
      });
  }, [listingId, status]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const total = existingImages.length + newImages.length + files.length;
    if (total > 10) {
      setError("Ko'pi bilan 10 ta rasm bo'lishi mumkin.");
      return;
    }
    const previews = files.map(f => URL.createObjectURL(f));
    setNewImages(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [...prev, ...previews]);
    setError("");
  };

  const removeExisting = (img: any) => {
    setExistingImages(prev => prev.filter(i => i.id !== img.id));
    setImagesToDelete(prev => [...prev, img.id]);
  };

  const removeNew = (idx: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleAmenity = (a: string) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || String(title).trim() === "") return setError("Sarlavha kiriting");
    if (!price || String(price).trim() === "") return setError("Narx kiriting");
    if (!region) return setError("Viloyat tanlang");
    if (!district) return setError("Tuman/shahar kiriting");
    
    const valResult = validateListingNumbers({ price, currency, area, rooms });
    if (!valResult.valid) {
      return setError(valResult.error || "Maydonlar noto'g'ri to'ldirilgan");
    }
    if (existingImages.length + newImages.length === 0) return setError("Kamida 1 ta rasm qoldiring");

    setSaving(true);
    setError("");

    try {
      // Yangi rasmlarni yuklash
      const uploadedUrls: string[] = [];
      for (const file of newImages) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      }

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: valResult.numPrice,
          currency: valResult.normalizedCurrency,
          location: `${region}, ${district}`,
          rooms: valResult.numRooms,
          area: valResult.numArea,
          type: propertyType,
          dealType,
          ownerType,
          lat,
          lng,
          amenities,
          newImagesUrls: uploadedUrls,
          imagesToDelete,
        }),
      });

      if (res.ok) {
        router.push("/profile");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Xatolik yuz berdi");
      }
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span>Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e1f23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="flex-1 bg-gray-50 dark:bg-[#16171b] text-gray-900 dark:text-white transition-colors pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">E'lonni tahrirlash</h1>
            <p className="text-gray-500 text-sm mt-0.5">Ma'lumotlarni o'zgartirib saqlang</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asosiy ma'lumotlar */}
          <div className="bg-white dark:bg-[#1e1f23] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 dark:text-white">Asosiy ma'lumotlar</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Bitim turi</label>
                <select value={dealType} onChange={e => setDealType(e.target.value)} className={inputClass}>
                  {DEAL_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Ko'chmas mulk turi</label>
                <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className={inputClass}>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Sarlavha *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="Masalan: 3 xonali kvartira, Yunusobod" />
            </div>

            <div>
              <label className={labelClass}>Tavsif</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputClass + " resize-none"} placeholder="E'lon haqida batafsil ma'lumot..." />
            </div>

            <div>
              <label className={labelClass}>Kim tomonidan</label>
              <div className="flex gap-3">
                {(["Egasi", "Rieltor"] as const).map(o => (
                  <button key={o} type="button" onClick={() => setOwnerType(o)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition ${ownerType === o ? "border-yellow-400 bg-yellow-400/10 text-yellow-700 dark:text-yellow-400" : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Xususiyatlar */}
          <div className="bg-white dark:bg-[#1e1f23] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-5">
            <h2 className="font-bold text-gray-900 dark:text-white">Xususiyatlar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Xonalar</label>
                <input type="number" min="1" max="50" value={rooms} onChange={e => setRooms(e.target.value)} className={inputClass} placeholder="3" />
              </div>
              <div>
                <label className={labelClass}>Maydon (m²)</label>
                <input type="number" min="1" value={area} onChange={e => setArea(e.target.value)} className={inputClass} placeholder="75" />
              </div>
              <div>
                <label className={labelClass}>Qavat</label>
                <input type="number" min="1" value={floor} onChange={e => setFloor(e.target.value)} className={inputClass} placeholder="5" />
              </div>
              <div>
                <label className={labelClass}>Jami qavat</label>
                <input type="number" min="1" value={totalFloors} onChange={e => setTotalFloors(e.target.value)} className={inputClass} placeholder="9" />
              </div>
            </div>

            {/* Qulayliklar */}
            <div>
              <label className={labelClass}>Qulayliklar</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {AMENITIES_LIST.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${amenities.includes(a) ? "border-yellow-400 bg-yellow-400 text-black" : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-yellow-500"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Narx */}
          <div className="bg-white dark:bg-[#1e1f23] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Narx</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} style={{flex: '1 1 auto'}} placeholder="Masalan: 15000" />
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClass + " sm:max-w-[140px]"}>
                <option value="so'm">so'm</option>
                <option value="y.e">y.e ($)</option>
              </select>
            </div>
          </div>

          {/* Joylashuv */}
          <div className="bg-white dark:bg-[#1e1f23] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Joylashuv</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Viloyat *</label>
                <select value={region} onChange={e => { setRegion(e.target.value); setDistrict(""); }} className={inputClass}>
                  <option value="">Tanlang...</option>
                  {Object.keys(UZBEKISTAN_REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tuman/shahar *</label>
                {region && UZBEKISTAN_REGIONS[region] ? (
                  <select value={district} onChange={e => setDistrict(e.target.value)} className={inputClass}>
                    <option value="">Tanlang...</option>
                    {UZBEKISTAN_REGIONS[region].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className={inputClass} placeholder="Tuman nomi" />
                )}
              </div>
            </div>

            {/* Xarita */}
            <div>
              <button type="button" onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 text-sm font-semibold hover:underline transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {showMap ? "Xaritani yopish" : "Xaritada belgilash (ixtiyoriy)"}
              </button>
              {showMap && (
                <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10" style={{ height: 300 }}>
                  <LocationPickerWrapper lat={lat} lng={lng} onChange={(newLat: number, newLng: number) => { setLat(newLat); setLng(newLng); }} />
                </div>
              )}
            </div>
          </div>

          {/* Rasmlar */}
          <div className="bg-white dark:bg-[#1e1f23] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Rasmlar</h2>
            <p className="text-xs text-gray-500">Ko'pi bilan 10 ta rasm. Birinchi rasm asosiy rasm bo'ladi.</p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {/* Mavjud rasmlar */}
              {existingImages.map((img, idx) => {
                const isMain = idx === 0;
                return (
                  <div key={img.id} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${isMain ? "border-blue-500" : "border-green-400"}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExisting(img)}
                      className="absolute top-1 right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className={`absolute bottom-0 left-0 right-0 text-white text-[9px] text-center py-0.5 font-bold ${isMain ? "bg-blue-500/90" : "bg-green-500/80"}`}>
                      {isMain ? "Asosiy rasm (Mavjud)" : "Mavjud"}
                    </div>
                  </div>
                );
              })}

              {/* Yangi rasmlar */}
              {newImagePreviews.map((src, idx) => {
                const isMain = existingImages.length === 0 && idx === 0;
                return (
                  <div key={`new-${idx}`} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${isMain ? "border-blue-500" : "border-yellow-400"}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNew(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className={`absolute bottom-0 left-0 right-0 text-black text-[9px] text-center py-0.5 font-bold ${isMain ? "bg-blue-500/90 text-white" : "bg-yellow-400/80"}`}>
                      {isMain ? "Asosiy rasm (Yangi)" : "Yangi"}
                    </div>
                  </div>
                );
              })}

              {/* Rasm qo'shish tugmasi */}
              {existingImages.length + newImages.length < 10 && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center gap-1 hover:border-yellow-400 hover:bg-yellow-400/5 transition text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-[10px] font-semibold">Qo'shish</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
          </div>

          {/* Xatolik */}
          {error && (
            <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-4 text-yellow-400 dark:text-red-400 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Saqlash tugmasi */}
          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
              Bekor qilish
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-bold transition disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Saqlanmoqda...
                </>
              ) : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
