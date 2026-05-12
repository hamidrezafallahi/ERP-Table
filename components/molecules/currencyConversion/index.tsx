import { CustomButton } from "@components/atoms/defaultElements";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation } from "@services/base";
import { showSuccessToast } from "@utils/core";
import { Spin } from "antd";
import { useTranslations } from "next-intl";

interface CurrencyConversionProps {
  id?: number;
  sourceKey?: string | number | symbol;
  rowId: number;
  closeModal?: () => void;
  mode?: "insert" | "delete";
  handleClose?: () => void;
  voucherNumber?: number;
}

export default function CurrencyConversion(props: CurrencyConversionProps) {
  const {
    rowId,
    closeModal,
    mode = "insert",
    voucherNumber,
    handleClose,
  } = props;
  const t = useTranslations();
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

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
      if (mode === "delete") {
        handleClose();
      }
      closeModal();
    }
  };

  return (
    <div className="flex flex-col p-4 gap-5">
      <span className="font-medium mb-3 text-gray-gray10 text-base">
        {mode === "insert"
          ? t("general.currencyConversionDesc")
          : t("deleteAccountingDocumentDesc", {
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
