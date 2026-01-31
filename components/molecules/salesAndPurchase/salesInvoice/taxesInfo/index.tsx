import { useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomSelect } from '@components/atoms/defaultElements';
import {
  TaxIcon,
  TrashBin,
} from '@components/atoms/iconComponents';
import {
  calcTax,
} from '@components/organisms/salesAndPurchase/salesInvoice/utils';
import { useAppSelector } from '@redux/index';
import { useGetData } from '@services/base';
import type { ITax } from '@services/com/tax/type';
import type { IElk } from '@services/sale/standardSalesInvoice/type';
import { setPageData } from '@slice/pages';

import type { ICardProps } from '../type';

export const TaxesInfo = ({
  setTotalOtherValues,
  totalDetailAmount,
  beforeTaxAmount,
  detailRequiredValue,
  vatBaseAmount,
  type,
}: ICardProps) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const params = useSearchParams();
  const id = Number(params.get("id"));

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
    }),
    shallowEqual
  );

  const { data } = useGetData<ITax[], null>({
    url: "/api/com/select/tax",
    body: {
      RepoViewId: 30054,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 300,
      },
    },
  });

  const taxes = activePage?.pageData?.find(
    (item) => item.name === "TaxItems"
  )?.value;
  const factors = activePage?.pageData?.find(
    (item) => item.name === "AddElement"
  )?.value;

  const discounts = activePage?.pageData?.find(
    (item) => item.name === "DiscountItems"
  )?.value;

  const pureAmount = beforeTaxAmount;

  // const amount =
  //   type === "JEWELRY"
  //     ? beforeTaxAmount
  //     : vatBaseAmount
  //     ? vatBaseAmount
  //     : beforeTaxAmount - discountsValue;

  const correctPureAmount = totalDetailAmount !== 0 ? pureAmount : 0;

  const { data: defaultValue } = useGetData<IElk[]>({
    url: "/api/sale/select/customer/elk",
    body: {
      CustomerId: detailRequiredValue,
      Price: correctPureAmount,
    },
    skip: !!id || !detailRequiredValue,
  });

  const taxesOptions = data?.Data?.map((option) => ({
    label: option?.TaxDesc,
    value: option?.TaxId,
  }));

  const updateTaxItems = (items: any[]) => {
    const validIds = items
      ?.map((i) => i.TaxId ?? i.id)
      .filter((id) => id != null);

    const { taxItems, totalTaxValue } = calcTax(
      correctPureAmount,
      items,
      discounts,
      factors
    );

    setTotalOtherValues((prev) => ({
      ...prev,
      taxes: totalTaxValue,
    }));

    dispatch(
      setPageData({
        caption: t("general.tax"),
        name: "TaxItems",
        type: "array",
        value: taxItems,
      })
    );

    dispatch(
      setPageData({
        caption: t("general.tax"),
        name: "TaxIds",
        type: "array",
        value: validIds,
      })
    );
  };

  useEffect(() => {
    if (defaultValue?.Data) {
      const defaultValues = defaultValue.Data[0];
      const taxes = defaultValues?.TaxItems;

      if (taxes.length > 0) {
        const { taxItems } = calcTax(
          correctPureAmount,
          taxes,
          discounts,
          factors
        );
        updateTaxItems(taxItems);
      }
    }
  }, [defaultValue?.Data]);

  useEffect(() => {
    if (taxes?.length > 0) {
      const { taxItems } = calcTax(
        correctPureAmount,
        taxes,
        discounts,
        factors
      );
      updateTaxItems(taxItems);
    }
  }, [correctPureAmount, factors, discounts]);

  useEffect(() => {
    if (totalDetailAmount === 0) {
      updateTaxItems([]);
    }
  }, [totalDetailAmount]);

  const handleAdd = () => {
    updateTaxItems([
      ...taxes,
      {
        id: null,
        deletable: true,
      },
    ]);
  };

  const handleDelete = (id: number) => {
    const updated = taxes.filter((item: any) => item.id !== id);
    updateTaxItems(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4">
            <TaxIcon config={{ width: 18, height: 19 }} />
          </div>
          <span>{t("general.tax")}</span>
          <div
            className="bg-black-black8 hover:bg-white px-2 border hover:border-black-black8 rounded w-full text-white text-center cursor-pointer"
            onClick={handleAdd}
          >
            +
          </div>
        </div>

        {taxes?.length > 0 && (
          <span className="text-red-600">
            {taxes
              ?.reduce((total, item) => total + (item.totalAmount || 0), 0)
              ?.toLocaleString("fa-IR")}
          </span>
        )}
      </div>

      <div
        className={`lg:h-[150px] h-full flex flex-col gap-2 p-2 border border-gray-gray55 rounded-xl hidden-show-scrollBar overflow-auto`}
      >
        {taxes?.map((item: any, index: number) => (
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
                  value={item.TaxId}
                  placeholder={t("general.search")}
                  filterOption={(input, option) => {
                    const label = option?.label;
                    return (
                      typeof label === "string" &&
                      label.toLowerCase().includes(input.toLowerCase())
                    );
                  }}
                  options={taxesOptions}
                  onChange={(newValue) => {
                    const info = data?.Data?.find(
                      (tax) => tax?.TaxId === newValue
                    );
                    if (!info) return;

                    const updated = taxes.map((tax: any, idx: number) =>
                      idx === index
                        ? {
                            ...info,
                            id: info.TaxId,
                            amount: correctPureAmount * (info.TaxRate / 100),
                            deletable: true,
                          }
                        : tax
                    );
                    updateTaxItems(updated);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-nowrap items-center gap-1">
              {item?.TaxRate && (
                <span className="text-center">
                  % {item.TaxRate?.toLocaleString("fa-IR")}
                </span>
              )}
              <span className="col-span-3 text-red-600 text-center">
                {item?.totalAmount
                  ? item.totalAmount.toLocaleString("fa-IR")
                  : "-"}
              </span>

              {item.deletable && (
                <div
                  className="flex justify-end items-center w-5 h-5 cursor-pointer"
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
