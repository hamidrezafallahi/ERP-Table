"use client";

import { MainInfoCard } from "@components/molecules/mainInfoCard";
import { useAppSelector } from "@redux/index";
import { shallowEqual } from "react-redux";
import { documentInfoConfig } from "./config";

export default function IssuingProformaInvoice() {
  const { match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );
  return (
    <div
      className={`${
        !match && "h-[calc(100dvh-140px)] overflow-y-auto"
      } flex flex-col gap-3 p-2`}
    >
      <div
        className={`${
          match
            ? "gap-3 grid grid-cols-3 h-[10.313rem] max-h-full"
            : "flex flex-col gap-2"
        }`}
      >
        {documentInfoConfig.map((item, index) => (
          <MainInfoCard temp={item} key={index} titleGroup="title" />
        ))}
      </div>
    </div>
  );
}
