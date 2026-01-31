import { useTranslations } from "next-intl";

import { RowInfoIcon } from "@components/atoms/iconComponents";
import {
  isRegisteredConfig,
  stateConfig,
} from "@components/organisms/receiptAndPayment/config";
import { useProcessedData } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { useGetData } from "@services/base";
import type { IColumnConfig } from "@services/generalType/type";
import type {
  IReceivedCheque,
  IRequest,
} from "@services/trh/receivedCheque/type";

export const HeaderAction = ({ id, getUrl, repoViewId, isMulti = false }) => {
  const t = useTranslations();
  const locale = useAppSelector((state) => state.withPersist.config.lang);
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
        } flex flex-wrap gap-8 p-4 rounded`}
      >
        {/* <div className="flex gap-2">
          <span className="text-xs">{t("general.chequeNumber")} :</span>
          <span className="text-xs">{processedData?.CheckNumber ?? "---"}</span>
        </div> */}
        <div className="flex gap-2">
          <span className="text-xs">{t("general.sayyadNumber")} :</span>
          <span className="text-xs">
            {finalData?.["DocumentCheque.Num"] ?? "---"}
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
      </div>
    </div>
  );
};
