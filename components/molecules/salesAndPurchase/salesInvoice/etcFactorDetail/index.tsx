import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomSelect,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  DiscountSignIcon,
  PlusOutline,
  TaxIcon,
  TrashBin,
} from '@components/atoms/iconComponents';
import {
  calcFactor,
} from '@components/organisms/salesAndPurchase/salesInvoice/utils';
import { useGetData } from '@services/base';
import {
  ElementTypeEnum,
} from '@services/sale/increasingAndDecreasingFactors/type';
import type { IElk } from '@services/sale/standardSalesInvoice/type';
import type { ISelectOption } from '@type/elementType';

import type { IAdditionalInfo } from '../increasingAndDecreasingFactors/type';
import type { IState } from '../type';
import type { IProps } from './type';

export const EtcFactorDetail = ({
  detailConfigModal,
  detailRequiredValue,
  calcIndependentValue,
}: IProps) => {
  const t = useTranslations();

  const record = detailConfigModal.record;
  const index = detailConfigModal.index;

  const quantity = record?.FinalQuantity
    ? record?.FinalQuantity
    : record?.Quantity1 || 0;

  const pureAmount = quantity * record?.Fee;

  const requiredBody = {
    GoodsId: record["GoodsId"],
    Price: pureAmount || 0,
  };

  const [etcFactors, setEtcFactors] = useState<IState[]>(
    record?.["AddElementDetailItems"] || []
  );

  const { data } = useGetData<ISelectOption[], null>({
    url: "api/sale/select/addElement4SelectOption",
    body: {
      RepoViewId: 130003,
      PagingInfo: {
        PageRecordCount: 300,
        PageNumber: 1,
      },
      IsForHeader: false,
      IsForDetail: true,
    },
  });

  const additionalInfo: IAdditionalInfo[] = data?.AdditionalInfo;

  const increasingAndDecreasingOptions = data?.Data?.map((option) => ({
    label: option?._SelectDisplay,
    value: option?._SelectId,
  }));

  const { data: defaultValue } = useGetData<IElk[]>({
    url: "/api/sale/select/goods/elk",
    body: {
      ...requiredBody,
      CustomerId: detailRequiredValue,
    },
    skip: !detailRequiredValue || record["AddElementDetailIds"]?.length > 0,
  });

  useEffect(() => {
    if (defaultValue?.Data) {
      const defaultValues = defaultValue?.Data?.[0];

      const etcFactors = defaultValues?.AddElementDetailItems;

      if (etcFactors) {
        const { factorItems } = calcFactor(pureAmount, etcFactors);

        setEtcFactors(factorItems);
      }
    }
  }, [defaultValue?.Data, pureAmount]);

  const handleDelete = (id: number) => {
    const updatedOtherFactor = etcFactors.filter((item) => item.id !== id);
    setEtcFactors(updatedOtherFactor ? updatedOtherFactor : []);
  };
  const handleAdd = () => {
    const newId = etcFactors ? etcFactors?.length + 1 : 1;

    setEtcFactors((prevState) => [
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

  useEffect(() => {
    const fetchIndependentValue = async () => {
      let independentParameter = {};

      if (calcIndependentValue) {
        try {
          const result = await calcIndependentValue(
            record,
            "AddElementDetailIds",
            etcFactors?.length > 0 ? etcFactors : []
          );

          if (result) {
            independentParameter = result;
          }
        } catch (error) {
          null;
        }
      }

      detailConfigModal.helpers.dispatchDetailData({
        type: "UPDATE_ROW",
        payload: {
          index,
          data: {
            ...independentParameter,
            AddElementDetailItems: etcFactors?.length ? etcFactors : [],
            AddElementDetailIds: etcFactors?.length
              ? etcFactors.map((item) => item.AddElementId)
              : [],
          },
        },
      });
    };

    fetchIndependentValue();
  }, [etcFactors]);

  return (
    <div
      className={` flex flex-col gap-2 p-2  border-gray-gray55 rounded-xl hidden-show-scrollBar overflow-auto`}
    >
      {etcFactors?.map((item, index) => (
        <div key={index} className="items-center grid grid-cols-12 text-xs">
          <span>{index + 1}</span>
          <div className="col-span-6">
            <CustomSelect
              // showSearch
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

                setEtcFactors((prevState) =>
                  prevState.map((item, idx) =>
                    idx === index
                      ? {
                          ...item,
                          ...info,
                          title: newValue,
                          pricePercent: info?.PricePercent,
                          percent: info?.BaseValue,
                          amount: info?.PricePercent
                            ? (pureAmount * info?.BaseValue) / 100
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

          {item?.pricePercent && (
            <span className="text-center">
              %{item?.percent ? item?.percent?.toLocaleString("fa-IR") : "-"}
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

          {item.deletable && (
            <div
              className="flex justify-end items-center w-6 h-6"
              onClick={() => handleDelete(item.id)}
            >
              <TrashBin config={{ width: 23, height: 23 }} />
            </div>
          )}
        </div>
      ))}

      <div className={`justify-center w-full lg:self-end flex mt-1`}>
        <CustomButton
          type="text"
          className="bg-black-black8 !hover:bg-white px-2 hover:border-black-black8 w-full text-white"
          onClick={() => handleAdd()}
        >
          <PlusOutline />
        </CustomButton>
      </div>
    </div>
  );
};
