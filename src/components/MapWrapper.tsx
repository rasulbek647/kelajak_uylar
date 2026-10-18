"use client";

import dynamic from "next/dynamic";

const MapWidget = dynamic(() => import("./MapWidget"), { ssr: false });

export default function MapWrapper({ listings }: { listings: any[] }) {
  return <MapWidget listings={listings} />;
}
