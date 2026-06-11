"use client";
import { useAppSelector } from "@hooks/custom/useAppSelector";
import { Form, FormInstance } from "antd";
import { useEffect, useMemo, useState } from "react";
import { shallowEqual } from "react-redux";
import { useGetData } from "@services/base";
import { IRpWay } from "@services/trh/rpWay/type";
import { IRequest } from "@services/reportFile/type";
import { ICondition } from "@components/molecules/dynamicLevelFields/types";

export const useIssuanceForm = (form: FormInstance) => {
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find(
        (item) => item.isActive === true,
      ),
    }),
    shallowEqual,
  );
  const [condition, setCondition] = useState<ICondition>();
  const [accountId, setAccountId] = useState<number>(null);
  const rpWayId = Form.useWatch("RpWayId", form);
  const [natureOptions, setNatureOptions] = useState<any[]>([]);
  const [allVoucherTypes, setAllVoucherTypes] = useState<any[]>([]);
  const [filteredVoucherTypes, setFilteredVoucherTypes] = useState<any[]>([]);

  const VOUCHER_NATURE = {
    NORMAL_NON_COMMERCIAL: "عادی غیر تجاری",
    GUARANTEE: "تضمینی",
    NORMAL_COMMERCIAL: "عادی تجاری",
  } as const;

  const { data: rpWayData } = useGetData<IRpWay[], IRequest>({
    url: "api/trh/select/rpWay4voucher",
    body: {},
  });

  const voucherNatureId = Form.useWatch("VoucherNatureId", form);

  const selectedNature = useMemo(() => {
    return natureOptions?.find((o) => o?.value === voucherNatureId) ?? null;
  }, [natureOptions, voucherNatureId]);

  const selectedSelectValue =
    selectedNature?.option?._SelectValue ?? selectedNature?.label ?? "";

  const showGuaranteeCheckbox =
    selectedSelectValue === VOUCHER_NATURE.GUARANTEE;

  useEffect(() => {
    if (!selectedSelectValue || allVoucherTypes.length === 0) return;
    if (selectedSelectValue === VOUCHER_NATURE.NORMAL_NON_COMMERCIAL) {
      setFilteredVoucherTypes(
        allVoucherTypes.filter((item) =>
          [70003, 70002, 70001, 6037].includes(item?.option?._SelectId),
        ),
      );
    }
    if (
      selectedSelectValue === VOUCHER_NATURE.GUARANTEE ||
      selectedSelectValue === VOUCHER_NATURE.NORMAL_COMMERCIAL
    ) {
      setFilteredVoucherTypes(
        allVoucherTypes.filter((item) => item?.option?._SelectId === 70001),
      );
    }
    form.setFieldValue("VoucherTypeId", null);
  }, [selectedSelectValue, allVoucherTypes]);

  useEffect(() => {
    const rpWayDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "RpWayId",
    )?.originalValue;
    const rpWayValue = activePage?.pageData?.find(
      (item) => item.name === "RpWayId",
    )?.value;
    const tafsiliIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "TafsiliId",
    )?.originalValue;
    const fifthIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "FifthId",
    )?.originalValue;
    const sixthIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "SixthId",
    )?.originalValue;
    const seventhIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "SeventhId",
    )?.originalValue;
    const eightIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "EightId",
    )?.originalValue;
    const nineIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "NineId",
    )?.originalValue;
    const tenIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "TenId",
    )?.originalValue;
    const elevenIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "ElevenId",
    )?.originalValue;
    const twelveIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "TwelveId",
    )?.originalValue;
    const thirteenIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "ThirteenId",
    )?.originalValue;

    if (rpWayDefaultValue === rpWayValue) {
      form.setFieldValue("RpWayId", rpWayDefaultValue);
      setCondition({
        HasTafsili: !!tafsiliIdDefaultValue,
        HasFifth: !!fifthIdDefaultValue,
        HasSixth: !!sixthIdDefaultValue,
        HasSeventh: !!seventhIdDefaultValue,
        HasEight: !!eightIdDefaultValue,
        HasNine: !!nineIdDefaultValue,
        HasTen: !!tenIdDefaultValue,
        HasEleven: !!elevenIdDefaultValue,
        HasTwelve: !!twelveIdDefaultValue,
        HasThirteen: !!thirteenIdDefaultValue,
      });
    }
  }, [activePage]);

  useEffect(() => {
    if (rpWayId) {
      const accountId = rpWayData?.Data?.find(
        (item) => item._SelectId === rpWayId,
      )?.AccountId;
      if (accountId) {
        setAccountId(accountId);
      }
    } else {
      setAccountId(null);
      setCondition(null);
    }
  }, [rpWayId, rpWayData?.Data]);
  return {
    activePage,
    condition,
    natureOptions,
    setNatureOptions,
    showGuaranteeCheckbox,
    accountId,
    filteredVoucherTypes,
    setAllVoucherTypes,
  };
};
