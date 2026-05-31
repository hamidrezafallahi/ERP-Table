import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomSelect,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  BillListIcon,
  DiscountSignIcon,
  TaxIcon,
  TrashBin,
} from '@components/atoms/iconComponents';
import {
  calcFactor,
} from '@components/organisms/salesAndPurchase/salesInvoice/utils';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import {
  ElementTypeEnum,
} from '@services/sale/increasingAndDecreasingFactors/type';
import { setPageData } from '@slice/pages';
import type { ISelectOption } from '@type/elementType';

import {
  type ICardProps,
  type IState,
} from '../type';
import type { IAdditionalInfo } from './type';

export const IncreasingAndDecreasingFactors = ({
  headerId,
  fieldKey,
  setTotalOtherValues,
  totalDetailAmount,
  beforeTaxAmount,
}: ICardProps) => {
  const t = useTranslations();
  const dispatch = useDispatch();

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
    }),
    shallowEqual
  );
  const [otherFactors, setOtherFactors] = useState<IState[]>([]);
  const [value, setValue] = useState<number>(null);

  // const { data: invoiceElement } = useGetData<IData[], null>({
  //   url: "api/sale/select/invoiceElement",
  //   body: {
  //     [fieldKey]: headerId,
  //   },
  //   skip: !headerId,
  // });

  const { data } = useGetData<ISelectOption[], null>({
    url: "api/sale/select/addElement4SelectOption",
    body: {
      RepoViewId: 130003,
      PagingInfo: {
        PageRecordCount: 300,
        PageNumber: 1,
      },
      IsForHeader: true,
      IsForDetail: false,
    },
  });

  const defaultAdditional = activePage?.pageData?.find(
    (item) => item.name === "AddElement"
  )?.value;

  const additionalInfo: IAdditionalInfo[] = data?.AdditionalInfo;

  const increasingAndDecreasingOptions = data?.Data?.map((option) => ({
    label: option?._SelectDisplay,
    value: option?._SelectId,
  }));

  const handleDelete = (id: number) => {
    const updatedOtherFactor = otherFactors.filter((item) => item.id !== id);
    setOtherFactors(updatedOtherFactor ? updatedOtherFactor : []);
  };
  const handleAdd = () => {
    const newId = otherFactors ? otherFactors?.length + 1 : 1;

    setOtherFactors((prevState) => [
      ...prevState,
      {
        id: newId,
        title: null,
        pricePercent: false,
        percent: null,
        amount: null,
        type: ElementTypeEnum.Neutral,
        deletable: true,
      },
    ]);
  };

  // useEffect(() => {
  //   if (invoiceElement?.Data) {
  //     const defaultData = invoiceElement?.Data?.map((item, idx) => {
  //       const correctItem = additionalInfo?.find(
  //         (el) => el?.AddElementId === item?.AddElement?.AddElementId
  //       );
  //       return {
  //         id: idx,
  //         title: item?.AddElement?.AddElementId,
  //         pricePercent: item?.AddElement?.PricePercent,
  //         percent: item?.AddElement?.BaseValue,
  //         amount: item?.AddElement?.PricePercent
  //           ? (beforeTaxAmount * item?.AddElement?.BaseValue) / 100
  //           : item?.AddElement?.BaseValue,
  //         type: correctItem?.ElementType,
  //         taxable: correctItem?.Taxable,
  //         discountable: correctItem?.Discountable,
  //         deletable: correctItem?.IsMandatory ? false : true,
  //       };
  //     });
  //     defaultData?.length > 0 && setOtherFactors(defaultData);
  //   }
  // }, [invoiceElement]);

  useEffect(() => {
    if (defaultAdditional?.length > 0) {
      const { factorItems } = calcFactor(beforeTaxAmount, defaultAdditional);

      setOtherFactors(factorItems);
    } else if (additionalInfo?.length > 0 && otherFactors?.length === 0) {
      const mandatory = additionalInfo.filter((item) => item.IsMandatory);
      const mandatoryFactors = mandatory.map((item, idx) => ({
        id: idx,
        title: item?.AddElementId,
        pricePercent: item?.PricePercent,
        percent: item?.BaseValue,
        amount: item?.PricePercent
          ? (beforeTaxAmount * item?.BaseValue) / 100
          : item?.BaseValue,
        type: item?.ElementType,
        taxable: item?.Taxable,
        discountable: item?.Discountable,
        deletable: false,
      }));
      mandatoryFactors && setOtherFactors(mandatoryFactors);
    }
  }, [beforeTaxAmount, additionalInfo]);

  useEffect(() => {
    const { decreasingFactorValue, increasingFactorValue } = calcFactor(
      beforeTaxAmount,
      otherFactors
    );

    setTotalOtherValues((prev) => ({
      ...prev,
      otherDecreasing: decreasingFactorValue,
      otherIncreasing: increasingFactorValue,
    }));

    setValue(increasingFactorValue - decreasingFactorValue);

    const value = otherFactors?.map((item) => item.title);

    dispatch(
      setPageData({
        caption: t("general.increasingAndDecreasingFactors"),
        name: "AddElementIds",
        type: "array",
        value: value,
      })
    );
    dispatch(
      setPageData({
        caption: t("general.increasingAndDecreasingFactors"),
        name: "AddElement",
        type: "array",
        value: otherFactors,
      })
    );
  }, [otherFactors]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4">
            <BillListIcon />
          </div>
          <span className="whitespace-nowrap">
            {t("general.invoiceEtcFactor")}
          </span>
          <div
            className="bg-black-black8 !hover:bg-white px-2 hover:border-black-black8 rounded w-full text-white text-center"
            onClick={() => handleAdd()}
          >
            +
          </div>
        </div>
        {value && (
          <span className={`${value > 0 ? "text-red-600" : "text-green-600"}`}>
            {Math.abs(value)?.toLocaleString("fa-IR")}
          </span>
        )}
      </div>

      <div
        className={`lg:h-[150px] h-full flex flex-col gap-2 p-2 border border-1 border-gray-gray55 rounded-xl hidden-show-scrollBar overflow-auto`}
      >
        {otherFactors.map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap justify-between items-center gap-1 text-xs"
          >
            <div className="flex flex-nowrap items-center gap-1">
              <span>{index + 1}</span>

              <div className="w-[110px]">
                <CustomSelect
                  showSearch
                  allowClear
                  popupMatchSelectWidth={200}
                  value={item.title}
                  placeholder={t("general.search")}
                  filterOption={(input, option) => {
                    const label = option?.label;
                    return (
                      typeof label === "string" &&
                      label.toLowerCase().includes(input.toLowerCase())
                    );
                  }}
                  options={increasingAndDecreasingOptions}
                  onChange={(newValue) => {
                    const info = additionalInfo?.find(
                      (item) => item?.AddElementId === newValue
                    );

                    setOtherFactors((prevState) =>
                      prevState.map((item, idx) =>
                        idx === index
                          ? {
                              ...item,
                              title: newValue,
                              pricePercent: info?.PricePercent,
                              percent: info?.BaseValue,
                              amount: info?.PricePercent
                                ? (beforeTaxAmount * info?.BaseValue) / 100
                                : info?.BaseValue,
                              type: info?.ElementType,
                              taxable: info?.Taxable,
                              discountable: info?.Discountable,
                              deletable: info?.IsMandatory ? false : true,
                            }
                          : item
                      )
                    );
                  }}
                />
              </div>
            </div>

            <div className="flex flex-nowrap items-center gap-1">
              {item?.pricePercent && (
                <span className="text-center">
                  %
                  {item?.percent ? item?.percent?.toLocaleString("fa-IR") : "-"}
                </span>
              )}

              {item.type === ElementTypeEnum.Increasing ? (
                <CustomTooltip title={t("general.increasingFactor")}>
                  <span>↑</span>
                </CustomTooltip>
              ) : item.type === ElementTypeEnum.Decreasing ? (
                <CustomTooltip title={t("general.decreasingFactor")}>
                  <span>↓</span>
                </CustomTooltip>
              ) : (
                <></>
              )}
              {item.taxable && (
                <CustomTooltip title={t("general.taxable")}>
                  <TaxIcon config={{ width: 16, height: 16 }} />
                </CustomTooltip>
              )}
              {item.discountable && (
                <CustomTooltip title={t("general.discountable")}>
                  <DiscountSignIcon config={{ width: 16, height: 16 }} />
                </CustomTooltip>
              )}

              <span
                className={`${
                  item.type === ElementTypeEnum.Increasing
                    ? "text-red-600"
                    : item.type === ElementTypeEnum.Decreasing
                    ? "text-green-600"
                    : ""
                } text-center`}
              >
                {item?.amount ? item?.amount?.toLocaleString("fa-IR") : "-"}
              </span>

              {item?.deletable && (
                <div
                  className="flex justify-end items-center w-5 h-5"
                  onClick={() => handleDelete(item.id)}
                >
                  <TrashBin config={{ width: 20, height: 20 }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
