"use client";

import dynamic from "next/dynamic";

const SingleMapWidget = dynamic(() => import("./SingleMapWidget"), { ssr: false });

type WrapperProps = {
  lat: number;
  lng: number;
  title: string;
  className?: string;
};

export default function SingleMapWidgetWrapper(props: WrapperProps) {
  return <SingleMapWidget {...props} />;
}
