import { useEffect, useState } from "react";

import { Collapse, CollapseProps, Divider } from "antd";

import { HeaderAction } from "./header";
import type { IProps } from "./type";
import { useTranslations } from "next-intl";
import { TrashBin } from "@components/atoms/iconComponents";
import ChequeActionForm from "./chequeActionForm";

export const ChequeActionModal = ({
  ids,
  children,
  handleReturn,
  selectedDetails,
  setSelectedDetails,
  setSelectedItems,
}: IProps) => {
  const [collapseItems, setCollapseItems] = useState([]);
  const headerUrl = "api/trh/select/check/receipt/operations";
  const headerRepoViewId = 140034;
  const t = useTranslations();

  const deleteHandler = (e, item) => {
    e.stopPropagation();
    const filterDataDetails = selectedDetails.filter(
      (p) => p.CheckReceiptDetailId !== item.CheckReceiptDetailId,
    );
    setSelectedDetails(filterDataDetails as any);
    setSelectedItems(filterDataDetails.map((p) => p.DocumentChequeId));
  };

  useEffect(() => {
    if (ids.length > 1) {
      const items: CollapseProps["items"] = selectedDetails?.map(
        (item, idx) => {
          return {
            key: `${idx}`,
            label: (
              <div className="flex items-center justify-between">
                <div className="flex gap-1 items-center">
                  <span className="text-xs">{t("general.sayyadNumber")} :</span>
                  <span>{item["DocumentCheque.IssuerSerial"]}</span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-xs">{t("general.dueDate")} :</span>
                  <span>{item["DocumentCheque.MaturityDate"]}</span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-xs">{t("general.amount")} :</span>
                  <span>{item["DocumentCheque.DocPrice"]}</span>
                </div>
                <div
                  onClick={(e) => {
                    deleteHandler(e, item);
                  }}
                >
                  <TrashBin config={{ stroke: "black" }} />
                </div>
              </div>
            ),
            children: (
              <HeaderAction
                id={item.CheckReceiptDetailId}
                isMulti
                getUrl={headerUrl}
                repoViewId={headerRepoViewId}
              />
            ),
          };
        },
      );
      setCollapseItems(items);
    }
  }, [selectedDetails]);

  return (
    <>
      <div className="flex flex-col gap-2 m-4 h-auto overflow-hidden">
        {ids.length === 1 && (
          <HeaderAction
            id={ids[0]}
            getUrl={headerUrl}
            repoViewId={headerRepoViewId}
            handleReturn={handleReturn}
          />
        )}
        {ids.length > 1 && (
          <div className="flex flex-col gap-4">
            <ChequeActionForm
              setSelectedDetails={setSelectedDetails}
              setSelectedItems={setSelectedItems}
              selectedDetails={selectedDetails}
            />
            <div className="h-48 overflow-y-auto">
              <Collapse items={collapseItems} defaultActiveKey={[""]} />
            </div>
          </div>
        )}
        <Divider className="m-2" />
        {children}
      </div>
    </>
  );
};
