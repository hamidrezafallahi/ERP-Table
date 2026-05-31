import React from 'react';

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
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import { SpinIcon } from '@components/atoms/iconComponents';
import RadioList from '@components/molecules/radioList';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setPageData } from '@slice/pages';

import { useFetchDataForComparativeReport } from '../hook';
import ComparativeReportTable from './comparativeReportTable';

enum eCirculationType {
  Remaining = 1,
  CreditorCirculation = 2,
  DebtorCirculation = 3,
}

export default function ComparativeReportContext() {
  const [form] = Form.useForm();
  const { viewData,reportMode } = useAppSelector((state) => {
    const viewData = state.withPersist.pages?.find(
      (page) => page.isActive,
    )?.viewData;
     const reportMode= state.withPersist.pages
        .find((item) => item.isActive)
        ?.pageData?.find((d) => d.name == "reportMode")?.value
    return {
      viewData,
      reportMode
    };
  }, shallowEqual);
  const t = useTranslations();
  const dispatch = useDispatch();
  const [fetchDataForComparative, state] = useFetchDataForComparativeReport();
  const { data, isLoading, PageNumber, PageRecordCount } = state;

  const handleSubmit = async (values, page = 1, pageSize = 10) => {
    let payload = {
        url: "api/acc/select/ComparativeReport",
        body: {
          ...values,
          StartDate: viewData.StartDate,
          EndDate: viewData.EndDate,
           Filters: viewData.Filters,
           ReportMode :reportMode  ,
          AccountIds :[],
          PagingInfo: {
            PageNumber: page,
            PageRecordCount: pageSize,
          },
        },
      };
    

    const res = await fetchDataForComparative(payload);
  };

  const circulationType: SelectProps["options"] = [
    {
      title: t(`report.header.circulationType.${eCirculationType.Remaining}`),
      value: eCirculationType.Remaining,
      label: t(`report.header.circulationType.${eCirculationType.Remaining}`),
    },
    {
      title: t(
        `report.header.circulationType.${eCirculationType.DebtorCirculation}`,
      ),
      value: eCirculationType.DebtorCirculation,
      label: t(
        `report.header.circulationType.${eCirculationType.DebtorCirculation}`,
      ),
    },
    {
      title: t(
        `report.header.circulationType.${eCirculationType.CreditorCirculation}`,
      ),
      value: eCirculationType.CreditorCirculation,
      label: t(
        `report.header.circulationType.${eCirculationType.CreditorCirculation}`,
      ),
    },
  ];

  const handlePaginationChange = (page: number) => {
    const values = form.getFieldsValue();
    handleSubmit(values, page, PageRecordCount);
  };
  const handlePageSizeChange = (pagesize: number) => {
    const values = form.getFieldsValue();
    // فراخوانی مستقیم تابع با مقادیر فرم و سایز جدید
    handleSubmit(values, PageNumber, pagesize);
  };

  return (
    <div className="flex flex-col gap-4">
      <Form
        form={form}
        name="contextForm"
        layout="vertical"
        onFinish={handleSubmit}
        className="flex gap-4 w-full h-40 min-h-40"
        initialValues={{
          circulationType: eCirculationType.Remaining,
          DevidePerThis: 1,
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
        <Form.Item
          name="circulationType"
          label="نوع گردش"
          className="!mb-0 w-fit"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <RadioList
            config={{ name: "circulationType" }}
            options={circulationType}
            className=" "
          ></RadioList>
        </Form.Item>
        <Form.Item
          name="DevidePerThis"
          label="تعداد تقسیم بازه زمانی"
          className="!mb-0"
          rules={[{ required: true, message: t("form.required") },
            { type: "number", min: 1, max: 12 }
          ]}
        >
          <CustomInputNumber
            controls={false}
            
           />
        </Form.Item>
        <Form.Item className="flex flex-1 justify-end items-end gap-4 m-0 p-0 text-xs">
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
      </Form>
      <ComparativeReportTable
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
