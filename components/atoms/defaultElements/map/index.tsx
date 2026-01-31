"use client";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import "@/lib/fixLeafletIcon";
import { Map, Marker } from "pigeon-maps";
import { useEffect, useState } from "react";
import { IMapProps } from "./type";
import { useDispatch } from "react-redux";
import { setPageData } from "@slice/pages";
import { useAppSelector } from "@redux/index";

const MapComponent = ({ ...props }: IMapProps) => {
  const {
    height = 600,
    defaultCenter = [35.737452, 51.43598],
    onChange,
    defaultZoom = 15,
    config,
  } = props;
  const [location, setLocation] = useState<[number, number]>(defaultCenter);
  const dispatch = useDispatch();
  const initElement = useAppSelector((state) => {
    if (config) {
      const { name } = config;
      return (
        state.withPersist.pages
          .find((item) => item.isActive)
          ?.pageData?.find((element) => element.name === name)?.value ?? null
      );
    }
    return null;
  });
  const handleSetLocation = (latLng: [number, number]) => {
    setLocation(latLng);
    onChange?.(latLng);
    if (config) {
      const {
        caption,
        help,
        name,
        order,
        placeHolder,
        rules,
        type,
        selectEndpoint,
      } = config;
      dispatch(
        setPageData({
          caption,
          help,
          name,
          order,
          placeHolder,
          rules,
          type,
          selectEndpoint,
          value: latLng,
        })
      );
    }
  };
  useEffect(() => {
    if (initElement !== location) {
      setLocation(initElement);
    }
  }, [initElement]);
  return (
    <Map
      height={height}
      defaultCenter={location}
      defaultZoom={defaultZoom}
      onClick={({ latLng }) => handleSetLocation(latLng)}
    >
      <Marker width={50} anchor={location} />
    </Map>
  );
};

export default MapComponent;
