"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { YMaps, Map, Clusterer, Placemark, ZoomControl, GeolocationControl } from "@pbe/react-yandex-maps";
import { useRouter } from "next/navigation";

type MapWidgetProps = { listings: any[] };

export default function MapWidget({ listings }: MapWidgetProps) {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultCenter: [number, number] = [41.2995, 69.2401];

  const formatPrice = (price: number, currency: string) => {
    if (!price) return `0 ${currency}`;
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M ${currency}`;
    if (price >= 1_000) return `${Math.round(price / 1_000)}K ${currency}`;
    return `${price.toLocaleString("ru-RU")} ${currency}`;
  };

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const allMarkers = listings.filter((l) => l.lat != null && l.lng != null);

  // Haqiqiy GPS masofasi bo'yicha filtrlash va tartiblash
  let markers = allMarkers;
  if (nearbyOnly && userPos) {
    const closeListings = allMarkers.filter(
      (m) => getDistanceKm(userPos[0], userPos[1], m.lat as number, m.lng as number) <= 15
    );
    if (closeListings.length > 0) {
      markers = closeListings.sort(
        (a, b) =>
          getDistanceKm(userPos[0], userPos[1], a.lat as number, a.lng as number) -
          getDistanceKm(userPos[0], userPos[1], b.lat as number, b.lng as number)
      );
    } else {
      // 15 km ichida bo'lmasa, eng yaqin 10 ta uyni tartiblab ko'rsatish
      markers = [...allMarkers]
        .sort(
          (a, b) =>
            getDistanceKm(userPos[0], userPos[1], a.lat as number, a.lng as number) -
            getDistanceKm(userPos[0], userPos[1], b.lat as number, b.lng as number)
        )
        .slice(0, 10);
    }
  }

  const selected = selectedId ? listings.find(l => l.id === selectedId) || null : null;

  const makeClickHandler = useCallback((id: string) => () => {
    setSelectedId(id);
  }, []);

  const handleNearMe = () => {
    if (nearbyOnly) {
      setNearbyOnly(false);
      setUserPos(null);
      setSelectedId(null);
      try {
        mapRef.current?.setCenter(defaultCenter, 12, { duration: 400 });
      } catch (_) {}
      return;
    }

    if (!navigator.geolocation) {
      alert("Qurilmangizda GPS (joylashuv) xizmati qo'llab-quvvatlanmaydi.");
      return;
    }

    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingLoc(false);
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setNearbyOnly(true);
        try {
          mapRef.current?.setCenter(coords, 14, { duration: 600 });
        } catch (_) {}
      },
      (err) => {
        setLoadingLoc(false);
        if (err.code === 1) {
          alert("Iltimos, brauzeringizda geolokatsiya (GPS) ruxsatini yoqing.");
        } else {
          alert("Joylashuvingizni aniqlab bo'lmadi. GPS signalini tekshiring.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  if (!mounted) {
    return (
      <div className="h-full w-full bg-gray-100 dark:bg-[#111113] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-full w-full bg-gray-100 dark:bg-[#111113] flex items-center justify-center p-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl max-w-sm">
          <p className="font-bold mb-2">Xarita yuklanmadi</p>
          <p className="text-sm">Iltimos, sahifani yangilang yoki internet aloqasini tekshiring.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <YMaps query={{ lang: "uz_UZ" as any }}>
        <Map
          instanceRef={mapRef}
          defaultState={{
            center: defaultCenter,
            zoom: 12,
            controls: []
          }}
          width="100%"
          height="100%"
          onError={() => setMapError(true)}
          options={{
            suppressMapOpenBlock: true,
          }}
        >
          <ZoomControl options={{ position: { right: 10, top: 100 } }} />
          <GeolocationControl options={{ position: { right: 10, bottom: 100 } }} />

          <Clusterer
            options={{
              preset: "islands#yellowClusterIcons",
              groupByCoordinates: false,
              clusterDisableClickZoom: false,
              clusterHideIconOnBalloonOpen: false,
              geoObjectHideIconOnBalloonOpen: false
            }}
          >
            {markers.map((marker) => (
              <Placemark
                key={marker.id}
                geometry={[marker.lat, marker.lng]}
                properties={{
                  hintContent: marker.title,
                  iconContent: formatPrice(marker.price, marker.currency)
                }}
                options={{
                  preset: selectedId === marker.id ? "islands#orangeStretchyIcon" : "islands#yellowStretchyIcon"
                }}
                onClick={makeClickHandler(marker.id)}
              />
            ))}
          </Clusterer>

          {userPos && (
            <Placemark
              geometry={userPos}
              options={{
                preset: "islands#redCircleDotIconWithCaption",
                iconColor: "#ef4444"
              }}
              properties={{
                iconCaption: "Siz shu yerdasiz",
                balloonContent: "📍 Sizning aniqlangan joylashuvingiz"
              }}
            />
          )}
        </Map>
      </YMaps>

      {/* Selected Card */}
      {selected && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] w-[320px] bg-white dark:bg-[#1e1f23] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
          {selected.images?.[0] && (
            <img src={selected.images[0].url} alt={selected.title} className="w-full h-36 object-cover" />
          )}
          <div className="p-4">
            <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{selected.title}</p>
            <p className="text-yellow-500 font-bold text-base mt-1">{formatPrice(selected.price, selected.currency)}</p>
            <p className="text-gray-500 text-xs mt-0.5">{selected.location}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setSelectedId(null)}
                className="flex-1 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-semibold text-sm py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                Yopish
              </button>
              <button
                onClick={() => router.push(`/listing/${selected.id}`)}
                className="flex-1 bg-yellow-400 text-black font-bold text-sm py-2 rounded-xl hover:bg-yellow-500 transition"
              >
                Batafsil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Near me button */}
      <button
        type="button"
        onClick={handleNearMe}
        disabled={loadingLoc}
        className={`absolute bottom-6 right-4 z-[1000] flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm shadow-2xl transition pointer-events-auto ${
          nearbyOnly ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-black text-white hover:bg-gray-800"
        } ${loadingLoc ? "opacity-75 cursor-wait" : ""}`}
      >
        {loadingLoc ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Aniqlanmoqda...</span>
          </>
        ) : nearbyOnly ? (
          "Filterni olib tashlash"
        ) : (
          "📍 Menga yaqin"
        )}
      </button>
    </div>
  );
}
