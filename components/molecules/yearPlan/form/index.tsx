import { FC } from "react";

import { Form } from "antd";
import { useTranslations } from "next-intl";

import { NewDatePicker } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";

import { useSearchParams } from "next/navigation";
import { useGetData } from "@services/base";
import { IRequest } from "@services/mng/report/type";
import { IYearPlan } from "@services/prd/yearPlan/type";

export const YearPlanForm: FC<any> = ({ form, isEdit }) => {
  const t = useTranslations();

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const params = useSearchParams();
  const isReadOnly = mode === "showHistory";
  const id = Number(params.get("id"));
  const { data } = useGetData<IYearPlan[], IRequest>({
    url: "/api/prd/select/yearPlan",
    body: {
      RepoViewId: 150015,
      Id: id,
      ShowBookmarked: true,
      ShowTags: true,
    },
    skip: !id,
    id: id,
  });

  const newDate = new Date(data?.Data?.[0]?.Date).toLocaleDateString("fa-IR");

  return (
    <Form
      form={form}
      layout="vertical"
      className="flex flex-col gap-3 lg:gap-2 lg:grid lg:grid-cols-4"
    >
      <Form.Item
        label={t("general.year")}
        name="Year"
        {...(!isEdit && {
          rules: [
            {
              required: true,
              message: "این فیلد الزامی است.",
              type: "string",
            },
          ],
        })}
        className={`flex flex-col  ${
          isEdit || isReadOnly ? "opacity-65" : ""
        } !mb-0 !pb-0 text-xs`}
      >
        <InputText
          disabled={isEdit || isReadOnly}
          config={{
            caption: t("general.year"),
            name: "Year",
            type: "text",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item
        label={t("general.date")}
        name="Date"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "date" },
        ]}
        className={`flex flex-col ${
          isReadOnly ? "opacity-65" : ""
        } !mb-0 !pb-0 text-xs`}
      >
        {isReadOnly ? (
          <div className="flex items-center bg-gray-gray3 opacity-65 p-3 rounded w-full h-[34px] text-gray-gray8 cursor-not-allowed">
            {newDate}
          </div>
        ) : (
          <NewDatePicker
            config={{
              caption: t("general.date"),
              name: "Date",
              type: "date",
              setFieldValue: form.setFieldValue,
            }}
          />
        )}
      </Form.Item>
      <Form.Item
        label={t("general.versionNumber")}
        name="Verson"
        className={`flex flex-col  ${
          isEdit || isReadOnly ? "opacity-65" : ""
        } !mb-0 !pb-0 text-xs`}
        {...(!isEdit && {
          rules: [
            {
              required: true,
              message: "این فیلد الزامی است.",
              type: "string",
            },
          ],
        })}
      >
        <InputText
          disabled={isEdit || isReadOnly}
          config={{
            caption: t("general.versionNumber"),
            name: "Verson",
            type: "text",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
    </Form>
  );
};
