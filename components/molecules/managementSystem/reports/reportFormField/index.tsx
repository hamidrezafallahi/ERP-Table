import { Form } from "antd";
import { shallowEqual } from "react-redux";

import {
  DynamicMultiSelect,
  MultiSelectWithList,
} from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import DynamicRadio from "@components/molecules/dynamicRadioList";
import { useAppSelector } from "@redux/index";
import { ReportTypeEnum } from "@services/mng/report/type";

import type { IProps } from "./type";

export const ReportFormField = ({ defOpt, form }: IProps) => {
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  const conditionValue = Form.useWatch("Type", form);

  const dataSourcesDef = defOpt?.[0]?.ReportDataSources?.map((item) => ({
    name: item.Title,
    value: item.Value,
  }));

  return (
    <Form
      form={form}
      name="reportForm"
      layout="vertical"
      className={`${
        !match ? "flex flex-col gap-2" : "grid grid-cols-2 gap-2 overflow-auto"
      } hidden-show-scrollBar`}
    >
      <Form.Item label="عنوان" name="Title" className="!mb-0 !pb-0 text-xs">
        <InputText
          config={{
            caption: "عنوان",
            name: "Title",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item label="نوع" name="Type" className="!mb-0 !pb-0 text-xs">
        <DynamicRadio
          item={{
            radioValues: [
              {
                caption: "گزارش",
                value: 1,
              },
              {
                caption: "داشبورد",
                value: 2,
              },
              {
                caption: "چاپ",
                value: 3,
              },
            ],
          }}
          config={{
            caption: "نوع",
            name: "Type",
            type: "radio",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      {conditionValue === ReportTypeEnum.Dashboard && (
        <Form.Item
          label="مخزن داده"
          name="DataSourceIds"
          className="!mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/report/select/DataSources",
                endpoint: "api/report/select/DataSources",
                repoViewId: 12005,
                type: 1,
              }}
              config={{
                caption: "مخزن داده",
                name: "DataSourceIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={dataSourcesDef}
              dynamicValue={{
                addWebUrl: "api/report/select/DataSources",
                endpoint: "api/report/select/DataSources",
                repoViewId: 12005,
                type: 1,
              }}
              config={{
                caption: "مخزن داده",
                name: "DataSourceIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          )}
        </Form.Item>
      )}
      {conditionValue === ReportTypeEnum.Report && (
        <Form.Item
          label="مخزن داده"
          name="DataSourceIds"
          className="!mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/report/select/DataSources",
                endpoint: "api/report/select/DataSources",
                repoViewId: 12005,
                type: 2,
              }}
              config={{
                caption: "مخزن داده",
                name: "DataSourceIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={dataSourcesDef}
              dynamicValue={{
                addWebUrl: "api/report/select/DataSources",
                endpoint: "api/report/select/DataSources",
                repoViewId: 12005,
                type: 2,
              }}
              config={{
                caption: "مخزن داده",
                name: "DataSourceIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          )}
        </Form.Item>
      )}
      {conditionValue === ReportTypeEnum.Print && (
        <Form.Item
          label="مخزن داده"
          name="DataSourceIds"
          className="!mb-0 !pb-0 text-xs"
        >
          {!match ? (
            <DynamicMultiSelect
              dynamicValue={{
                addWebUrl: "api/report/select/DataSources",
                endpoint: "api/report/select/DataSources",
                repoViewId: 12005,
                type: 3,
              }}
              config={{
                caption: "مخزن داده",
                name: "DataSourceIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          ) : (
            <MultiSelectWithList
              defOption={dataSourcesDef}
              dynamicValue={{
                addWebUrl: "api/report/select/DataSources",
                endpoint: "api/report/select/DataSources",
                repoViewId: 12005,
                type: 3,
              }}
              config={{
                caption: "مخزن داده",
                name: "DataSourceIds",
                setFieldValue: form.setFieldValue,
              }}
            />
          )}
        </Form.Item>
      )}
    </Form>
  );
};
