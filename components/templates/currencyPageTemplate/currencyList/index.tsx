import React, { useState } from 'react';

import { Skeleton } from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { useAppSelector } from '@redux/index';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { IRequest } from '@services/reportFile/type';

import TableHeader from './tableHeader';
import { Currency } from './type';

export default function CurrencyList() {
  const t = useTranslations();
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(
    null
  );
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  const setSelectedClass = () => {
    return;
  };
  const { data, isLoading, refetch } = useGetData<Currency[], IRequest>({
    url: "/api/com/select/currency",
    body: {
      RepoViewId: null,
    },
  });

  const currencies = data?.Result ? data.Data : [];
  const [updateCurrency, { isLoading: isUpdating }] = useCUDDataMutation();
  const handleSubmit = async () => {
    if (!selectedCurrencyId) return;

    try {
      const res = await updateCurrency({
        url: "/api/com/update/currency",
        body: {
          CurrencyId: selectedCurrencyId,
          ChangeFields: ["IsBase"],
          IsBase: true, // یا false بسته به نیازت
        },
      }).unwrap();

      if (res?.Result) {
        refetch(); // 👈 رفرش لیست بعد از ثبت موفق
        setSelectedCurrencyId(null);
      } else {
        ("");
      }
    } catch (err) {
      ("");
    }
  };

  return (
    <>
      <div className="relative">
        <div className="top-0 right-0 left-0 z-20 sticky bg-white dark:bg-gray-gray12 w-full">
          <TableHeader />
        </div>

        <div className="h-[calc(100dvh-310px)] lg:h-[calc(100dvh-400px)] overflow-auto">
          {isLoading && <Skeleton active loading />}
          {currencies.map((currency, index) => (
            <>
              <div
                key={currency.CurrencyId}
                role="row"
                aria-rowindex={index + 1}
                className={`items-center  ${
                  match
                    ? "grid grid-cols-[100px_250px_1fr] bg-gray-gray2 dark:bg-gray-gray11 mb-2 px-8 border border-gray-gray11 rounded h-14"
                    : "px-3 h-9 flex justify-between bg-gray-gray1 dark:bg-gray-gray11 border border-gray-gray5 rounded w-full my-2"
                }`}
              >
                <span className="hidden lg:inline font-medium text-gray-gray10 dark:text-gray-gray1 text-sm text-right">
                  {index + 1}
                </span>
                <span className="inline font-medium text-gray-gray10 dark:text-gray-gray1 text-sm text-right">
                  {currency.CurrencyDesc}
                </span>

                <div className="flex justify-end">
                  <label className="inline-flex relative items-center cursor-pointer">
                    <input
                      type="radio"
                      name="currency"
                      checked={selectedCurrencyId === currency.CurrencyId}
                      //checked={currency.IsBase === true ? true : false}
                      onChange={() =>
                        setSelectedCurrencyId(currency.CurrencyId)
                      }
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded-full border border-[#4e4e4e] flex items-center justify-center ${
                        currency.IsBase && selectedCurrencyId === null
                          ? "bg-main-black"
                          : selectedCurrencyId === currency.CurrencyId
                          ? "bg-main-black"
                          : "bg-[#d9d9d9]"
                      }`}
                    />
                  </label>
                </div>
              </div>
            </>
          ))}{" "}
        </div>
        <CustomButton
          onClick={handleSubmit}
          className="flex justify-center items-center bg-main-black mt-6 mr-auto rounded w-16 h-9 text-white"
          disabled={!selectedCurrencyId || isUpdating}
        >
          {isUpdating ? t("general.loading") : t("general.submit")}
        </CustomButton>
      </div>
    </>
  );
}
