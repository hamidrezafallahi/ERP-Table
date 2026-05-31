"use client";
import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  SalesCircularForm,
} from '@components/molecules/salesAndPurchase/salesCircular';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import type { ISalesCircular } from '@services/sale/salesCircular/type';
import type { IRequest } from '@services/trh/bankDeposit/type';
import {
  setAllPageData,
  setPageInfo,
} from '@slice/pages';

import { formConfig } from './config';

export const SalesCircular = ({ form }) => {
  const params = useSearchParams();
  const dispatch = useDispatch();
  const id = Number(params.get("id"));
  const titleKey = "SaleRuleNumber";
  const fieldKey = "SaleRuleId";
  const info = {
    addEndpoint: "api/sale/insert/saleRule",
    deleteEndpoint: "api/sale/delete/saleRule",
    updateEndpoint: "api/sale/update/saleRule",
    formIdField: "SaleRuleId",
  };

  const { data, isSuccess: defaultValueSuccess } = useGetData<
    ISalesCircular[],
    IRequest
  >({
    url: "api/sale/select/saleRule",
    body: {
      RepoViewId: 130057,
      Id: id,
      ShowBookmarked: true,
      ShowTags: true,
    },
    skip: !id,
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
      let defaultValue = data?.Data?.map((item) => ({
        ...item,
        GoodsRuleIds: item.GoodsRules.map((item) => item.GoodsId),
        GoodsCategoryRuleIds: item.GoodsCategoryRules.map(
          (item) => item.GoodsCategoryId
        ),
        CustomerRuleIds: item.CustomerRules.map((item) => item.CustomerId),
        CustomerGroupRuleIds: item.CustomerGroupRules.map(
          (item) => item.CustomerGroupId
        ),
      }));
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
        formData = formConfig.map((item) => ({
          ...item,
          isTitleField: item.name === titleKey,
          value: undefined,
          originalValue: undefined,
        }));
      }

      if (id) {
        formData.push({
          name: fieldKey,
          caption: "MainIdField",
          value: id,
          originalValue: id,
          isTitleField: true,
          type: "",
        });
      }
      dispatch(setAllPageData(formData));
      dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
    }
  }, [data?.Data]);

  return (
    <>
      <SalesCircularForm activePage={activePage} form={form} />
    </>
  );
};
