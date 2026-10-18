"use client";

import { useState, useEffect, useRef } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";

type LocationPickerProps = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [locating, setLocating] = useState(false);
  
  const safeLat = lat || 41.2995; // Toshkent markazi
  const safeLng = lng || 69.2401;

  const [position, setPosition] = useState<[number, number]>([safeLat, safeLng]);
  const mapRef = useRef<any>(null);
  const ymapsRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Qidiruv state'lari
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // window.ymaps tayyor bo'lguncha kutib, ymapsRef ga saqlaymiz
    const interval = setInterval(() => {
      const ymaps = (window as any).ymaps;
      if (ymaps && ymaps.geocode) {
        ymapsRef.current = ymaps;
        setMapReady(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onChange(position[0], position[1]);
  }, [position]);

  const handleMapClick = (e: any) => {
    const coords = e.get("coords");
    setPosition([coords[0], coords[1]]);
  };

  const handleSearch = async (e?: any) => {
    if (e?.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      // O'zimizning API orqali Yandex Geocoder'ga yuzlanamiz
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery + ", O'zbekiston")}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Geocoding failed");
      }

      // Yandex formatidan natijalarni ajratib olamiz
      const featureMember = data.response?.GeoObjectCollection?.featureMember || [];
      
      if (featureMember.length === 0) {
        alert("Manzil topilmadi. Yirikroq mo'ljalni (masalan: Xiva, Istiqbol) yozing yoki xaritadan o'zingiz belgilang.");
        setSearchResults([]);
      } else {
        const results = featureMember.map((item: any) => {
          const obj = item.GeoObject;
          // Yandex koordinatalarni "lon lat" (string) shaklida qaytaradi
          const [lon, lat] = obj.Point.pos.split(" ").map(parseFloat);
          return {
            name: obj.name,
            description: obj.description,
            coords: [lat, lon],
          };
        });
        setSearchResults(results);
      }
    } catch (err: any) {
      console.error("Geocode error:", err);
      if (err.message?.includes("Invalid api key") || err.message?.includes("403")) {
        alert("API kalit yaratildi, lekin Yandex uni faollashtirishi uchun 10-15 daqiqa vaqt ketadi. Iltimos, birozdan so'ng qayta urinib ko'ring.");
      } else {
        alert("Qidiruvda xatolik yuz berdi. Iltimos birozdan so'ng urinib ko'ring.");
      }
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (resObj: any) => {
    const newPos: [number, number] = [resObj.coords[0], resObj.coords[1]];
    setPosition(newPos);
    if (mapRef.current) {
      mapRef.current.setCenter(newPos, 17, { duration: 300 });
    }
    setSearchResults([]);
    setSearchQuery(`${resObj.name}${resObj.description ? ", " + resObj.description : ""}`);
  };

  const handleFindMe = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          if (mapRef.current) {
            mapRef.current.setCenter(newPos, 15, { duration: 300 });
          }
          setLocating(false);
        },
        (err) => {
          setLocating(false);
          alert("Joylashuvni aniqlab bo'lmadi. Iltimos, xaritadan o'zingiz belgilang.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocating(false);
      alert("Brauzeringiz joylashuvni aniqlashni qo'llab-quvvatlamaydi.");
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1, { duration: 200 });
    }
  };

  if (!mounted) return <div className="h-48 md:h-[400px] w-full bg-gray-100 dark:bg-[#1a1b1f] rounded-2xl animate-pulse"></div>;

  return (
    <div className="relative h-[400px] md:h-[450px] w-full rounded-2xl overflow-hidden z-0 shadow-sm border border-gray-200 dark:border-white/5">
      {/* O'zimizning chiroyli qidiruv panelimiz */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:w-[350px] z-[1000]">
        <div className="relative bg-white dark:bg-[#1a1b1f] rounded-xl shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden flex items-center">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch(e as any);
              }
            }}
            placeholder="Manzilni qidiring..." 
            className="w-full bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white outline-none placeholder-gray-400"
          />
          <button 
            type="button" 
            onClick={handleSearch}
            className="px-4 text-gray-400 hover:text-yellow-500 transition"
          >
            {searching ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            )}
          </button>
        </div>

        {/* Qidiruv natijalari */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white dark:bg-[#1a1b1f] rounded-xl shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden max-h-60 overflow-y-auto">
            {searchResults.map((res, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectResult(res)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition border-b border-gray-100 dark:border-white/5 last:border-0 text-sm"
              >
                <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">{res.name}</div>
                {res.description && <div className="text-gray-500 text-xs line-clamp-1 mt-0.5">{res.description}</div>}
              </button>
            ))}
          </div>
        )}
      </div>

      <YMaps query={{ lang: "uz_UZ" as any, apikey: "e23e82ad-6265-468a-ab56-837ff2e621f3", load: "package.full" }}>
        <Map
          onLoad={(ymaps) => { 
            ymapsRef.current = ymaps; 
            setMapReady(true);
          }}
          defaultState={{ center: [safeLat, safeLng], zoom: 12, controls: [] }}
          onClick={handleMapClick}
          instanceRef={(ref) => { if (ref) mapRef.current = ref; }}
          width="100%"
          height="100%"
          options={{ suppressMapOpenBlock: true }}
        >
          <Placemark 
            geometry={position} 
            options={{
              preset: 'islands#yellowDotIcon'
            }}
          />
        </Map>
      </YMaps>

      <div className="absolute bottom-4 left-4 z-[1000]">
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); handleZoomIn(); }}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg transition"
        >
          Kattalashtirish
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000]">
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); handleFindMe(); }}
          disabled={locating}
          className="bg-black dark:bg-[#1a1b1f] hover:bg-gray-900 dark:hover:bg-black text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition disabled:opacity-70 border border-transparent dark:border-white/10"
        >
          {locating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L21 3l-7.5 18-3.375-7.125L3 10.5z" />
            </svg>
          )}
          {locating ? "Qidirilmoqda..." : "Menga yaqin"}
        </button>
      </div>
    </div>
  );
}
