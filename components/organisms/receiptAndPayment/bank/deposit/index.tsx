"use client";
import { useEffect } from "react";

import { useSearchParams } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { AdvancedBankDepositForm } from "@components/molecules/receiptAndPayment/bank";
import { useAppSelector } from "@redux/index";
import { useGetData } from "@services/base";
import type { IBankDeposit, IRequest } from "@services/trh/bankDeposit/type";
import { setAllPageData, setPageInfo } from "@slice/pages";

import { formConfig } from "./config";

export const AdvancedBankDeposit = ({ form }) => {
  const params = useSearchParams();
  const dispatch = useDispatch();
  const id = Number(params.get("id"));

  const titleKey = "VoucherNumber";
  const fieldKey = "BankStatementId";
  const repoViewId = 3010;
  const getUrl = "api/trh/select/bankStatement/deposit";
  const addUrl = "api/trh/insert/bankStatement/deposit";
  const updateUrl = "api/trh/update/bankStatement/deposit";
  const deleteUrl = "api/trh/delete/bankStatement/deposit";

  const info = {
    addEndpoint: addUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: fieldKey,
  };

  const { data, isSuccess: defaultValueSuccess } = useGetData<
    IBankDeposit[],
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
      activePage: state.withPersist.pages.find(
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
      <AdvancedBankDepositForm activePage={activePage} form={form} />
    </>
  );
};
