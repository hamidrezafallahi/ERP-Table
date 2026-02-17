import MapComponent from "@components/atoms/defaultElements/map";
// import dynamic from "next/dynamic";
import React from "react";

// const MapComponent = dynamic(() => import("./map"), { ssr: false });

export default function MapPage() {
  return (
    <div className="p-8">
      <h1 className="mb-4 font-bold text-xl">نقشه</h1>
      <MapComponent />
    </div>
  );
}
