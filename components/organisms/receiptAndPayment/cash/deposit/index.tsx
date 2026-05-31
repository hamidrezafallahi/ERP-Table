"use client";
import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  AdvancedCashDepositForm,
} from '@components/molecules/receiptAndPayment/cash';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import type {
  ICashDeposit,
  IRequest,
} from '@services/trh/cashDeposit/type';
import {
  setAllPageData,
  setPageInfo,
} from '@slice/pages';

import { formConfig } from './config';

export const AdvancedCashDeposit = ({ form }) => {
  const params = useSearchParams();
  const dispatch = useDispatch();
  const id = Number(params.get("id"));

  const titleKey = "VoucherNumber";
  const fieldKey = "CashStatementId";
  const repoViewId = 140011;
  const getUrl = "api/trh/select/cashStatement/deposit";
  const addUrl = "api/trh/insert/cashStatement/deposit";
  const updateUrl = "api/trh/update/cashStatement/deposit";
  const deleteUrl = "api/trh/delete/cashStatement/deposit";

  const info = {
    addEndpoint: addUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: fieldKey,
  };

  const { data, isSuccess: defaultValueSuccess } = useGetData<
    ICashDeposit[],
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
      <AdvancedCashDepositForm activePage={activePage} form={form} />
    </>
  );
};
