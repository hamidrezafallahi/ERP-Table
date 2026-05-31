import { useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomSelect } from '@components/atoms/defaultElements';
import {
  DiscountSignIcon,
  TrashBin,
} from '@components/atoms/iconComponents';
import {
  calcDiscount,
} from '@components/organisms/salesAndPurchase/salesInvoice/utils';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import type { IDiscount } from '@services/sale/discount/type';
import type { IDiscountState } from '@services/sale/salesInvoiceDetails/type';
import type { IElk } from '@services/sale/standardSalesInvoice/type';
import { setPageData } from '@slice/pages';

import type { ICardProps } from '../type';

export const DiscountsInfo = ({
  setTotalOtherValues,
  totalDetailAmount,
  beforeTaxAmount,
  detailRequiredValue,
}: ICardProps) => {
  const t = useTranslations();
  const dispatch = useDispatch();
  const params = useSearchParams();
  const id = Number(params.get("id"));

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
    }),
    shallowEqual
  );

  const factors = activePage?.pageData?.find(
    (item) => item.name === "AddElement"
  )?.value;

  const discounts = activePage?.pageData?.find(
    (item) => item.name === "DiscountItems"
  )?.value;

  const correctPureAmount = totalDetailAmount !== 0 ? beforeTaxAmount : 0;

  const { data } = useGetData<IDiscount[], null>({
    url: "/api/sale/select/discount",
    body: {
      RepoViewId: 130059,
      PagingInfo: { PageNumber: 1, PageRecordCount: 300 },
    },
  });

  const { data: defaultValue } = useGetData<IElk[]>({
    url: "/api/sale/select/customer/elk",
    body: { CustomerId: detailRequiredValue, Price: correctPureAmount },
    skip: !!id || !detailRequiredValue,
  });

  const discountsOptions =
    data?.Data?.map((option) => ({
      label: option.DiscountTitle,
      value: option.DiscountId,
    })) || [];

  const updateDiscountItems = (items: IDiscountState[]) => {
    const validIds = items
      .map((i) => i.DiscountId ?? i.id)
      .filter((id) => id != null);
    const { discountItems, totalDiscountValue } = calcDiscount(
      correctPureAmount,
      items,
      factors
    );

    dispatch(
      setPageData({
        caption: t("general.discount"),
        name: "DiscountItems",
        type: "array",
        value: discountItems,
      })
    );

    dispatch(
      setPageData({
        caption: t("general.discount"),
        name: "DiscountIds",
        type: "array",
        value: validIds,
      })
    );

    setTotalOtherValues((prev) => ({ ...prev, discounts: totalDiscountValue }));
  };

  const handleDelete = (index: number) => {
    const updated = (discounts ?? []).filter((_, idx) => idx !== index);
    updateDiscountItems(updated);
  };

  const handleAdd = () => {
    updateDiscountItems([...(discounts ?? []), { id: null, deletable: true }]);
  };

  useEffect(() => {
    if (defaultValue?.Data?.[0]?.DiscountItems) {
      const discounts = defaultValue.Data[0].DiscountItems;

      const { discountItems } = calcDiscount(
        correctPureAmount,
        discounts,
        factors
      );
      updateDiscountItems(discountItems);
    }
  }, [defaultValue?.Data]);

  useEffect(() => {
    if (discounts?.length > 0) {
      const { discountItems } = calcDiscount(
        correctPureAmount,
        discounts,
        factors
      );
      updateDiscountItems(discountItems);
    }
  }, [factors, correctPureAmount]);

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex justify-between items-center px-2 text-sm">
        <div className="flex items-center gap-2">
          <DiscountSignIcon config={{ width: 18, height: 18 }} />
          <span>{t("general.discount")}</span>
          <button
            className="bg-black-black8 hover:bg-white px-2 border hover:border-black-black8 rounded text-white hover:text-black transition"
            onClick={handleAdd}
          >
            +
          </button>
        </div>

        {discounts?.length > 0 && (
          <span className="text-green-600">
            {discounts
              ?.reduce((total, item) => total + (item.totalAmount || 0), 0)
              ?.toLocaleString("fa-IR")}
          </span>
        )}
      </div>

      {/* Discounts List */}
      <div
        className={`lg:h-[150px] h-full flex flex-col gap-2 p-2 border border-gray-gray55 rounded-xl overflow-auto hidden-show-scrollBar`}
      >
        {(discounts ?? []).map((item, index) => (
          <div
            key={item.id ?? index}
            className="flex flex-wrap justify-between items-center gap-1 text-xs"
          >
            <div className="flex items-center gap-1">
              <span>{index + 1}</span>
              <div className="w-[110px]">
                <CustomSelect
                  showSearch
                  allowClear
                  popupMatchSelectWidth={200}
                  value={item.DiscountId}
                  placeholder={t("general.search")}
                  options={discountsOptions}
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(newValue) => {
                    const info = data?.Data?.find(
                      (opt) => opt.DiscountId === newValue
                    );
                    const updated = discounts.map((d, idx) =>
                      idx === index
                        ? {
                            ...info,
                            id: d.id,
                            amount: info?.DiscountType
                              ? (correctPureAmount * info?.DiscountAmount) / 100
                              : info?.DiscountAmount,

                            deletable: true,
                          }
                        : d
                    );
                    updateDiscountItems(updated);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              {item.DiscountType && item.DiscountAmount && (
                <span className="text-center">
                  %{item.DiscountAmount?.toLocaleString("fa-IR")}
                </span>
              )}
              <span className="text-green-600 text-center">
                {item.totalAmount
                  ? item.totalAmount.toLocaleString("fa-IR")
                  : "-"}
              </span>
              {item.deletable && (
                <button
                  className="flex justify-center items-center w-5 h-5"
                  onClick={() => handleDelete(index)}
                >
                  <TrashBin config={{ width: 20, height: 20 }} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
