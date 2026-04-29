import { CSSProperties, forwardRef, ReactNode, RefAttributes } from "react";

import { Collapse } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { DownChevron, NoData } from "@components/atoms/iconComponents";
import { useDarkMode, useProcessedData } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import type { IAccountSetting } from "@services/acc/accountSetting/type";
import { getColoredIcon } from "@utils/core";

import type { IProps } from "./type";

export const AccountSettingCard = forwardRef(function Card(
  {
    staticData,
    data,
    actions,
    columnsConfig,
    onActionClick,
    rowIdField,
  }: IProps,
  ref: RefAttributes<HTMLDivElement>["ref"],
) {
  const { mode = "light" } = useDarkMode();
  const t = useTranslations();
  const { lang: locale } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
    }),
    shallowEqual,
  );

  const processedData = useProcessedData({ data, columnsConfig, locale });
  const Header = (item: any, index: number) => {
    const displayData: ReactNode = item[staticData] as ReactNode;
    return (
      <div
        className="flex justify-between items-center"
        ref={index === processedData.length - 1 ? ref : null}
      >
        <div className="flex items-center gap-2 w-full">
          <p className="w-full text-gray-gray10 dark:text-white text-sm">
            {displayData}
          </p>
        </div>
      </div>
    );
  };

  const Details = (item: IAccountSetting) => (
    <>
      {columnsConfig?.map((el) => (
        <div
          key={el.fieldName}
          className="items-center gap-2 grid grid-cols-2 mx-6"
        >
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-gray-gray10">{el.fieldCaption}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-gray-gray7">{item[el.fieldName]}</p>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 ms-6 mt-3">
        {actions &&
          actions.map((action) => (
            <span
              key={action.MenuDesc}
              className="cursor-pointer"
              aria-label={action.MenuDesc}
              onClick={() => {
                onActionClick(
                  action,
                  item[rowIdField],
                  item["PendingStatusId"],
                );
              }}
            >
              {typeof action.Icon === "string" && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: getColoredIcon(action.Icon, mode),
                  }}
                  style={{ width: "18px", height: "17px" }}
                />
              )}
            </span>
          ))}
      </div>
    </>
  );

  const panelStyle: CSSProperties = {
    marginBottom: "0.6rem",
    padding: 0,
    paddingBottom: "8px",
    background: "#FBFBFB",
    borderRadius: "16px",
    border: "2px solid",
    borderColor: "#ECECEC",
  };

  const items = processedData?.map((item: IAccountSetting, index: number) => ({
    key: index.toString(),
    label: Header(item, index),
    children: Details(item),
    style: panelStyle,
  }));

  return (
    <div className="hidden-show-scrollBar pt-3 w-full h-[calc(100dvh-220px)] overflow-y-scroll">
      {processedData?.length > 0 ? (
        <>
          <Collapse
            expandIcon={({ isActive }) => (
              <div className={isActive ? "rotate-180" : ""}>
                <DownChevron />
              </div>
            )}
            expandIconPosition="end"
            style={{
              backgroundColor: "white",
              padding: 0,
              margin: 0,
            }}
            items={items}
            bordered={false}
          />
        </>
      ) : (
        <div className="flex flex-col justify-center items-center gap-2 m-2">
          <NoData config={{ width: 60, height: 60 }} />
          <span className="text-gray-gray9 text-sm">{t("general.noData")}</span>
        </div>
      )}
    </div>
  );
});
