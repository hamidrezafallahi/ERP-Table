import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomSelect,
} from '@components/atoms/defaultElements';
import {
  PlusOutline,
  TrashBin,
} from '@components/atoms/iconComponents';
import {
  calcDiscount,
} from '@components/organisms/salesAndPurchase/salesInvoice/utils';
import { useGetData } from '@services/base';
import type { IDiscount } from '@services/sale/discount/type';
import type { IElk } from '@services/sale/standardSalesInvoice/type';

import type { IProps } from './type';

export const DiscountsDetail = ({
  detailConfigModal,
  detailRequiredValue,
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

  const orgDiscount = record?.["DiscountItems"];

  const [discounts, setDiscounts] = useState<any[]>(orgDiscount || []);

  useEffect(() => {
    setDiscounts(orgDiscount || []);
  }, [orgDiscount]);

  const { data } = useGetData<IDiscount[], null>({
    url: "/api/sale/select/discount",
    body: {
      RepoViewId: 130059,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 300,
      },
    },
  });

  const { data: defaultValue } = useGetData<IElk[]>({
    url: "/api/sale/select/goods/elk",
    body: {
      ...requiredBody,
      CustomerId: detailRequiredValue,
    },
    skip: !detailRequiredValue || record["DiscountItems"]?.length > 0,
  });

  useEffect(() => {
    if (defaultValue?.Data) {
      const defaultValues = defaultValue?.Data?.[0];

      const defaultDiscounts = defaultValues?.DiscountItems;
      const factors = defaultValues?.AddElementDetailItems;

      if (defaultDiscounts) {
        const { discountItems } = calcDiscount(
          pureAmount,
          defaultDiscounts,
          factors
        );
        setDiscounts(discountItems || []);
      }
    }
  }, [defaultValue?.Data, pureAmount]);

  const discountsOptions = data?.Data?.map((option) => ({
    label: option?.DiscountTitle,
    value: option?.DiscountId,
  }));

  const handleDelete = (id: number) => {
    setDiscounts((prev = []) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = () => {
    setDiscounts((prev = []) => {
      const maxId = prev.reduce((m, it) => Math.max(m, it?.id || 0), 0);
      const newId = maxId + 1;
      return [
        ...prev,
        {
          id: newId,
          deletable: true,
        },
      ];
    });
  };

  useEffect(() => {
    if (discounts?.length > 0) {
      const { discountItems } = calcDiscount(
        pureAmount,
        discounts,
        record?.AddElementDetailItems
      );
      detailConfigModal.helpers.dispatchDetailData({
        type: "UPDATE_ROW",
        payload: {
          index,
          data: {
            DiscountItems: discountItems,
            DiscountIds: discounts?.map((item) => item.DiscountId),
          },
        },
      });
    } else {
      detailConfigModal.helpers.dispatchDetailData({
        type: "UPDATE_ROW",
        payload: {
          index,
          data: {
            DiscountItems: [],
            DiscountIds: [],
          },
        },
      });
    }
  }, [discounts]);

  return (
    <div
      className={` flex flex-col gap-2 p-2  border-gray-gray55 rounded-xl hidden-show-scrollBar overflow-auto`}
    >
      {discounts?.map((item, index) => (
        <div
          key={item?.id ?? index}
          className="items-center grid grid-cols-12 text-xs"
        >
          <span>{index + 1}</span>
          <div className="col-span-6">
            <CustomSelect
              showSearch
              allowClear
              popupMatchSelectWidth={200}
              value={item.DiscountId}
              placeholder={t("general.search")}
              filterOption={(input, option) => {
                const label = option?.label;
                return (
                  typeof label === "string" &&
                  label.toLowerCase().includes(input.toLowerCase())
                );
              }}
              options={discountsOptions}
              onChange={(newValue) => {
                const info = data?.Data?.find(
                  (d) => d?.DiscountId === newValue
                );

                setDiscounts((prev = []) =>
                  prev.map((it, idx) =>
                    idx === index
                      ? {
                          ...info,
                          DiscountId: info?.DiscountId,
                          id: it?.id ?? info?.DiscountId,
                          amount: info?.DiscountType
                            ? ((pureAmount || 0) *
                                (info?.DiscountAmount || 0)) /
                              100
                            : info?.DiscountAmount || 0,
                          deletable: true,
                        }
                      : it
                  )
                );
              }}
            />
          </div>

          {item?.DiscountType ? (
            <span className="text-center">
              %{" "}
              {item?.DiscountAmount
                ? item?.DiscountAmount?.toLocaleString("fa-IR")
                : "-"}
            </span>
          ) : (
            <span className="text-center">-</span>
          )}
          <span className="col-span-3 text-center">
            {item?.totalAmount
              ? item?.totalAmount?.toLocaleString("fa-IR")
              : "-"}
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
