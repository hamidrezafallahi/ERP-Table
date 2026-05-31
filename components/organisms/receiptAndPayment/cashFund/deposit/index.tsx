"use client";
import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  AdvancedCashFundDepositForm,
} from '@components/molecules/receiptAndPayment/cashFund';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import type {
  ICashFundDeposit,
  IRequest,
} from '@services/trh/cashFundDeposit/type';
import {
  setAllPageData,
  setPageInfo,
} from '@slice/pages';

import { formConfig } from './config';

export const AdvancedCashFundDeposit = ({ form }) => {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const id = Number(params.get("id"));

  const titleKey = "VoucherNumber";
  const fieldKey = "TankhahStatementId";
  const repoViewId = 3016;
  const getUrl = "api/trh/select/tankhahStatement/deposit";
  const addUrl = "api/trh/insert/tankhahStatement/deposit";
  const updateUrl = "api/trh/update/tankhahStatement/deposit";
  const deleteUrl = "api/trh/delete/tankhahStatement/deposit";

  const info = {
    addEndpoint: addUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: fieldKey,
  };

  const { data, isSuccess: defaultValueSuccess } = useGetData<
    ICashFundDeposit[],
    IRequest
  >({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
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
      let defaultValue = data?.Data[0];
      let formData;
      if (!id) {
        defaultValue = null;
      }
      if (defaultValue) {
        formData = formConfig.map((item) => {
          const newValue = {
            ...item,
            value: defaultValue[item.name],
            originalValue: defaultValue[item.name],
            isTitleField: item.name === titleKey,
          };
          return newValue;
        });
        // tagsInfo = defaultValue.TagsInfo;
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

  return <AdvancedCashFundDepositForm activePage={activePage} form={form} />;
};
