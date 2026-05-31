import React, { useState } from 'react';

import { Drawer } from 'antd';
import { DrawerProps } from 'antd/lib';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { CustomButton } from '@components/atoms/defaultElements';
import {
  CheckOutlinedIcon,
  CloseModalIcon,
  MenuDrawerIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import {
  durations,
  packagesData,
} from './type';

export default function ChangePackage() {
  const [selectedDuration, setSelectedDuration] = useState(durations[0]);
  const [selectedPackage, setSelectedPackage] = useState<"pro" | string>("pro");
  const [height, setHeight] = useState<number>(120);
  const [placement] = useState<DrawerProps["placement"]>("bottom");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const toggleHeight = () => {
    setIsExpanded((prev) => !prev);

    setHeight((prevHeight) => (prevHeight === 120 ? 235 : 120));
  };
  const t = useTranslations();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);

  // آکاردئون موبایل: card بازشده
  const [openMobileKey, setOpenMobileKey] = useState<string | null>(null);
  // آکاردئون موبایل برای «پکیج فعلی»
  const [openCurrentMobile, setOpenCurrentMobile] = useState(false);

  const formatCurrency = (value: number, separator: string = ".") => {
    const str = value.toString();
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  return (
    <section>
      {/* ---------- پکیج فعلی ---------- */}
      <h3
        className={` ${
          match ? " text-md " : "text-xs"
        } text-main-black font-medium dark:text-gray-gray1`}
      >
        {t("general.actualpackage")}
      </h3>

      <div
        className={`
            border p-3 mb-2
            sm:border-[3px] sm:px-5 sm:py-4 sm:mb-4 scrollbar-hide
         bg-gray-gray1 dark:bg-gray-gray11 mt-2 dark:border-gray-gray8 border-gray-gray6 rounded-2xl w-full`}
      >
        <div
          className={`flex justify-between w-full sm:gap-4
           mb-2`}
        >
          <div className="flex sm:flex-col sm:gap-2 w-fit sm:w-1/2">
            <div className="flex items-center gap-1 sm:gap-2 text-nowrap">
              <h5 className="font-medium text-main-black text-md dark:text-gray-gray1 sm:text-2xl">
                {packagesData.elite.title}
              </h5>
              <p className="font-medium text-2xs text-gray-gray95 dark:text-gray-gray1 sm:text-xs">
                {t("general.expiryDate")}
                {packagesData.elite.date}
              </p>
            </div>
            <p className="hidden sm:block text-2xs text-gray-gray10 dark:text-gray-gray1">
              {packagesData.elite.subtitle}- {packagesData.elite.period}
            </p>
          </div>

          <div className="flex flex-col sm:gap-2 w-fit sm:w-1/2 text-left">
            <div className="flex justify-end items-center gap-1 sm:gap-4">
              <p className="font-medium text-2xs text-main-black dark:text-gray-gray1 sm:text-sm">
                {packagesData.elite.period}
              </p>
              <p className="flex gap-1 font-medium text-main-black dark:text-gray-gray1 text-sm sm:text-2xl text-ellipsis text-nowrap">
                {formatCurrency(packagesData.elite.price, "/")}
                {t("general.toman")}
              </p>
            </div>

            <div className="hidden sm:flex justify-end items-center gap-3 text-gray-gray10 dark:text-gray-gray1 text-xs text-nowrap">
              <p>{packagesData.elite.description}</p>
              {formatCurrency(packagesData.elite.price, "/")}{" "}
              {t("general.toman")}
            </div>
          </div>
        </div>
        <div className="sm:hidden flex justify-between items-center w-full text-2xs text-gray-gray10 dark:text-gray-gray1 sm:text-xs text-nowrap">
          <p>{packagesData.elite.description}</p>
          {formatCurrency(packagesData.elite.price, "/")} {t("general.toman")}
        </div>
        {/* دکمه باز/بسته در موبایل */}
        <div className="flex justify-end mt-5 w-full text-left">
          <button
            type="button"
            onClick={() => setOpenCurrentMobile((v) => !v)}
            className="sm:hidden flex items-center gap-1 sm:gap-2 mt-1 font-medium text-gray-gray10 dark:text-gray-gray1 text-xs"
          >
            {openCurrentMobile ? (
              <>
                {t("general.closeDetails")}
                <UpOutlined className="text-3xs" />
              </>
            ) : (
              <>
                {t("general.viewDetails")}
                <DownOutlined className="text-3xs" />
              </>
            )}
          </button>
        </div>

        {/* ویژگی‌ها: در دسکتاپ همیشه نمایش، در موبایل فقط وقتی باز است */}
        <div className="hidden sm:flex flex-wrap gap-x-6 sm:gap-x-8 sm:gap-y-3 mt-2 sm:mt-3">
          {packagesData.elite.features.map(({ name, enabled }, i) => (
            <div key={i} className="flex items-center gap-1">
              {enabled ? (
                <CheckOutlinedIcon />
              ) : (
                <CheckOutlinedIcon config={{ stroke: "#b1b1b1" }} />
              )}
              <span
                className={`sm:text-sm text-xs  dark:text-gray-gray1 ${
                  !enabled ? "text-gray-gray7  " : "text-gray-gray9 "
                }`}
              >
                {name}
              </span>
            </div>
          ))}
        </div>

        {/* نسخه موبایلِ ویژگی‌ها (آکاردئون) */}
        {openCurrentMobile && (
          <div className="sm:hidden grid grid-cols-2 mt-3 text-xs">
            {packagesData.elite.features.map(({ name, enabled }, i) => (
              <div
                key={i}
                className={`  ${
                  !match && "h-6"
                } flex items-center text-xs gap-1`}
              >
                <div className="w-5">
                  {enabled ? (
                    <CheckOutlinedIcon config={{ width: 13, height: 13 }} />
                  ) : (
                    <CheckOutlinedIcon
                      config={{ width: 13, height: 13, stroke: "#b1b1b1" }}
                    />
                  )}
                </div>
                <span
                  className={`sm:text-sm text-xs dark:text-gray-gray1 w-fit overflow-hidden text-ellipsis text-nowrap  ${
                    !enabled ? "text-gray-gray7 " : "text-gray-gray9 "
                  }`}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- انتخاب بازه ---------- */}
      <div
        className="flex justify-start gap-x-4 mb-3 pt-4 border-gray-gray55 border-t overflow-auto scrollbar-hide"
        style={{
          borderStyle: "solid",
          borderImage: `repeating-linear-gradient(
            90deg, #d9d9d9 0 10px, transparent 10px 20px
          ) 1`,
        }}
      >
        {durations.map((dur) => (
          <button
            key={dur}
            onClick={() => setSelectedDuration(dur)}
            style={{ border: "1px solid #767676" }}
            className={`dark:text-gray-gray5  rounded sm:text-sm text-xs sm:font-medium h-9 sm:w-24 w-fit sm:px-3 px-4 text-nowrap ${
              selectedDuration === dur
                ? "bg-gray-gray9 text-gray-gray2"
                : "text-gray-gray9 dark:bg-gray-gray12"
            }`}
          >
            {dur}
          </button>
        ))}
      </div>

      {/* ---------- لیست پکیج‌ها ---------- */}
      <div className={`space-y-2  ${match ? "mb-16" : "mb-9"}  sm:mb-0`}>
        {Object.entries(packagesData).map(([key, pack]) => {
          const isSelected = key === selectedPackage;
          const isOpenMobile = openMobileKey === key;

          return (
            <article
              key={key}
              className={`rounded-2xl sm:border-[3px] border sm:py-4 sm:px-5 p-3  ${
                isSelected
                  ? "border-main-black dark:bg-gray-gray11 dark:border-gray-100"
                  : "border-gray-gray6 bg-gray-gray4 dark:bg-gray-gray12 dark:border-gray-12"
              }
              
              ${!match && "bg-gray-gray1"}
              
              `}
            >
              <div
                onClick={() => setSelectedPackage(key)}
                className="flex justify-between items-center gap-2 w-full"
              >
                <div className="flex flex-col gap-1 sm:gap-2 w-fit sm:w-1/2">
                  <h3 className="font-medium text-gray-gray10 text-md dark:text-gray-gray1 sm:text-2xl">
                    {pack.title}
                  </h3>
                  <p className="hidden sm:flex justify-start !items-center min-w-24 overflow-hidden text-gray-gray9 dark:text-gray-gray1 text-sm text-ellipsis text-nowrap">
                    {pack.subtitle}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 w-fit sm:w-1/2">
                  <span className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm sm:text-2xl text-ellipsis text-nowrap">
                    {formatCurrency(pack.price, "/")} {t("general.toman")}
                  </span>
                  <p className="hidden sm:!flex justify-start !items-center text-2xs text-gray-gray9 dark:text-gray-gray1 sm:text-sm text-ellipsis text-nowrap">
                    {pack.description} / {selectedDuration}
                  </p>
                </div>
              </div>
              <div className="sm:hidden flex justify-between !items-center mt-1 w-full overflow-hidden text-2xs text-gray-gray9 dark:text-gray-gray1 sm:text-sm text-ellipsis text-nowrap">
                <p>{pack.description}</p>
                <p>{selectedDuration}</p>
              </div>
              {/* دکمه باز/بسته در موبایل */}
              <div className="sm:hidden flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setOpenMobileKey(isOpenMobile ? null : key)}
                  className="sm:hidden flex items-center gap-1 sm:gap-2 mt-1 font-medium text-gray-gray10 dark:text-gray-gray1 text-xs"
                >
                  {isOpenMobile ? (
                    <>
                      {t("general.closeDetails")}
                      <UpOutlined className="text-3xs" />
                    </>
                  ) : (
                    <>
                      {t("general.viewDetails")}
                      <DownOutlined className="text-3xs" />
                    </>
                  )}
                </button>
              </div>

              {/* ویژگی‌ها: دسکتاپ همیشه باز */}
              <div className="hidden sm:flex flex-wrap gap-x-6 sm:gap-x-8 sm:gap-y-3 mt-2 sm:mt-3">
                {pack.features.map(({ name, enabled }, i) => (
                  <div
                    key={i}
                    className={`sm:text-sm text-xs gap-1 flex dark:text-gray-gray1  ${
                      enabled ? "text-gray-gray9" : "text-gray-gray7"
                    }`}
                  >
                    {enabled ? <CheckOutlinedIcon /> : <CloseModalIcon />}
                    <span
                      className={`sm:text-sm text-xs dark:text-gray-gray1  ${
                        !enabled ? "text-gray-gray7" : "text-gray-gray9"
                      }`}
                    >
                      {name}
                    </span>
                  </div>
                ))}
              </div>

              {/* ویژگی‌ها: موبایل فقط اگر باز باشد */}
              {isOpenMobile && (
                <div className="sm:hidden items-center grid grid-cols-2 mt-2 text-xs">
                  {pack.features.map(({ name, enabled }, i) => (
                    <div
                      key={i}
                      className={`sm:text-sm text-xs gap-1 flex items-center justify-start dark:text-gray-gray1  ${
                        !match && "h-6"
                      } ${enabled ? "text-gray-gray9" : "text-gray-gray7"}`}
                    >
                      <div className="flex justify-center items-center w-5">
                        {enabled ? (
                          <CheckOutlinedIcon
                            config={{ width: 13, height: 13 }}
                          />
                        ) : (
                          <CloseModalIcon config={{ width: 24, height: 24 }} />
                        )}
                      </div>

                      <span
                        className={`sm:text-sm text-xs dark:text-gray-gray1 w-fit overflow-hidden text-ellipsis text-nowrap flex items-center  ${
                          !enabled ? "text-gray-gray7" : "text-gray-gray9"
                        }`}
                      >
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* ---------- ساید خلاصه پرداخت ---------- */}

      <div className="flex flex-col gap-2 px-2 w-full">
        {!match ? (
          <Drawer
            placement={placement}
            closable={false}
            open
            mask={false}
            height={height}
            zIndex={22}
          >
            <div className="relative flex flex-col justify-center gap-4 !h-full overflow-hidden">
              <div
                className={`flex flex-col justify-start items-center gap-1 w-full 
                  ${isExpanded && "h-full"}
                  `}
                onClick={toggleHeight}
              >
                <MenuDrawerIcon />
                <MenuDrawerIcon />
              </div>

              <div
                className={`top-6 w-full justify-between absolute flex flex-col gap-3  transition-all duration-200 ${
                  !isExpanded && " opacity-0"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-medium text-gray-gray9 dark:text-gray-gray1 text-xs sm:text-xs">
                    {t("general.package")} {packagesData[selectedPackage].title}
                  </h2>
                  <p className="font-medium text-gray-gray9 text-md sm:text-md dark:text-gray-gray1">
                    {formatCurrency(packagesData[selectedPackage].price, ".")}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-gray9 dark:text-gray-gray1 text-xs sm:text-xs">
                    {t("general.currentAccountBalance")}{" "}
                  </p>
                  <p className="font-medium text-gray-gray9 text-md sm:text-md dark:text-gray-gray1">
                    {t("general.currentAccountBalance")}{" "}
                  </p>
                </div>

                <div className="flex justify-between pt-3 border-gray-gray10 border-t">
                  <p className="font-medium text-main-black dark:text-gray-gray1 text-sm sm:text-sm">
                    {t("general.amountPayable")}{" "}
                  </p>
                  <p className="font-medium text-main-black text-md sm:text-md dark:text-gray-gray1">
                    {formatCurrency(
                      Math.max(
                        0,
                        packagesData[selectedPackage].price - 1180000
                      ),
                      "."
                    )}
                  </p>
                </div>
              </div>
              <CustomButton
                className={`${
                  isExpanded && "absolute bottom-0 left-0 right-0"
                } bg-main-black w-full h-11 font-medium text-md text-white`}
              >
                {t("general.payment")}
              </CustomButton>
            </div>
          </Drawer>
        ) : (
          <aside className="flex flex-col gap-4 bg-gray-gray3 dark:bg-gray-gray12 mt-6 px-5 py-4 border border-gray-gray6 rounded-lg w-full sm:w-80 max-w-md">
            <div className="flex justify-between items-center">
              <h2 className="font-medium text-gray-gray9 dark:text-gray-gray1 text-xs sm:text-xs">
                {t("general.package")} {packagesData[selectedPackage].title}
              </h2>
              <p className="font-medium text-gray-gray9 text-md sm:text-md dark:text-gray-gray1">
                {formatCurrency(packagesData[selectedPackage].price, ".")}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-gray9 dark:text-gray-gray1 text-xs sm:text-xs">
                {t("general.currentAccountBalance")}{" "}
              </p>
              <p className="font-medium text-gray-gray9 text-md sm:text-md dark:text-gray-gray1">
                {formatCurrency(1180000, ".")}
              </p>
            </div>

            <div className="flex justify-between pt-3 border-gray-gray10 border-t">
              <p className="font-medium text-main-black dark:text-gray-gray1 text-sm sm:text-sm">
                {t("general.amountPayable")}
              </p>
              <p className="font-medium text-main-black text-md sm:text-md dark:text-gray-gray1">
                {formatCurrency(
                  Math.max(0, packagesData[selectedPackage].price - 1180000),
                  "."
                )}
              </p>
            </div>

            <CustomButton className="bg-main-black mt-3 w-full h-11 font-medium text-md text-white">
              {t("general.payment")}
            </CustomButton>
          </aside>
        )}
      </div>
    </section>
  );
}
