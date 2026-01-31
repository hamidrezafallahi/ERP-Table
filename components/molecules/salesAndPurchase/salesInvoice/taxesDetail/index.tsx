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
  calcTax,
} from '@components/organisms/salesAndPurchase/salesInvoice/utils';
import { useGetData } from '@services/base';
import type { ITax } from '@services/com/tax/type';
import type { IElk } from '@services/sale/standardSalesInvoice/type';

import type { IProps } from './type';

export const TaxesDetail = ({
  detailConfigModal,
  detailRequiredValue,
  type,
}: IProps) => {
  const t = useTranslations();

  const record = detailConfigModal.record;
  const index = detailConfigModal.index;

  const vat = record?.VATBaseAmount;

  const quantity = record?.FinalQuantity
    ? record?.FinalQuantity
    : record?.Quantity1 || 0;

  const pureAmount = quantity * record?.Fee;

  const requiredBody = {
    GoodsId: record["GoodsId"],
    Price: pureAmount || 0,
  };

  const rowTotalAdditional =
    (record?.ConstructionCost || 0) +
    (record?.SellerProfit || 0) +
    (record?.Commission || 0);

  const orgTaxes = record?.["TaxItems"];

  const [taxes, setTaxes] = useState<any[]>(orgTaxes || []);

  useEffect(() => {
    setTaxes(orgTaxes || []);
  }, [orgTaxes]);

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

  const { data: defaultValue } = useGetData<IElk[]>({
    url: "/api/sale/select/goods/elk",
    body: {
      ...requiredBody,
      CustomerId: detailRequiredValue,
    },
    skip: !detailRequiredValue || record["TaxItems"]?.length > 0,
  });

  useEffect(() => {
    if (defaultValue?.Data) {
      const defaultValues = defaultValue?.Data?.[0];
      const defaultTaxes = defaultValues?.TaxItems || [];
      const discounts = defaultValues?.DiscountItems || [];
      const factors = defaultValues?.AddElementDetailItems || [];

      if (defaultTaxes.length > 0) {
        const { taxItems } = calcTax(
          pureAmount,
          defaultTaxes,
          discounts,
          factors,
          vat,
          rowTotalAdditional,
          type
        );
        setTaxes(taxItems || []);
      }
    }
  }, [defaultValue?.Data, pureAmount, vat, rowTotalAdditional, type]);

  const taxesOptions = data?.Data?.map((option) => ({
    label: option?.TaxDesc,
    value: option?.TaxId,
  }));

  const handleDelete = (id: number) => {
    setTaxes((prev = []) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = () => {
    setTaxes((prev = []) => {
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
    if (taxes?.length > 0) {
      const { taxItems } = calcTax(
        pureAmount,
        taxes,
        record?.DiscountItems,
        record?.AddElementDetailItems,
        vat,
        rowTotalAdditional,
        type
      );
      detailConfigModal.helpers.dispatchDetailData({
        type: "UPDATE_ROW",
        payload: {
          index,
          data: {
            TaxItems: taxItems,
            TaxIds: taxes?.map((item) => item.TaxId),
          },
        },
      });
    } else {
      detailConfigModal.helpers.dispatchDetailData({
        type: "UPDATE_ROW",
        payload: {
          index,
          data: {
            TaxItems: [],
            TaxIds: [],
          },
        },
      });
    }
  }, [taxes]);

  return (
    <div
      className={` flex flex-col gap-2 p-2  border-gray-gray55 rounded-xl hidden-show-scrollBar overflow-auto`}
    >
      {taxes?.map((item, index) => (
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
                const info = data?.Data?.find((d) => d?.TaxId === newValue);

                setTaxes((prev = []) =>
                  prev.map((it, idx) =>
                    idx === index
                      ? {
                          ...info,
                          TaxId: info?.TaxId,
                          amount:
                            (pureAmount || 0) * ((info?.TaxRate || 0) / 100),
                          deletable: true,
                        }
                      : it
                  )
                );
              }}
            />
          </div>

          {item?.TaxRate ? (
            <span className="text-center">
              % {item?.TaxRate ? item?.TaxRate?.toLocaleString("fa-IR") : "-"}
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
