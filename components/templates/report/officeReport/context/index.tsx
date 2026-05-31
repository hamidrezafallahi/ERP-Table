import React, { useEffect } from 'react';

import {
  Form,
  Spin,
} from 'antd';
import { SelectProps } from 'antd/lib';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import { SpinIcon } from '@components/atoms/iconComponents';
import RadioList from '@components/molecules/radioList';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetConfigValueById } from '@hooks/custom/useGetConfigValueById';
import {
  setPageData,
  setPageFilters,
} from '@slice/pages';

import { ReportMode } from '../../type';
import { useFetchDataForOfficeReport } from '../hook';
import OfficeReportTable from './officeReportTable';

enum eLedgerReportType {
  Journal = 1,
  GeneralLedger = 2,
  Summary = 3,
}
enum eReportType {
  Normal = 1,
  Day = 2,
  Month = 3,
}

export default function OfficeReportContext() {
  const [form] = Form.useForm();
  const { viewData } = useAppSelector((state) => {
    const viewData = state.withPersist.pages?.find(
      (page) => page.isActive,
    )?.viewData;
    return {
      viewData,
    };
  }, shallowEqual);
  const t = useTranslations();
  const dispatch = useDispatch();
  const [fetchDataForOffice, state] = useFetchDataForOfficeReport();
  const { data, isLoading, PageNumber, PageRecordCount } = state;
  const LedgerType = Form.useWatch("LedgerType", form);
  const reportMode = Form.useWatch("reportMode", form);
  const handleSubmit = async (values, page = 1, pageSize = 10) => {
    let payload;
    if (viewData?.reportType == 2) {
      payload = {
        url: "api/acc/select/LegderJornalReport",
        body: {
          StartDate: viewData.StartDate,
          EndDate: viewData.EndDate,
          reportType: viewData.reportType,
          LedgerType: values["LedgerType"],
          eRepReviewMode: ReportMode.bookkeeping,
          ShowMoeen: viewData.isShowMoeen ?? false,
          Filters: viewData.Filters,
          dayType: values["dayType"],
          PagingInfo: {
            PageNumber: page,
            PageRecordCount: pageSize,
          },
        },
      };
    } else {
      payload = {
        url: "api/acc/Select/OfficeMoeenReport",
        body: {
          StartDate: viewData.StartDate,
          EndDate: viewData.EndDate,
          reportType: viewData.reportType,
          reportMode: values["reportMode"],
          ShowMoeen: reportMode === 3 ? false : (viewData.isShowMoeen ?? false),
          Filters: viewData.Filters,
          AccountIds: [],
          PagingInfo: {
            PageNumber: page,
            PageRecordCount: pageSize,
          },
        },
      };
    }

    const res = await fetchDataForOffice(payload);
  };

  const bookKippingOption: SelectProps["options"] = [
    {
      title: t("report.header.summaryDoc"),
      value: eLedgerReportType.Summary,
      label: t("report.header.summaryDoc"),
    },
    {
      title: t("report.header.journal"),
      value: eLedgerReportType.Journal,
      label: t("report.header.journal"),
    },
    {
      title: t("report.header.generalLedger"),
      value: eLedgerReportType.GeneralLedger,
      label: t("report.header.generalLedger"),
    },
  ];
  const reportTypeOption: SelectProps["options"] = (() => {
    switch (LedgerType) {
      case eLedgerReportType.Summary:
        return [
          {
            title: t("report.header.day"),
            value: eReportType.Day,
            label: t("report.header.day"),
          },
          {
            title: t("report.header.month"),
            value: eReportType.Month,
            label: t("report.header.month"),
          },
        ];

      case eLedgerReportType.Journal:
      case eLedgerReportType.GeneralLedger:
        return [
          {
            title: t("report.header.normal"),
            value: eReportType.Normal,
            label: t("report.header.normal"),
          },
          {
            title: t("report.header.day"),
            value: eReportType.Day,
            label: t("report.header.day"),
          },
          {
            title: t("report.header.month"),
            value: eReportType.Month,
            label: t("report.header.month"),
          },
        ];

      default:
        return [];
    }
  })();

  const {Value} = useGetConfigValueById({ id: 5006 });
  const level =  Number(Value)

  const booksOption: SelectProps["options"] = Array.from(
    { length: level },
    (_, i) => {
      return {
        title: t(`report.header.${i + 1}`),
        value: i + 1,
        label: t(`report.header.${i + 1}`),
      };
    },
  ).splice(2, 13);
  const handlePaginationChange = (page: number) => {
    const values = form.getFieldsValue();
    handleSubmit(values, page, PageRecordCount);
  };
  const handlePageSizeChange = (pagesize: number) => {
    const values = form.getFieldsValue();
    // فراخوانی مستقیم تابع با مقادیر فرم و سایز جدید
    handleSubmit(values, PageNumber, pagesize);
  };
  const handleClick = (e) => {
    dispatch(
      setPageFilters({
        isShowMoeen: e.target.checked,
      }),
    );
  };
  useEffect(() => {
    if (LedgerType) {
      switch (LedgerType) {
        case eLedgerReportType.Summary:
          form.setFieldValue("dayType", eReportType.Day);
          break;
        case eLedgerReportType.Journal:
        case eLedgerReportType.GeneralLedger:
          form.setFieldValue("dayType", eReportType.Normal);
          break;

        default:
          form.setFieldValue("dayType", eReportType.Day);
          break;
      }
    }
  }, [LedgerType]);
  useEffect(() => {
    if (viewData?.reportType) {
      dispatch(
        setPageData({
          name: "isShowMoeen",
          value: false,
        }),
      );
    }
  }, [viewData?.reportType]);
  return (
    <div className="flex flex-col gap-4">
      <Form
        form={form}
        name="contextForm"
        layout="vertical"
        onFinish={handleSubmit}
        className="flex flex-col gap-4 w-full h-56 min-h-56"
        initialValues={{
          LedgerType: 3,
          reportMode: 3,
          dayType: eReportType.Day,
        }}
        onValuesChange={() => {
          dispatch(
            setPageData({
              name: "tableData",
              value: null,
            }),
          );
        }}
      >
        <Form.Item name="isShowMoeen" layout="horizontal" className="!mb-0">
          <CustomCheckbox
            disabled={reportMode === 3}
            config={{ name: "isShowMoeen" }}
            className="flex justify-between items-center w-fit whitespace-nowrap"
            onClick={handleClick}
          >
            {" : "}
            {t("report.header.recordingToSubsidiaryAccount")}
          </CustomCheckbox>
        </Form.Item>
        {viewData?.reportType == ReportMode.bookkeeping ? (
          <div className="flex flex-col flex-1 gap-4">
            <Form.Item
              name="LedgerType"
              label="انتخاب گزارش"
              className="!mb-0"
              rules={[{ required: true, message: t("form.required") }]}
            >
              <RadioList
                config={{ name: "LedgerType" }}
                options={bookKippingOption}
                className="flex justify-start"
              ></RadioList>
            </Form.Item>
            <Form.Item
              name="dayType"
              label="نوع گزارش"
              className="!mb-0"
              rules={[{ required: true, message: t("form.required") }]}
            >
              <RadioList
                config={{ name: "dayType" }}
                options={reportTypeOption}
                className="flex justify-start"
              ></RadioList>
            </Form.Item>
          </div>
        ) : (
          <Form.Item
            name="reportMode"
            label="انتخاب گزارش"
            className="flex flex-col flex-1 gap-4 !mb-0"
            rules={[{ required: true, message: t("form.required") }]}
          >
            <RadioList
              config={{ name: "reportMode" }}
              options={booksOption}
              className="gap-y-10 !grid !grid-cols-6 !grid-flow-row h-[110px]"
            ></RadioList>
          </Form.Item>
        )}

        <div className="flex justify-end items-end gap-4">
          {viewData?.reportType === 2 &&
            LedgerType === eLedgerReportType.Journal && (
              <CustomButton
                type="text"
                htmlType="button"
                onClick={() => console.log("خروجی دفاتر الکترونیک")}
                className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
              >
                {t("report.header.electronicOfficeExport")}
              </CustomButton>
            )}
          <CustomButton
            type="text"
            htmlType="button"
            onClick={() => console.log("چاپ")}
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            {t("general.print")}
          </CustomButton>
          <Form.Item className="m-0 p-0 text-xs">
            <CustomButton
              type="text"
              htmlType="submit"
              className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
            >
              {false ? (
                <Spin size="large" indicator={<SpinIcon />} />
              ) : (
                t("general.show")
              )}
            </CustomButton>
          </Form.Item>
        </div>
      </Form>
      <OfficeReportTable
        PageNumber={PageNumber}
        PageRecordCount={PageRecordCount}
        data={data}
        isLoading={isLoading}
        handlePaginationChange={handlePaginationChange}
        handlePageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
