"use client";
import { useEffect } from "react";

import { useSearchParams } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { useAppSelector } from "@redux/index";
import { ITafsiliType } from "@services/acc/tafsiliType/type";
import { useGetData } from "@services/base";
import type { IRequest } from "@services/trh/cashFundDeposit/type";
import { setAllPageData, setPageInfo } from "@slice/pages";

import { TafsiliTypeForm } from "@components/molecules/accounting";
import { formConfig } from "./config";

export const TafsiliType = ({ form }) => {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const id = Number(params.get("id"));

  const titleKey = "TafsiliTypeDesc";
  const fieldKey = "TafsiliTypeId";
  const repoViewId = 10004;
  const getUrl = "/api/acc/select/tafsiliType";
  const addUrl = "/api/acc/insert/tafsiliType";
  const updateUrl = "/api/acc/update/tafsiliType";
  const deleteUrl = "/api/acc/delete/tafsiliType";

  const info = {
    addEndpoint: addUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: fieldKey,
  };

  const { data, isSuccess: defaultValueSuccess } = useGetData<
    ITafsiliType[],
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
            value:
              item.type === "array" ? defaultValue : defaultValue[item.name],
            originalValue:
              item.type === "array" ? defaultValue : defaultValue[item.name],
            isTitleField: item.name === titleKey,
          };
          return newValue;
        });
        // tagsInfo = defaultValue.TagsInfo;
      } else {
        formData = formConfig.map((item) => {
          const undefinedValue =
            item.type === "checkBox"
              ? false
              : item.type === "bool"
              ? false
              : item.type === "radio"
              ? item.radioValues?.[0]?.value
              : item.type === "array"
              ? []
              : undefined;
          return {
            ...item,
            isTitleField: item.name === titleKey,
            value: undefinedValue,
            originalValue: undefinedValue,
          };
        });
      }

      if (id) {
        formData.push({
          name: fieldKey,
          caption: "MainIdField",
          value: id,
          originalValue: id,
          isTitleField: false,
          type: "",
        });
      }
      dispatch(setAllPageData(formData));
      dispatch(setPageInfo({ pageId: pageId, pageInfo: info }));
    }
  }, [data?.Data]);

  return (
    <>
      <TafsiliTypeForm form={form} />
    </>
  );
};
