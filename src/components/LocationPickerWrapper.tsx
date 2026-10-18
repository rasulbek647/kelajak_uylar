"use client";

import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

type WrapperProps = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

export default function LocationPickerWrapper(props: WrapperProps) {
  return <LocationPicker {...props} />;
}
