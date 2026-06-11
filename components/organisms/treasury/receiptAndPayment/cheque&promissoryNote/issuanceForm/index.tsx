import { Form } from 'antd';

import DynamicLevelFields from '@components/molecules/dynamicLevelFields';

import BasicFields from './basicFields';
import { useIssuanceForm } from './hooks/useIssuanceForm';
import { useVoucherRequestConfigs } from './hooks/useVoucherRequestConfigs';
import type { IProps } from './type';

export const Cheque_PromissoryNoteIssuanceForm = ({
  form,
  onSubmitCallback,
}: IProps) => {
  const {
    setNatureOptions,
    showGuaranteeCheckbox,
    accountId,
    filteredVoucherTypes,
    setAllVoucherTypes,
  } = useIssuanceForm(form);
  const configs = useVoucherRequestConfigs();
  const VoucherTypeId = Form.useWatch("VoucherTypeId", form);
  return (
    <Form
      form={form}
      onFinish={onSubmitCallback}
      name="issuanceForm"
      layout="vertical"
      className={`flex flex-col gap-2 lg:grid lg:grid-cols-12 lg:gap-3 items-start max-h-[calc(100dvh-160px)] h-auto overflow-y-auto hidden-show-scrollBar`}
    >
      <BasicFields
        form={form}
        rpWayConfig={configs.rpWayConfig}
        natureConfig={configs.natureConfig}
        documnetTypeConfig={configs.documnetTypeConfig}
        issuanceBankConfig={configs.issuanceBankConfig}
        showGuaranteeCheckbox={showGuaranteeCheckbox}
        setNatureOptions={setNatureOptions}
        filteredVoucherTypes={filteredVoucherTypes}
        setAllVoucherTypes={setAllVoucherTypes}
      />      
      <DynamicLevelFields
        accountId={accountId}
        form={form}
        className="col-span-3"
        VoucherTypeId={VoucherTypeId}
      />
    </Form>
  );
};
