import { Form } from "antd";
import { useTranslations } from "next-intl";

import { DynamicSelect } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";

export const PriceForm = ({ form, match }) => {
  const t = useTranslations();

  return (
    <Form
      form={form}
      name="priceForm"
      layout="vertical"
      className={`${
        !match
          ? "flex flex-col gap-2"
          : `gap-2 lg:grid lg:grid-cols-4 flex flex-col`
      } hidden-show-scrollBar`}
    >
      <Form.Item
        label={t("general.priceListTitle")}
        name="PriceListHeaderDesc"
        className="col-span-2 !mb-0 !pb-0 text-xs"
        rules={[{ required: true, message: t("form.required") }]}
      >
        <InputText
          config={{
            caption: t("general.priceListTitle"),
            name: "PriceListHeaderDesc",
            type: "string",
            form: form,
            setFieldValue: form.setFieldValue,
          }}
          type="string"
          name="PriceListHeaderDesc"
        />
      </Form.Item>

      <Form.Item
        label={t("general.currencyType")}
        name="CurrencyId"
        className="col-span-1 !mb-0 !pb-0 text-xs"
        rules={[{ required: true, message: t("form.required") }]}
      >
        <DynamicSelect
          config={{
            caption: t("general.currencyType"),
            name: "CurrencyId",
            type: "selectOption",
            selectEndpoint: {
              addWebUrl: "api/com/select/availableCurrencies4SelectOption",
              endpoint: "api/com/select/availableCurrencies4SelectOption",
              repoViewId: null,
            },
            setFieldValue: form.setFieldValue,
            form: form,
          }}
          dynamicValue={{
            addWebUrl: "api/com/select/availableCurrencies4SelectOption",
            endpoint: "api/com/select/availableCurrencies4SelectOption",
            repoViewId: null,
            // addButton: {
            //   url: "com/currency",
            //   RepoId: 106016,
            //   SystemId: SystemEnum.com,
            // },
          }}
        />
      </Form.Item>
    </Form>
  );
};
