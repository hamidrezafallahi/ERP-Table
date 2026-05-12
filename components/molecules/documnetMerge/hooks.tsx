import { useGetData } from "@services/base";
import { IVoucher } from "./type";
import { IRequest } from "@services/reportFile/type";
import { useCallback, useMemo, useState } from "react";
import { eMergeType } from "./enum";
import { FormInstance } from "antd";

interface UseDocumentMergeProps {
  refIds: number[];
  form: FormInstance<any>;
}

export function useDocumentMerge(props: UseDocumentMergeProps) {
  const { refIds, form } = props;
  const [selectedRadio, setSelectedRadio] = useState<number | null>(null);

  const { data: voucherList } = useGetData<IVoucher[], IRequest>({
    url: "/api/acc/select/voucher",
    body: {
      RepoViewId: 10011,
      ShowBookmarked: true,
      ShowTags: true,
    },
    skip: false,
  });

  const selected = useMemo(() => {
    return (
      voucherList?.Data?.filter((item) =>
        refIds.includes(item.VoucherHeaderId),
      ) ?? []
    );
  }, [voucherList?.Data, refIds]);

  const allSameVoucherTypeId = useMemo(() => {
    if (!selected.length) return false;
    const firstType = selected[0].VoucherTypeId;
    return selected.every((item) => item.VoucherTypeId === firstType);
  }, [selected]);

  const voucherTypeDesc = useMemo(() => {
    return allSameVoucherTypeId
      ? (selected[0]?.VoucherType?.VoucherTypeDesc ?? null)
      : null;
  }, [allSameVoucherTypeId, selected]);

  const allSameVoucherDate = useMemo(() => {
    if (!selected.length) return false;
    const firstDate = selected[0].VoucherDate;
    return selected.every((item) => item.VoucherDate === firstDate);
  }, [selected]);

  
  const defaultVoucherDate = useMemo(() => {
    return allSameVoucherDate ? (selected[0]?.VoucherDate ?? null) : null;
  }, [allSameVoucherDate, selected]);


  const vouchersCount = useMemo(() => refIds.length, [refIds]);


  const radioOptions = useMemo(
    () => [
      {
        value: 1,
        name: eMergeType.mergeHeader,
        label: "ادغام سربرگ",
        disabled: !allSameVoucherTypeId,
      },
      {
        value: 2,
        name: eMergeType.mergeDetail,
        label: "ادغام ردیف",
        disabled: false,
      },
      {
        value: 3,
        name: eMergeType.mergeHeaderDetail,
        label: "ادغام سربرگ و ردیف",
        disabled: !allSameVoucherTypeId,
      },
    ],
    [allSameVoucherTypeId],
  );

  const handleRadioClick = useCallback(
    (value: number) => {
      setSelectedRadio((prev) => {
        const newValue = prev === value ? null : value;
        form.setFieldValue("MergeType", newValue);
        return newValue;
      });
    },
    [form],
  );

  return {
    selectedRadio,
    selected,
    voucherTypeDesc,
    vouchersCount,
    defaultVoucherDate,
    allSameVoucherDate,
    radioOptions,
    handleRadioClick,
  };
}
