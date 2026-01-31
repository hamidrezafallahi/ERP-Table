import { useEffect, useState } from "react";

import { Form } from "antd";
import { useTranslations } from "next-intl";

import CustomCheckbox from "@components/atoms/defaultElements/checkbox";
import InputText from "@components/atoms/defaultElements/inputText";
import type { IPlaceConfig } from "@services/auth/base/type";
import { useGetData } from "@services/base";

export const TafsiliTypeForm = ({ form }) => {
  const t = useTranslations();

  const [accessLevel, setAccessLevel] = useState(null);

  const { data: access } = useGetData<IPlaceConfig[], null>({
    url: `/api/mng/select/placeConfigValue`,
    body: {},
  });

  const CHECKBOX_FIELDS = [
    "IsTafsili",
    "IsFifth",
    "IsSix",
    "IsSeven",
    "IsEight",
    "IsNine",
    "IsTen",
    "IsEleven",
    "IsTwelve",
    "IsThirteen",
  ];

  useEffect(() => {
    if (access?.Data) {
      const accessData = access?.Data[0];
      const accessLevel = accessData?.AccLevel;
      setAccessLevel(accessLevel);
    }
  }, [access?.Data]);

  return (
    <Form
      form={form}
      name="tafsiliTypeForm"
      layout="vertical"
      className={`flex flex-col gap-4 lg:grid lg:grid-cols-4 lg:gap-4 max-h-[calc(100dvh-160px)] h-auto overflow-y-auto hidden-show-scrollBar`}
    >
      <Form.Item
        label="نام گروه تفصیلی"
        name="TafsiliTypeDesc"
        rules={[{ required: true, message: t("form.required") }]}
        className="!mb-0 !pb-0 text-xs"
      >
        <InputText
          config={{
            name: "TafsiliTypeDesc",
            caption: "نام گروه تفصیلی",
            help: "",
            placeHolder: "",
            type: "string",
            selectEndpoint: {},
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <div className="col-span-4 w-fit">
        {accessLevel && (
          <div className="flex flex-wrap gap-6 p-4 border-2 border-dashed">
            {accessLevel >= 4 && (
              <Form.Item
                label=""
                name="IsTafsili"
                valuePropName="checked"
                // rules={[{ required: true, message: t("form.required") }]}
                className="!mb-0 !pb-0 text-xs"
              >
                <CustomCheckbox
                  config={{
                    name: "IsTafsili",
                    caption: "سطح 4",
                    help: "",
                    placeHolder: "",
                    type: "checkbox",
                    selectEndpoint: {},
                    setFieldValue: form.setFieldValue,
                  }}
                >
                  سطح 4
                </CustomCheckbox>
              </Form.Item>
            )}
            {accessLevel >= 5 && (
              <Form.Item
                label=""
                name="IsFifth"
                valuePropName="checked"
                // rules={[{ required: true, message: t("form.required") }]}
                className="!mb-0 !pb-0 text-xs"
              >
                <CustomCheckbox
                  config={{
                    name: "IsFifth",
                    caption: "سطح 5",
                    help: "",
                    placeHolder: "",
                    type: "checkbox",
                    selectEndpoint: {},
                    setFieldValue: form.setFieldValue,
                  }}
                >
                  سطح 5
                </CustomCheckbox>
              </Form.Item>
            )}
            {accessLevel >= 6 && (
              <Form.Item
                label=""
                name="IsSix"
                valuePropName="checked"
                // rules={[{ required: true, message: t("form.required") }]}
                className="!mb-0 !pb-0 text-xs"
              >
                <CustomCheckbox
                  config={{
                    name: "IsSix",
                    caption: "سطح 6",
                    help: "",
                    placeHolder: "",
                    type: "checkbox",
                    selectEndpoint: {},
                    setFieldValue: form.setFieldValue,
                  }}
                >
                  سطح 6
                </CustomCheckbox>
              </Form.Item>
            )}
            {accessLevel >= 7 && (
              <Form.Item
                label=""
                name="IsSeven"
                valuePropName="checked"
                // rules={[{ required: true, message: t("form.required") }]}
                className="!mb-0 !pb-0 text-xs"
              >
                <CustomCheckbox
                  config={{
                    name: "IsSeven",
                    caption: "سطح 7",
                    help: "",
                    placeHolder: "",
                    type: "checkbox",
                    selectEndpoint: {},
                    setFieldValue: form.setFieldValue,
                  }}
                >
                  سطح 7
                </CustomCheckbox>
              </Form.Item>
            )}
            {accessLevel >= 8 && (
              <Form.Item
                label=""
                name="IsEight"
                valuePropName="checked"
                // rules={[{ required: true, message: t("form.required") }]}
                className="!mb-0 !pb-0 text-xs"
              >
                <CustomCheckbox
                  config={{
                    name: "IsEight",
                    caption: "سطح 8",
                    help: "",
                    placeHolder: "",
                    type: "checkbox",
                    selectEndpoint: {},
                    setFieldValue: form.setFieldValue,
                  }}
                >
                  سطح 8
                </CustomCheckbox>
              </Form.Item>
            )}
            {accessLevel >= 9 && (
              <Form.Item
                label=""
                name="IsNine"
                valuePropName="checked"
                // rules={[{ required: true, message: t("form.required") }]}
                className="!mb-0 !pb-0 text-xs"
              >
                <CustomCheckbox
                  config={{
                    name: "IsNine",
                    caption: "سطح 9",
                    help: "",
                    placeHolder: "",
                    type: "checkbox",
                    selectEndpoint: {},
                    setFieldValue: form.setFieldValue,
                  }}
                >
                  سطح 9
                </CustomCheckbox>
              </Form.Item>
            )}
            {accessLevel >= 10 && (
              <Form.Item
                label=""
                name="IsTen"
                valuePropName="checked"
                // rules={[{ required: true, message: t("form.required") }]}
                className="!mb-0 !pb-0 text-xs"
              >
                <CustomCheckbox
                  config={{
                    name: "IsTen",
                    caption: "سطح 10",
                    help: "",
                    placeHolder: "",
                    type: "checkbox",
                    selectEndpoint: {},
                    setFieldValue: form.setFieldValue,
                  }}
                >
                  سطح 10
                </CustomCheckbox>
              </Form.Item>
            )}
            {accessLevel >= 11 && (
              <Form.Item
                label=""
                name="IsEleven"
                valuePropName="checked"
                // rules={[{ required: true, message: t("form.required") }]}
                className="!mb-0 !pb-0 text-xs"
              >
                <CustomCheckbox
                  config={{
                    name: "IsEleven",
                    caption: "سطح 11",
                    help: "",
                    placeHolder: "",
                    type: "checkbox",
                    selectEndpoint: {},
                    setFieldValue: form.setFieldValue,
                  }}
                >
                  سطح 11
                </CustomCheckbox>
              </Form.Item>
            )}
            {accessLevel >= 12 && (
              <Form.Item
                label=""
                name="IsTwelve"
                valuePropName="checked"
                // rules={[{ required: true, message: t("form.required") }]}
                className="!mb-0 !pb-0 text-xs"
              >
                <CustomCheckbox
                  config={{
                    name: "IsTwelve",
                    caption: "سطح 12",
                    help: "",
                    placeHolder: "",
                    type: "checkbox",
                    selectEndpoint: {},
                    setFieldValue: form.setFieldValue,
                  }}
                >
                  سطح 12
                </CustomCheckbox>
              </Form.Item>
            )}
            {accessLevel >= 13 && (
              <Form.Item
                label=""
                name="IsThirteen"
                valuePropName="checked"
                // rules={[{ required: true, message: t("form.required") }]}
                className="!mb-0 !pb-0 text-xs"
              >
                <CustomCheckbox
                  config={{
                    name: "IsThirteen",
                    caption: "سطح 13",
                    help: "",
                    placeHolder: "",
                    type: "checkbox",
                    selectEndpoint: {},
                    setFieldValue: form.setFieldValue,
                  }}
                >
                  سطح 13
                </CustomCheckbox>
              </Form.Item>
            )}
          </div>
        )}
        <Form.Item
          shouldUpdate
          name="accessLevelValidation"
          rules={[
            {
              validator: () => {
                const values = form.getFieldsValue(CHECKBOX_FIELDS);
                const isAnyChecked = Object.values(values).some(Boolean);

                if (!isAnyChecked) {
                  return Promise.reject(
                    new Error("حداقل یکی از سطوح باید انتخاب شود")
                  );
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <div />
        </Form.Item>
      </div>
    </Form>
  );
};
