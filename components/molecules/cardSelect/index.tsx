"use client";
import React, { useState } from "react";

import { CustomButton } from "@components/atoms/defaultElements";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CancleIcon,
  TickIcon,
} from "@components/atoms/iconComponents";
import { useMediaQuery } from "@hooks/custom";

import RegisterCheckbox from "./registerCheckbox";
import { ICardProps } from "./type";

function CardSelect({ ...props }: ICardProps) {
  const { item, showCheckbox = false } = props;
  const { match } = useMediaQuery("LGUP");
  const [showDetails, setShowDetails] = useState(false);

  const features = [
    { key: "AccountingSoftware", label: "نرم افزار حسابداری" },
    { key: "SalesSoftware", label: "نرم افزار فروش" },
    { key: "TaxpayerSystem", label: "سامانه مؤدیان" },
    { key: "TreasurySoftware", label: "نرم افزار خزانه داری" },
    { key: "WarehousingSoftware", label: "نرم افزار انبارداری" },
    { key: "PayrollSoftware", label: "نرم افزار حقوق و دستمزد" },
    { key: "PropertyAndAssetSoftware", label: "نرم افزار اموال و دارایی" },
    { key: "ProductionSoftware", label: "نرم افزار تولید" },
  ];

  const shouldShowFeatures = match || showDetails;

  return (
    <article
      className={`flex flex-col rounded-2xl lg:w-[22dvw] overflow-hidden z-10  w-full h-full ${
        !match && !showDetails && "h-[215px] "
      }   text-right relative
         ${!match ? "p-4" : "p-5"}
      
      ${item?.id === 2 ? "bg-main-black/90" : "bg-gray-gray15 "}`}
      dir="rtl"
    >
      {showCheckbox && (
        <RegisterCheckbox
          Active={item?.ActiveCard}
          itemId={item.id}
          itemTitle={item.title}
        />
      )}

      <div
        className={`flex ${
          match
            ? "flex-col gap-2"
            : "flex-row justify-between items-center  overflow-hidden"
        } `}
      >
        <header className="flex flex-col gap-1">
          <h2
            className={`text-2xl font-bold ${showCheckbox && "mr-6"} ${
              item?.id === 2 ? "text-white" : "text-main-black"
            }`}
          >
            {item?.title}
          </h2>
          <p
            className={`lg:text-md  text-sm  ${
              !match && " w-28 xs:w-full overflow-hidden text-ellipsis"
            } text-nowrap ${
              item?.id === 2 ? "text-gray-gray4" : "text-gray-gray7"
            }`}
          >
            {item?.description}
          </p>
        </header>

        <section
          className={`flex flex-col ${
            match ? " justify-start" : "  items-end"
          }  gap-1 lg:py-2 w-52`}
        >
          <div
            className={`flexd flex gap-2 font-bold lg:text-xl  text-md ${
              item?.id === 2 ? "text-white" : "text-gray-gray10"
            }`}
          >
            <span>
              {Number(item?.price).toLocaleString("en-US").replace(/,/g, "/")}
            </span>
            <span>تومان</span>
          </div>
          <p
            className={`lg:text-sm  text-xs ${
              !match &&
              "w-44 xs:w-full overflow-hidden text-ellipsis  text-left"
            }    text-nowrap ${
              item?.id === 2 ? "text-gray-gray4" : "text-gray-gray8"
            }`}
          >
            صورتحساب ماهانه / به ازای هر کاربر
          </p>
        </section>
      </div>

      <div className="flex lg:flex-col flex-col-reverse w-full">
        {!match && (
          <div className="text-center">
            <button
              onClick={() => setShowDetails((prev) => !prev)}
              className="flex justify-center items-center gap-1 mx-auto font-medium text-main-black text-md"
            >
              {showDetails ? (
                <div
                  className={`flex items-center mt-4 ${
                    item?.id === 2 ? "text-white" : "text-main-black"
                  }`}
                >
                  <p>بستن جزئیات</p>

                  {item?.id === 2 ? (
                    <ArrowUpIcon config={{ stroke: "#fff" }} />
                  ) : (
                    <ArrowUpIcon />
                  )}
                </div>
              ) : (
                <div
                  className={`flex items-center ${
                    item?.id === 2 ? "text-white" : "text-main-black"
                  }`}
                >
                  <p>جزئیات بیشتر </p>
                  {item?.id === 2 ? (
                    <ArrowDownIcon config={{ stroke: "#fff" }} />
                  ) : (
                    <ArrowDownIcon />
                  )}
                </div>
              )}
            </button>
          </div>
        )}
        {(shouldShowFeatures || match) && (
          <CustomButton className="bg-blue-button py-6 rounded-lg text-main-white text-md">
            همین الان بخر
          </CustomButton>
        )}

        <section className="py-4">
          <ul className="flex flex-col gap-4 sm:gap-5 transition-all duration-300">
            {(() => {
              const sortedFeatures = [...features].sort((a, b) => {
                const aIsActive = item?.[a.key as keyof typeof item] ? 1 : 0;
                const bIsActive = item?.[b.key as keyof typeof item] ? 1 : 0;
                return bIsActive - aIsActive;
              });

              const visibleFeatures =
                !match && !showDetails
                  ? sortedFeatures.slice(0, 2)
                  : sortedFeatures;

              return visibleFeatures.map((feature) => {
                const isActive = item?.[feature.key as keyof typeof item];
                const isHighlighted = item?.id === 2;
                const textColor = isActive
                  ? isHighlighted
                    ? match
                      ? "text-gray-gray1"
                      : "text-white"
                    : "text-gray-gray95"
                  : isHighlighted
                  ? match
                    ? "text-gray-gray7"
                    : "text-gray-gray8"
                  : "text-gray-gray8";

                return (
                  <li
                    key={feature.key}
                    className="flex justify-start items-center gap-2"
                  >
                    <span aria-hidden="true">
                      {isActive ? (
                        <TickIcon
                          config={
                            isHighlighted ? { stroke: "#fff" } : undefined
                          }
                        />
                      ) : (
                        <CancleIcon />
                      )}
                    </span>
                    <span className={`text-md ${textColor}`}>
                      {feature.label}
                    </span>
                  </li>
                );
              });
            })()}
          </ul>
        </section>
      </div>
    </article>
  );
}

export default CardSelect;
