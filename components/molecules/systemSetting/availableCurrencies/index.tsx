import {
  useEffect,
  useState,
} from 'react';

import { Spin } from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  CloseCircle,
  Magnifier,
  SpinIcon,
} from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type {
  IAvailableCurrency,
  IRequest,
} from '@services/com/currency/type';
import type { ISelectOption } from '@type/elementType';
import {
  showErrorToast,
  showSuccessToast,
} from '@utils/toast';

export const AvailableCurrencies = () => {
  const t = useTranslations();

  const [AvailableCurrencyIds, setIsAvailableCurrencyIds] = useState<
    { currencyId: number; status: boolean; isBase: boolean }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: selectedCurrencyData } = useGetData<
    IAvailableCurrency[],
    IRequest
  >({
    url: "api/com/select/availableCurrencies",
    body: {
      RepoViewId: null,
    },
  });

  const { data: allCurrencyData } = useGetData<ISelectOption[], null>({
    url: "api/com/select/currency4bankAccount",
    body: {
      RepoViewId: null,
    },
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const handleSubmitAvailableCurrencies = async () => {
    try {
      const mutateResult = await mutateItem({
        url: "api/com/insert/availableCurrencies",
        body: {
          CurrencyIds: AvailableCurrencyIds,
          // ChangeFields: changedFields,
        },
      }).unwrap();

      if (mutateResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
      }
    } catch (error) {
      null;
    }
  };

  const handleSetAvailableCurrencyIds = (
    currencyId: number,
    checked: boolean
  ) => {
    if (!currencyId) return;
    if (AvailableCurrencyIds.find((item) => item.currencyId === currencyId)) {
      const item = AvailableCurrencyIds.find(
        (item) => item.currencyId === currencyId
      );
      if (item.isBase) {
        showErrorToast(t("systemSetting.isBaseCurrencyRemoved"));
      }
      setIsAvailableCurrencyIds(
        AvailableCurrencyIds.map((element) =>
          element.currencyId !== currencyId
            ? element
            : { ...element, status: checked, isBase: item.isBase }
        )
      );
    } else {
      setIsAvailableCurrencyIds([
        ...AvailableCurrencyIds,
        { currencyId, status: checked, isBase: false },
      ]);
    }
  };

  const handleFilterData = (data: ISelectOption[], searchTerm: string) => {
    if (!searchTerm) return data;

    const term = searchTerm.toLowerCase();

    return data.filter((item) =>
      item._SelectDisplay?.toLowerCase().includes(term)
    );
  };

  const filteredData = handleFilterData(allCurrencyData?.Data, searchTerm);

  useEffect(() => {
    if (selectedCurrencyData?.Data) {
      const correctValue = selectedCurrencyData?.Data?.map((item) => ({
        currencyId: item.CurrencyId,
        status: true,
        isBase: item.IsBase ?? false,
      }));

      setIsAvailableCurrencyIds(correctValue);
    }
  }, [selectedCurrencyData]);

  return (
    <div className="flex flex-col gap-2">
      <span>◂{t("systemSetting.availableCurrencies")}</span>
      <span className="text-blue-blue5 text-xs">
        ◂ {t("systemSetting.availableCurrenciesGuide")}
      </span>
      <InputText
        placeholder={t("general.search")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        prefix={<Magnifier />}
        allowClear={{
          clearIcon: <CloseCircle />,
        }}
        className="flex items-center !bg-gray-gray5 rounded w-full text-xs"
      />

      <div className="flex items-center gap-16 bg-gray-gray1 dark:bg-gray-gray11 shadow-lg p-4 border-2 border-gray-gray2 dark:border-gray-gray11 rounded text-gray-gray7 dark:text-gray-gray1 text-xs">
        <span>{t("general.row")}</span>
        <span>{t("general.currencyType")}</span>
      </div>
      <div className="flex flex-col gap-2 p-2 !h-[260px] overflow-y-auto">
        {filteredData?.map((item, idx) => (
          <div
            className="flex justify-between items-center bg-gray-gray1 dark:bg-gray-gray11 shadow-lg p-4 border-2 border-gray-gray7 dark:border-gray-gray11 rounded text-xs"
            key={item._SelectId}
          >
            <div className="flex items-center gap-16">
              <span>{idx + 1}</span>
              <span>{item._SelectDisplay}</span>
            </div>

            <CustomCheckbox
              onChange={(e) =>
                handleSetAvailableCurrencyIds(item._SelectId, e.target.checked)
              }
              checked={
                AvailableCurrencyIds.find(
                  (el) => el.currencyId === item._SelectId
                )?.status
              }
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center gap-2 pt-2">
        <CustomButton
          type="text"
          onClick={handleSubmitAvailableCurrencies}
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
