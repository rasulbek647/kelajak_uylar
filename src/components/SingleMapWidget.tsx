"use client";

import { useState, useEffect } from "react";
import { YMaps, Map, Placemark, FullscreenControl } from "@pbe/react-yandex-maps";

type SingleMapWidgetProps = {
  lat: number;
  lng: number;
  title: string;
  className?: string;
};

export default function SingleMapWidget({
  lat,
  lng,
  title,
  className = "h-64 md:h-[400px] w-full",
}: SingleMapWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-[#1a1b1f] rounded-3xl animate-pulse`}></div>
    );
  }

  if (!lat || !lng) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-[#1a1b1f] rounded-3xl flex items-center justify-center`}>
        <p className="text-xs text-gray-400">Manzil koordinatalari ko&apos;rsatilmagan</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className} rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-white/5 z-0`}>
      <YMaps query={{ lang: "uz_UZ" as any }}>
        <Map
          defaultState={{ center: [lat, lng], zoom: 15, controls: [] }}
          width="100%"
          height="100%"
        >
          <Placemark
            geometry={[lat, lng]}
            properties={{ balloonContent: title }}
            options={{ preset: "islands#yellowDotIcon" }}
          />
          <FullscreenControl />
        </Map>
      </YMaps>
    </div>
  );
}
