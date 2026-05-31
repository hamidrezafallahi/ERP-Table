import { Spin } from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import { SpinIcon } from '@components/atoms/iconComponents';
import { useCUDDataMutation } from '@services/base';
import { showSuccessToast } from '@utils/toast';

interface CurrencyConversionProps {
  id?: number;
  sourceKey?: string | number | symbol;
  rowId: number;
  closeModal?: () => void;
  mode?: "insert" | "delete";
  voucherNumber?: string;
}

export default function CurrencyConversion(props: CurrencyConversionProps) {
  const { rowId, closeModal, mode = "insert", voucherNumber } = props;
  const t = useTranslations();
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  console.log({ voucherNumber });

  const handleSubmit = async () => {
    if (!rowId) return;
    const url =
      mode === "insert"
        ? "/api/acc/insert/voucher/costConversion"
        : "/api/acc/delete/voucher/byCostConversion";
    const res = await mutateItem({
      url: url,
      body: {
        CostConversionId: rowId,
      },
    }).unwrap();

    if (res?.Result == "Success") {
      showSuccessToast(t("toast.successTitle"));
      closeModal();
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      <span className="mb-3 font-medium text-gray-gray10 text-base">
        {mode === "insert"
          ? t("general.currencyConversionDesc")
          : t("general.deleteAccountingDocumentDesc", {
              voucherNumber: voucherNumber ?? "",
            })}
      </span>
      <div className="flex justify-end w-full">
        <CustomButton
          type="text"
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          onClick={handleSubmit}
        >
          {mutateIsLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : mode === "insert" ? (
            t("general.issuingAnAccountingEntry")
          ) : (
            t("general.deleteAccountingDocument")
          )}
        </CustomButton>
      </div>
    </div>
  );
}
