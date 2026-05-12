import React from "react";
import { CustomSelect } from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { Form, FormInstance, Radio } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";
import { selectOptionCol, selectsConfig, sourceArray } from "./content";
import { useGetAccountLevel } from "@hooks/custom/useGetAccountLevel";

interface ComprehensiveReportSidebarProps {
  sidebarForm: FormInstance<any>;
}

const ComprehensiveReportSidebar = (props: ComprehensiveReportSidebarProps) => {
  const { sidebarForm } = props;
  const t = useTranslations();
  const formValues = Form.useWatch([], sidebarForm);
  const reportType = Form.useWatch("reportType", sidebarForm);
  const { match } = useAppSelector(
    (state) => ({
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  console.log({ formValues });

  const filteredSourceArray = sourceArray?.filter((item) => item.value !== 1);
  const { selectOption } = useGetAccountLevel({
    sourceArray: filteredSourceArray,
  });

  return (
    <div
      className={`${match ? "h-full" : reportType === "Analytical" ? "h-[calc(100dvh+72rem)]" : "h-[calc(100dvh-28rem)]"} overflow-hidden flex flex-col gap-3 p-4 border rounded-lg w-full lg:w-60 lg:min-w-60`}
    >
      <Form
        form={sidebarForm}
        name="sidebarForm"
        layout="vertical"
        className="flex flex-col gap-4 w-full"
        onValuesChange={(changedValues) => {
          if (changedValues.reportType === "Simple") {
            const analyticalFields = selectsConfig.map((s) => s.name);
            sidebarForm.resetFields(analyticalFields);
          }
          if (changedValues.reportType === "Analytical") {
            sidebarForm.resetFields(["ReportMode"]);
          }
        }}
      >
        <Form.Item
          label="تعداد ستون"
          name="AccGlobalReportCol"
          className="w-full !mb-0 text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <CustomSelect
            showSearch
            allowClear
            onClear={() => sidebarForm.resetFields(["ColumnCount"])}
            optionFilterProp={"label"}
            className="!h-10 text-xs"
            placeholder={t("general.selectField")}
            options={selectOptionCol}
            autoFocus
          />
        </Form.Item>
        <Form.Item
          name="reportType"
          label="نوع گزارش"
          className="!mb-0"
          rules={[{ required: true, message: t("form.required") }]}
          initialValue={"Simple"}
        >
          <Radio.Group className="flex flex-col gap-4">
            <Radio value="Simple">ساده</Radio>
            <Form.Item
              name="ReportMode"
              className="!mb-0"
              rules={[{ required: true, message: t("form.required") }]}
            >
              <CustomSelect
                showSearch
                allowClear
                optionFilterProp={"label"}
                className="!h-10 text-xs"
                placeholder={t("general.selectField")}
                options={selectOption}
                autoFocus
                onClear={() => sidebarForm.resetFields(["ReportMode"])}
                disabled={reportType === "Analytical"}
              />
            </Form.Item>
            <Radio value="Analytical">تحلیلی</Radio>
            {reportType === "Analytical" && (
              <div
                className={`${match ? "h-[calc(100dvh-28.5rem)]" : "h-[calc(100dvh-38rem)]"} flex flex-col gap-4 overflow-y-scroll`}
              >
                {selectsConfig.map((item, i) => {
                  if (item.index <= selectOption.length + 1) {
                    const prevValue =
                      i === 0 ? true : formValues?.[selectsConfig[i - 1].name];
                    const isDisabled = !prevValue;
                    const selectedPrev = selectsConfig
                      .slice(0, i)
                      .map((c) => formValues?.[c.name])
                      .filter(Boolean);
                    const currentOptions = sourceArray
                      .slice(0, selectOption.length + 1)
                      .filter((opt) => !selectedPrev.includes(opt.value));
                    return (
                      <Form.Item
                        key={item.name}
                        name={item.name}
                        label={item.label}
                        className="!mb-0"
                      >
                        <CustomSelect
                          showSearch
                          allowClear
                          optionFilterProp={"label"}
                          className="!h-10 text-xs"
                          placeholder={t("general.selectField")}
                          options={currentOptions}
                          autoFocus={i === 0}
                          disabled={isDisabled}
                          onClear={() => sidebarForm.resetFields([item.name])}
                        />
                      </Form.Item>
                    );
                  }
                })}
              </div>
            )}
          </Radio.Group>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ComprehensiveReportSidebar;
