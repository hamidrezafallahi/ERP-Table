import { CSSProperties, forwardRef, ReactNode, RefAttributes } from "react";

import { Collapse } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { DownChevron, NoData } from "@components/atoms/iconComponents";
import { useDarkMode, useProcessedData } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { getColoredIcon } from "@utils/core";

import type { IProps } from "./type";
import { CustomSwitch } from "@components/atoms/defaultElements";

export const CardDynamicModal = forwardRef(function Card<T>(
  {
    staticKey,
    data,
    actions,
    columnsList,
    onActionClick,
    fieldKey,
    activation,
  }: IProps<T>,
  ref: RefAttributes<HTMLDivElement>["ref"]
) {
  const { mode = "light" } = useDarkMode();

  const t = useTranslations();
  const { lang: locale } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
    }),
    shallowEqual
  );

  const columnsConfig = columnsList && columnsList?.column;
  const processedData = useProcessedData({ data, columnsConfig, locale });
  const Header = (item: any, index: number) => {
    const displayData: ReactNode = item[staticKey] as ReactNode;
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

  const Details = (item: any) => (
    <>
      <div className="flex flex-col gap-2 mt-2">
        {columnsConfig?.map((el, idx) => (
          <div
            key={idx}
            className="flex flex-nowrap gap-2 mx-6 whitespace-nowrap"
          >
            <span className="text-gray-gray8 dark:text-white text-xs">
              {el.fieldCaption} :
            </span>
            <span className="font-bold text-gray-gray10 dark:text-white text-xs">
              {item[el.fieldName]}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-5 ms-6 mt-6 pb-4">
        {actions &&
          actions.map((action) => (
            <span
              key={action.MenuDesc}
              className="cursor-pointer"
              aria-label={action.MenuDesc}
              onClick={() => {
                onActionClick(action, item[fieldKey], item["PendingStatusId"]);
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: getColoredIcon(action.Icon, mode),
                }}
                style={{ width: "16px", height: "17px" }}
              />
            </span>
          ))}
        {activation?.url && (
          <CustomSwitch
            config={{
              fieldKey: fieldKey,
              url: activation.url,
              id: item[fieldKey],
              body: activation.body,
            }}
            defaultChecked={item.Inactive ? false : true}
          />
        )}
      </div>
    </>
  );

  const panelStyle: CSSProperties = {
    marginBottom: "0.6rem",
    padding: 0,
    background: "#FBFBFB",
    borderRadius: "4px",
    border: "2px solid",
    borderColor: "#ECECEC",
  };

  const items = processedData?.map((item: T, index: number) => ({
    key: index.toString(),
    label: Header(item, index),
    children: Details(item),
    style: panelStyle,
  }));

  return (
    <div className="hidden-show-scrollBar pt-1 w-full h-[calc(100dvh-300px)] overflow-y-auto">
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
