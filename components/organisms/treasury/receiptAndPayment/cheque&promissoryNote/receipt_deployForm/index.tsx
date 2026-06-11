import { Form } from "antd";
import { useReceiptChequeForm } from "./hooks/useReceiptChequeForm";
import BasicFields from "./basicFields";
import { Level4TypeEnum } from "@components/molecules/dynamicLevelFields/enum";
import DynamicLevelFields from "@components/molecules/dynamicLevelFields";
import { useVoucherRequestConfigs } from "./hooks/useVoucherRequestConfigs";
import { FormInstance } from "antd/lib";

interface Receipt_DeployFormProps {
  onSubmitCallback: (values: unknown) => void;
  form: FormInstance;
  type: number;
}

export const Receipt_DeployForm = (props: Receipt_DeployFormProps) => {
  const { form, onSubmitCallback, type } = props;

  const { setNatureOptions, showGuaranteeCheckbox, accountId } =
    useReceiptChequeForm(form);

  const configs = useVoucherRequestConfigs();

  console.log(form.getFieldsValue(),"reyhan");

  return (
    <Form
      form={form}
      onFinish={onSubmitCallback}
      name="receipt_deployForm"
      layout="vertical"
      className={`flex flex-col gap-2 lg:grid lg:grid-cols-12 lg:gap-3 items-start max-h-[calc(100dvh-160px)] h-auto overflow-y-auto hidden-show-scrollBar`}
    >
      <BasicFields
        form={form}
        cashConfig={configs.cashConfig}
        rpWayConfig={configs.rpWayConfig}
        natureConfig={configs.natureConfig}
        showGuaranteeCheckbox={showGuaranteeCheckbox}
        setNatureOptions={setNatureOptions}
        type={type}
      />
      <DynamicLevelFields
        accountId={accountId}
        form={form}
        level4Type={Level4TypeEnum.Person}
        className="col-span-2"
      />
    </Form>
  );
};
