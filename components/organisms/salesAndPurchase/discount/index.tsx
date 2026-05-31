"use client";
import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { DiscountForm } from '@components/molecules/salesAndPurchase/discount';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import type { IDiscount } from '@services/sale/discount/type';
import type { IRequest } from '@services/trh/bankDeposit/type';
import {
  setAllPageData,
  setPageInfo,
} from '@slice/pages';

import { formConfig } from './config';

export const Discount = ({ form }) => {
  const params = useSearchParams();
  const dispatch = useDispatch();
  const id = Number(params.get("id"));
  const titleKey = "DiscountNumber";
  const fieldKey = "DiscountId";
  const info = {
    addEndpoint: "api/sale/insert/discount",
    deleteEndpoint: "api/sale/delete/discount",
    updateEndpoint: "api/sale/update/discount",
    formIdField: "DiscountId",
  };

  const { data, isSuccess: defaultValueSuccess } = useGetData<
    IDiscount[],
    IRequest
  >({
    url: "api/sale/select/discount",
    body: {
      RepoViewId: 3010,
      Id: id,
      ShowBookmarked: true,
      ShowTags: true,
    },
    skip: !id,
    id,
  });

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find(
        (item) => item.isActive === true
      ),
    }),
    shallowEqual
  );
  const pageId = activePage?.pageId;

  useEffect(() => {
    if (!id || defaultValueSuccess) {
      let defaultValue = data?.Data?.map((item) => {
        return {
          ...item,
          CustomerDiscountIds: item.CustomerDiscounts.map(
            (item) => item.CustomerId
          ),
          CustomerGroupDiscountIds: item.CustomerGroupDiscounts.map(
            (item) => item.CustomerGroupId
          ),

          GoodsDiscountIds: item.GoodsDiscounts.map((item) => item.GoodsId),

          GoodsCategoryDiscountIds: item.GoodsCategoryDiscounts.map(
            (item) => item.GoodsCategoryId
          ),

          DiscountPaymentWaysIds: item.DiscountPaymentWays.map(
            (item) => item.PaymentWayId
          ),
          DiscountSaleTeamIds: item.DiscountSaleTeams.map(
            (item) => item.SaleTeamId
          ),
          DiscountLocationsIds: item.DiscountLocations.map(
            (item) => item.LocationId
          ),
          DiscountSaleTypesIds: item.DiscountSaleTypes.map(
            (item) => item.SaleTypeId
          ),
        };
      });

      const defaultValues = defaultValue?.length > 0 ? defaultValue[0] : null;
      let formData;
      if (!id) {
        defaultValue = null;
      }
      if (defaultValues) {
        formData = formConfig.map((item) => {
          const newValue = {
            ...item,
            value: defaultValues[item.name],
            originalValue: defaultValues[item.name],
            isTitleField: item.name === titleKey,
          };
          return newValue;
        });
      } else {
        formData = formConfig.map((item) => {
          return {
            ...item,
            isTitleField: item.name === titleKey,
            value: item.type === "array" ? [] : undefined,
            originalValue: item.type === "array" ? [] : undefined,
          };
        });
      }

      if (id) {
        formData.push({
          name: fieldKey,
          caption: "MainIdField",
          value: id,
          originalValue: id,
          isTitleField: true,
          type: " ",
        });
      }

      dispatch(setAllPageData(formData));
      dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
    }
  }, [data?.Data]);

  return (
    <>
      <DiscountForm defOpt={data?.Data} form={form} id={id} />
    </>
  );
};
