import { Checkbox, Form, Spin } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { CustomButton, DynamicSelect } from "@components/atoms/defaultElements";
import {
  CheckOutlinedIcon,
  ClosePageIcon,
  SpinIcon,
} from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation } from "@services/base";
import { showSuccessToast } from "@utils/core";

export const EndYearOperationsForm = ({ setMobileDrawerContent }) => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const { locale } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
    }),
    shallowEqual,
  );
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const isOpening = Form.useWatch(["IsOpening"], form);

  const handleSubmit = async (values) => {
    try {
      const mutateResult = await mutateItem({
        url: "/api/com/update/goods/goodsSettings",
        body: {
          ...values,

          RepoViewId: 30093,
        },
      }).unwrap();

      if (mutateResult?.Result === "Pending") {
        showSuccessToast(t("toast.successTitle"));
      }
    } catch (error) {
      null;
    }
  };

  const steps = isOpening
    ? [
        {
          label: "بررسی",
          value: "1",
        },
        {
          label: "صحت",
          value: "2",
        },
        {
          label: "بستن حساب های هزینه",
          value: "3",
        },
        {
          label: "بستن حساب های درآمد",
          value: "4",
        },
        {
          label: "بستن حساب های سود",
          value: "5",
        },
        {
          label: "سند اختتامیه",
          value: "6",
        },
        {
          label: "سند افتتاحیه",
          value: "7",
        },
      ]
    : [
        {
          label: "بررسی",
          value: "1",
        },
        {
          label: "صحت",
          value: "2",
        },
        {
          label: "بستن حساب های هزینه",
          value: "3",
        },
        {
          label: "بستن حساب های درآمد",
          value: "4",
        },
        {
          label: "بستن حساب های سود",
          value: "5",
        },
        {
          label: "سند اختتامیه",
          value: "6",
        },
      ];

  const renderErrorStep = () => {
    return (
      <div className="p-3 border-2 border-red-600 rounded-full">
        <ClosePageIcon config={{ stroke: "#dc2626" }} />
      </div>
    );
  };
  const renderSuccessStep = () => {
    return (
      <div className="p-3 border-2 border-green-600 rounded-full">
        <CheckOutlinedIcon
          config={{ stroke: "#16a34a", width: 24, height: 24 }}
        />
      </div>
    );
  };
  const renderWaitStep = () => {
    return (
      <div className="bg-gray-gray3 p-3 border-2 border-gray-gray6 rounded-full">
        <div className="w-6 h-6"></div>
      </div>
    );
  };
  const renderDivider = () => {
    return (
      <div className="flex justify-center items-center text-gray-gray7">
        <div className="h-6">{`- - - - >`}</div>
      </div>
    );
  };

  const correctStep = 1;

  const renderCorrectStep = (correctStep) => {
    switch (correctStep) {
      case "error":
        return renderErrorStep();

      case "success":
        return renderSuccessStep();

      default:
        return renderWaitStep();
    }
  };

  const renderStepper = () => {
    return (
      <div className="flex gap-1">
        {steps.map((step, idx) => {
          const lastItem = isOpening ? idx === 6 : idx === 5;
          return (
            <div key={step.value} className="flex flex-col gap-2">
              <div className="flex justify-center items-center gap-2">
                {renderCorrectStep(correctStep)}
                {!lastItem && renderDivider()}
              </div>

              <span className="ps-2 text-gray-800 text-xs">{step.label}</span>
            </div>
          );
        })}
      </div>
    );
  };
  const renderErrors = () => {
    return (
      <div className="flex gap-2 text-red-600">
        <span>◂ خطا :</span>
        <span>error desc</span>
      </div>
    );
  };

  return (
    <Form
      form={form}
      name="endYearOperations"
      layout="vertical"
      className="gap-2 grid grid-cols-2"
    >
      <div className="gap-2 grid grid-cols-2 col-span-2">
        <Form.Item
          name="IsOpening"
          valuePropName="checked"
          className="m-0 p-0 text-xs"
        >
          <Checkbox>زدن افتتاحیه</Checkbox>
        </Form.Item>

        {isOpening && (
          <Form.Item
            label="سال مالی"
            name="Year"
            rules={[
              { required: true, message: t("form.required"), type: "number" },
            ]}
          >
            <DynamicSelect
              config={{
                name: "Year",
                caption: "سال مالی",
                type: "selectOption",
                setFieldValue: form.setFieldValue,
              }}
              dynamicValue={{
                endpoint: "/api/acc/select/commonInfo/year",
                repoViewId: null,
              }}
            />
          </Form.Item>
        )}
      </div>
      <Form.Item
        label="بستن هزینه"
        name=""
        rules={[
          { required: true, message: t("form.required"), type: "number" },
        ]}
      >
        <DynamicSelect
          config={{
            name: "",
            caption: "بستن هزینه",
            type: "selectOption",
            setFieldValue: form.setFieldValue,
          }}
          dynamicValue={{
            endpoint: "/api/acc/select/commonInfo/year",
            repoViewId: null,
          }}
        />
      </Form.Item>
      <Form.Item
        label="بستن درآمد"
        name=""
        rules={[
          { required: true, message: t("form.required"), type: "number" },
        ]}
      >
        <DynamicSelect
          config={{
            name: "",
            caption: "بستن درآمد",
            type: "selectOption",
            setFieldValue: form.setFieldValue,
          }}
          dynamicValue={{
            endpoint: "/api/acc/select/commonInfo/year",
            repoViewId: null,
          }}
        />
      </Form.Item>
      <Form.Item
        label="سود و زیان"
        name=""
        rules={[
          { required: true, message: t("form.required"), type: "number" },
        ]}
      >
        <DynamicSelect
          config={{
            name: "",
            caption: "سود و زیان",
            type: "selectOption",
            setFieldValue: form.setFieldValue,
          }}
          dynamicValue={{
            endpoint: "/api/acc/select/commonInfo/year",
            repoViewId: null,
          }}
        />
      </Form.Item>
      <Form.Item
        label="حساب های انباشته"
        name=""
        rules={[
          { required: true, message: t("form.required"), type: "number" },
        ]}
      >
        <DynamicSelect
          config={{
            name: "",
            caption: "حساب های انباشته",
            type: "selectOption",
            setFieldValue: form.setFieldValue,
          }}
          dynamicValue={{
            endpoint: "/api/acc/select/commonInfo/year",
            repoViewId: null,
          }}
        />
      </Form.Item>

      <div className="flex flex-col justify-center items-center gap-4 col-span-2 py-8">
        {renderStepper()}
      </div>
      <div className="flex flex-col justify-center items-center gap-2 col-span-2">
        {renderErrors()}
      </div>
      <div className="flex flex-col justify-center items-center gap-4 col-span-2">
        <CustomButton
          type="text"
          onClick={handleSubmit}
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
        >
          {mutateIsLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : (
            t("general.operationStart")
          )}
        </CustomButton>
        {mutateIsLoading && (
          <span className="text-blue-blue4 text-sm">
            لطفا تا پایان عملیات از بستن صفحه خودداری بفرمایید .
          </span>
        )}
      </div>
    </Form>
  );
};
