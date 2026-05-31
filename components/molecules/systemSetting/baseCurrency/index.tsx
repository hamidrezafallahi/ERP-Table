import {
  useEffect,
  useState,
} from 'react';

import { Spin } from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomRadio,
} from '@components/atoms/defaultElements';
import { SpinIcon } from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type {
  IAvailableCurrency,
  IRequest,
} from '@services/com/currency/type';
import { showSuccessToast } from '@utils/toast';

export const BaseCurrency = () => {
  const t = useTranslations();

  const [isBaseCurrencyId, setIsBaseCurrencyId] = useState<number | null>(null);

  const { data: selectedCurrencyData } = useGetData<
    IAvailableCurrency[],
    IRequest
  >({
    url: "api/com/select/availableCurrencies",
    body: {
      RepoViewId: null,
    },
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const handleSetIsBase = (currencyId: number) => {
    setIsBaseCurrencyId(currencyId);
  };

  const handleSubmitBaseCurrency = async () => {
    if (!isBaseCurrencyId) return;
    try {
      const mutateResult = await mutateItem({
        url: "api/com/update/availableCurrencies/isBase",
        body: {
          AvailableCurrencyId: isBaseCurrencyId,
          IsBase: true,
          ChangeFields: ["IsBase"],
        },
      }).unwrap();

      if (mutateResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
      }
    } catch (error) {
      null;
    }
  };

  useEffect(() => {
    if (selectedCurrencyData?.Data) {
      const isBasedCurrency = selectedCurrencyData?.Data?.find(
        (item) => item.IsBase
      );
      if (isBasedCurrency) {
        setIsBaseCurrencyId(isBasedCurrency.AvailableCurrencyId);
      }
    }
  }, [selectedCurrencyData]);

  return (
    <div className="flex flex-col gap-2">
      <span>◂{t("systemSetting.baseCurrency")}</span>
      <span className="text-blue-blue5 text-xs">
        ◂ {t("systemSetting.baseCurrencyGuide")}
      </span>
      <div className="flex items-center gap-16 bg-gray-gray1 dark:bg-gray-gray11 shadow-lg p-4 border-2 border-gray-gray2 dark:border-gray-gray11 rounded text-gray-gray7 dark:text-gray-gray1 text-xs">
        <span>{t("general.row")}</span>
        <span>{t("general.currencyType")}</span>
      </div>
      <div className="flex flex-col gap-2 p-2 h-[300px] overflow-y-auto">
        {selectedCurrencyData?.Data?.length === 0 && (
          <span className="font-bold text-gray-gray7 dark:text-gray-gray1 text-xs text-center">
            {t("general.noAvailableCurrency")}
          </span>
        )}
        {selectedCurrencyData?.Data?.map((item, idx) => {
          return (
            <div
              className="flex justify-between items-center bg-gray-gray1 dark:bg-gray-gray11 shadow-lg p-4 border-2 border-gray-gray7 dark:border-gray-gray11 rounded text-xs"
              key={item.AvailableCurrencyId}
            >
              <div className="flex items-center gap-16">
                <span>{idx + 1}</span>
                <span>{item?.Currency?.CurrencyDesc}</span>
              </div>
              <div>
                <CustomRadio
                  checked={isBaseCurrencyId === item.AvailableCurrencyId}
                  onChange={() => handleSetIsBase(item.AvailableCurrencyId)}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end items-center gap-2 pt-2">
        <CustomButton
          type="text"
          onClick={handleSubmitBaseCurrency}
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
        >
          {mutateIsLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : (
            t("general.submit")
          )}
        </CustomButton>
      </div>
    </div>
  );
};
