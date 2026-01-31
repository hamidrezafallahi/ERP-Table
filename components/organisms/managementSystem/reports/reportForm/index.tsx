"use client";
import { useEffect } from "react";

import { useSearchParams } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { ReportFormField } from "@components/molecules/managementSystem/reports";
import { useAppSelector } from "@redux/index";
import { useGetData } from "@services/base";
import type { IReport, IRequest } from "@services/mng/report/type";
import { setAllPageData, setPageInfo } from "@slice/pages";

import { formConfig } from "./config";

export const ReportForm = ({ form }) => {
  const params = useSearchParams();
  const dispatch = useDispatch();
  const id = Number(params.get("id"));
  const titleKey = "Title";
  const fieldKey = "ReportId";
  const info = {
    addEndpoint: "/api/report/insert/reports",
    deleteEndpoint: "/api/report/delete/reports",
    updateEndpoint: "/api/report/update/reports",
    formIdField: "ReportId",
  };

  const { data, isSuccess: defaultValueSuccess } = useGetData<
    IReport[],
    IRequest
  >({
    url: "/api/report/select/reports",
    body: {
      RepoViewId: 120001,
      Id: id,
      ShowBookmarked: true,
      ShowTags: true,
    },
    skip: !id,
    id,
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
      let defaultValue = data?.Data?.map((item) => {
        return {
          ...item,
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
      <ReportFormField defOpt={data?.Data} form={form} />
    </>
  );
};
