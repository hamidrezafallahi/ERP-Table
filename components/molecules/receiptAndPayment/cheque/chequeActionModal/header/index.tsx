import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { InfoIcon, RowInfoIcon } from "@components/atoms/iconComponents";
import {
  isRegisteredConfig,
  stateConfig,
} from "@components/organisms/receiptAndPayment/config";
import { useProcessedData } from "@hooks/custom";
import { useAppSelector } from "@hooks/custom/useAppSelector";
import { useGetData } from "@services/base";
import type { IColumnConfig } from "@services/generalType/type";
import type {
  IReceivedCheque,
  IRequest,
} from "@services/trh/receivedCheque/type";

export const HeaderAction = ({
  id,
  getUrl,
  repoViewId,
  isMulti = false,
  handleReturn = null,
}) => {
  const t = useTranslations();

  const { locale } = useAppSelector((state) => {
    const locale = state.withPersist.config.lang;

    return { locale };
  }, shallowEqual);

  const { data: headerData } = useGetData<IReceivedCheque[], IRequest>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      Id: id,
    },
  });
  
  const columnsConfig: IColumnConfig[] = [
    {
      fieldName: "DocumentCheque.Num",
      fieldCaption: "شماره صیاد",
      fieldType: "string",
    },
    {
      fieldName: "CheckReceiptHeader.VoucherDate",
      fieldCaption: "تاریخ سند",
      fieldType: "date",
    },
    {
      fieldName: "DocumentCheque.MaturityDate",
      fieldCaption: "تاریخ سررسید",
      fieldType: "date",
    },
    {
      fieldName: "DocumentCheque.StateId",
      fieldCaption: "وضعیت چک",
      fieldType: "conditional",
      conditionalConfig: stateConfig,
    },
    {
      fieldName: "CheckReceiptHeader.RpWay.RPWayDesc",
      fieldCaption: "نحوه دریافت و پرداخت",
      fieldType: "string",
    },
    {
      fieldName: "DocumentCheque.IsRegistered",
      fieldCaption: "ثبت چک صیادی",
      fieldType: "conditional",
      conditionalConfig: isRegisteredConfig,
    },
    {
      fieldName: "DocumentCheque.DocPrice",
      fieldCaption: "مبلغ",
      fieldType: "price",
    },
  ];
  const data = headerData?.Data;
  const processedData = useProcessedData({
    data,
    columnsConfig,
    locale,
  });

  const finalData = processedData[0];
  

  return (
    <div className="flex flex-col gap-2">
      {!isMulti && (
        <div className="flex items-center gap-2">
          <RowInfoIcon />
          <span className="text-xs">{t("general.rowInfo")}</span>
        </div>
      )}
      <div
        className={`${
          !isMulti && "border border-1"
        } flex flex-wrap gap-8 p-4 rounded justify-between`}
      >
        <div className="flex gap-2">
          <span className="text-xs">{t("general.sayyadNumber")} :</span>
          <span className="text-xs">
            {finalData?.["DocumentCheque.IssuerSerial"] ?? "---"}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs">{t("general.voucherDate")} :</span>
          <span className="text-xs">
            {finalData?.["CheckReceiptHeader.VoucherDate"] ?? "---"}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs">{t("general.dueDate")} :</span>
          <span className="text-xs">
            {finalData?.["DocumentCheque.MaturityDate"] ?? "---"}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs">{t("general.chequeStatus")} :</span>
          <span className="text-xs">
            {finalData?.["DocumentCheque.StateId"] ?? "---"}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs">{t("general.rPWay")} :</span>
          <span className="text-xs">
            {finalData?.["CheckReceiptHeader.RpWay.RPWayDesc"] ?? "---"}
          </span>
        </div>
        {finalData?.["CheckReceiptHeader.Tafsili.TafsiliDesc"] && (
          <div className="flex gap-2">
            <span className="text-xs">{t("general.level4")} :</span>

            <span className="text-xs">
              {finalData?.["CheckReceiptHeader.Tafsili.TafsiliDesc"] ?? "---"}
            </span>
          </div>
        )}

        {finalData?.["CheckReceiptHeader.Fifth.FifthDesc"] && (
          <div className="flex gap-2">
            <span className="text-xs">{t("general.level5")} :</span>
            <span className="text-xs">
              {finalData?.["CheckReceiptHeader.Fifth.FifthDesc"] ?? "---"}
            </span>
          </div>
        )}
        {finalData?.["CheckReceiptHeader.Sixth.SixthDesc"] && (
          <div className="flex gap-2">
            <span className="text-xs">{t("general.level6")} :</span>
            {finalData?.["CheckReceiptHeader.Sixth.SixthDesc"]}
            <span className="text-xs">
              {finalData?.["CheckReceiptHeader.Sixth.SixthDesc"] ?? "---"}
            </span>
          </div>
        )}
        {finalData?.["CheckReceiptHeader.Seventh.SeventhDesc"] && (
          <div className="flex gap-2">
            <span className="text-xs">{t("general.level7")} :</span>
            <span className="text-xs">
              {finalData?.["CheckReceiptHeader.Seventh.SeventhDesc"] ?? "---"}
            </span>
          </div>
        )}
        {finalData?.["CheckReceiptHeader.Eight.EightDesc"] && (
          <div className="flex gap-2">
            <span className="text-xs">{t("general.level8")} :</span>
            <span className="text-xs">
              {finalData?.["CheckReceiptHeader.Eight.EightDesc"] ?? "---"}
            </span>
          </div>
        )}
        {finalData?.["CheckReceiptHeader.Nine.NineDesc"] && (
          <div className="flex gap-2">
            <span className="text-xs">{t("general.level9")} :</span>
            <span className="text-xs">
              {finalData?.["CheckReceiptHeader.Nine.NineDesc"] ?? "---"}
            </span>
          </div>
        )}
        {finalData?.["CheckReceiptHeader.Ten.TenDesc"] && (
          <div className="flex gap-2">
            <span className="text-xs">{t("general.level10")} :</span>
            <span className="text-xs">
              {finalData?.["CheckReceiptHeader.Ten.TenDesc"] ?? "---"}
            </span>
          </div>
        )}
        {finalData?.["CheckReceiptHeader.Eleven.ElevenDesc"] && (
          <div className="flex gap-2">
            <span className="text-xs">{t("general.level11")} :</span>
            <span className="text-xs">
              {finalData?.["CheckReceiptHeader.Eleven.ElevenDesc"] ?? "---"}
            </span>
          </div>
        )}
        {finalData?.["CheckReceiptHeader.Twelve.TwelveDesc"] && (
          <div className="flex gap-2">
            <span className="text-xs">{t("general.level12")} :</span>
            <span className="text-xs">
              {finalData?.["CheckReceiptHeader.Twelve.TwelveDesc"] ?? "---"}
            </span>
          </div>
        )}
        {finalData?.["CheckReceiptHeader.Thirteen.ThirteenDesc"] && (
          <div className="flex gap-2">
            <span className="text-xs">{t("general.level13")} :</span>
            <span className="text-xs">
              {finalData?.["CheckReceiptHeader.Thirteen.ThirteenDesc"] ?? "---"}
            </span>
          </div>
        )}
        <div className="flex gap-2">
          <span className="text-xs">{t("general.inSayyadSystem")} :</span>
          <span className="text-xs">
            {finalData?.["DocumentCheque.IsRegistered"] ? "✔" : "✘"}
          </span>
        </div>
        {handleReturn && (
          <div
            className="flex flex-1 justify-end items-center"
            onClick={handleReturn}
          >
            <span className="cursor-pointer">
              <InfoIcon config={{ stroke: "#595959", width: 20, height: 20 }} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
