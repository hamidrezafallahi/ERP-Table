import {
  CSSProperties,
  forwardRef,
  ReactNode,
  RefAttributes,
  useEffect,
  useState,
} from "react";

import { Checkbox, Collapse } from "antd";
import { useTranslations } from "next-intl";

import {
  Close,
  DownChevron,
  Info,
  LeftChevron,
  LeftChevronDouble,
  NoData,
  RightChevron,
  RightChevronDouble,
  Undo,
} from "@components/atoms/iconComponents";
import { ActionLabelsEnum } from "@components/organisms/receiptAndPayment/cheque/action/enum";
import { useDarkMode, useProcessedData } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { getColoredIcon } from "@utils/core";

import { CustomSpin } from "@components/atoms/defaultElements";
import type { IProps } from "./type";

const ActionCard = forwardRef(function Card(
  {
    staticKey,
    data,
    actions,
    columnsConfig,
    onActionClick,
    rowFieldKey,
    headerKey,
    selectedItems,
    setSelectedItems,
    selectedHeaderId,
    setSelectedHeaderId,
    isSelectMode,
    setIsSelectMode,
    loading,
    pageNumber,
    mobilePerPageCount,
    returnCount,
    totalCount,
    handlePaginationChange,
  }: IProps,
  ref: RefAttributes<HTMLDivElement>["ref"],
) {
  const t = useTranslations();
  const { lang: locale, direction } = useAppSelector((state) => ({
    lang: state.withPersist.config.lang,
    direction: state.withPersist.config.direction,
  }));

  const processedData = useProcessedData({ data, columnsConfig, locale });
  const { mode = "light" } = useDarkMode();
  const [selectAll, setSelectAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  const handleSelectRow = (item: number, headerId: number) => {
    if (selectedItems?.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
    if (selectedHeaderId.includes(headerId)) {
      setSelectedHeaderId(selectedHeaderId.filter((i) => i !== headerId));
    } else {
      setSelectedHeaderId([...selectedHeaderId, headerId]);
    }
  };
  const handleCloseSelectMode = () => {
    setIsSelectMode(false);
    setSelectedItems([]);
    setSelectedHeaderId([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(processedData.map((item) => item[rowFieldKey]));
      setSelectedHeaderId(processedData.map((item) => item[headerKey]));
    } else {
      setSelectedItems([]);
      setSelectedHeaderId([]);
    }
  };

  useEffect(() => {
    if (
      processedData?.length > 0 &&
      selectedItems?.length === processedData?.length
    ) {
      setSelectAll(true);
      setIndeterminate(false);
    } else if (selectedItems?.length > 0) {
      setSelectAll(false);
      setIndeterminate(true);
    } else {
      setSelectAll(false);
      setIndeterminate(false);
    }
  }, [selectedItems]);

  const Header = (item: any, index: number) => {
    let timer: NodeJS.Timeout;
    const handleMouseDown = (e) => {
      timer = setTimeout(() => {
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        setIsSelectMode(true);
        handleSelectRow(item[rowFieldKey], item[headerKey]);
        e.preventDefault();
      }, 700);
    };

    const handleMouseUp = () => {
      clearTimeout(timer);
    };
    const displayStaticData: ReactNode = item[staticKey] as ReactNode;

    return (
      <div
        className="flex items-center gap-2"
        // ref={index === processedData.length - 1 ? ref : null}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onContextMenu={(e) => e.preventDefault()}
        onTouchEnd={handleMouseUp}
        onClick={(e) => {
          if (isSelectMode) {
            e.preventDefault();
            e.stopPropagation();
            handleSelectRow(item[rowFieldKey], item[headerKey]);
          }
        }}
      >
        <div className="flex items-center gap-1">
          {isSelectMode && (
            <Checkbox
              checked={selectedItems?.includes(item[rowFieldKey])}
              onClick={(event) => event.stopPropagation()}
              onChange={() =>
                handleSelectRow(item[rowFieldKey], item[headerKey])
              }
            />
          )}
          <p
            className={` hidden-show-scrollBar w-[calc(100dvw-130px)] overflow-auto text-gray-gray10 text-sm whitespace-nowrap select-none`}
          >
            {displayStaticData}
          </p>
        </div>

        <div
          className="flex justify-end gap-1 p-[2px]"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        ></div>
      </div>
    );
  };

  const Details = (item) => {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {columnsConfig?.map((el, idx) => {
          const isFirstColumn = idx === 0;
          if (isFirstColumn) {
            const action = {
              MenuId: null,
              Icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"fill="none"><path d="M10 9.16667V13.3333M10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5ZM10.0415 6.66667V6.75L9.9585 6.75016V6.66667H10.0415Z"className="stroke-gray-gray10 dark:stroke-gray-gray1"stroke="stroke-gray-gray10  dark:stroke-gray-gray1"strokeLinecap="round"strokeLinejoin="round"/></svg>`,
              ActionId: null,
              MenuDesc: ActionLabelsEnum.ChequeCirculation,
              key: ActionLabelsEnum.ChequeCirculation,
              FatherId: null,
              MenuType: null,
              loggedInUserId: null,
              condition: "",
            };
            return (
              <div key={el.fieldName} className="flex items-center gap-6 mx-6">
                <div className="flex flex-col gap-2">
                  <p className="text-gray-gray10 text-xs">{el.fieldCaption}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xs">{item[el.fieldName]}</p>
                  <div
                    className="cursor-pointer"
                    onClick={() => onActionClick(action, item)}
                  >
                    <Info config={{ width: 28, height: 28 }} />
                  </div>
                </div>
              </div>
            );
          }

          if (el.fieldName === "DocumentCheque.StateId") {
            const action = {
              MenuId: null,
              Icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"fill="none"><path d="M10 9.16667V13.3333M10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5ZM10.0415 6.66667V6.75L9.9585 6.75016V6.66667H10.0415Z"className="stroke-gray-gray10 dark:stroke-gray-gray1"stroke="stroke-gray-gray10  dark:stroke-gray-gray1"strokeLinecap="round"strokeLinejoin="round"/></svg>`,
              ActionId: null,
              MenuDesc: ActionLabelsEnum.ChequeStatus,
              key: ActionLabelsEnum.ChequeStatus,
              FatherId: null,
              MenuType: null,
              loggedInUserId: null,
              condition: "",
            };
            const prevStepAction = {
              MenuId: null,
              Icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"fill="none"><path d="M10 9.16667V13.3333M10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5ZM10.0415 6.66667V6.75L9.9585 6.75016V6.66667H10.0415Z"className="stroke-gray-gray10 dark:stroke-gray-gray1"stroke="stroke-gray-gray10  dark:stroke-gray-gray1"strokeLinecap="round"strokeLinejoin="round"/></svg>`,
              ActionId: null,
              MenuDesc: ActionLabelsEnum.PrevStep,
              key: ActionLabelsEnum.PrevStep,
              FatherId: null,
              MenuType: null,
              loggedInUserId: null,
              condition: "",
            };
            return (
              <div key={el.fieldName} className="flex items-center gap-6 mx-6">
                <div className="flex flex-col gap-2">
                  <p className="text-gray-gray10 text-xs">{el.fieldCaption}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xs">{item[el.fieldName]}</p>
                  <div
                    className="cursor-pointer"
                    onClick={() => onActionClick(action, item)}
                  >
                    <Info config={{ width: 28, height: 28 }} />
                  </div>
                  {item["DocumentCheque.StateId"] !== "نزد صندوق" && (
                    <div
                      className="cursor-pointer"
                      onClick={() => onActionClick(prevStepAction, item)}
                    >
                      <Undo config={{ width: 20, height: 20 }} />
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div key={el.fieldName} className="flex items-center gap-6 mx-6">
              <div className="flex flex-col gap-2">
                <p className="text-gray-gray10 text-xs">{el.fieldCaption}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-bold text-xs">{item[el.fieldName]}</p>
              </div>
            </div>
          );
        })}

        <div className="flex items-center gap-6 ms-6 mt-6 pb-4">
          {actions &&
            actions
              .filter((i) => i.condition === item["DocumentCheque.StateId"])
              .map((action) => (
                <span
                  key={action.MenuDesc}
                  className="cursor-pointer"
                  aria-label={action.MenuDesc}
                  onClick={() => {
                    onActionClick(action, item);
                  }}
                >
                  {typeof action.Icon === "string" && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getColoredIcon(
                          action.Icon.replaceAll(`="18"`, `="20"`),
                          mode,
                        ),
                      }}
                      style={{ width: "24px", height: "24px" }}
                    />
                  )}
                </span>
              ))}
          {/* <CustomTooltip
              title={
                record.Inactive ? t("general.notActive") : t("general.active")
              }
            >
              <CustomSwitch
                config={{ url: activationUrl, id: id }}
                defaultChecked={record.Inactive ? false : true}
              />
            </CustomTooltip> */}
        </div>
      </div>
    );
  };

  const panelStyle: CSSProperties = {
    marginBottom: "0.6rem",
    padding: 0,
    background: "#FBFBFB",
    borderRadius: "4px",
    border: "2px solid",
    borderColor: "#ECECEC",
  };

  const items = processedData?.map((item, index: number) => ({
    key: index.toString(),
    label: Header(item, index),
    children: Details(item),
    style: panelStyle,
  }));

  return (
    <>
      <div className="w-[48px] h-[48px]"></div>
      <div className="relative mt-2 w-full">
        {isSelectMode ? (
          <div className="-top-[52px] absolute flex justify-between items-center bg-white px-2 w-full h-[38px]">
            <div className="flex items-center gap-2">
              <Checkbox
                indeterminate={indeterminate}
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <p className="text-gray-gray10 dark:text-white text-xs">
                {t("general.selectAll")}
              </p>
              {selectedItems?.length > 0 && (
                <span className="text-gray-gray10 dark:text-white text-xs">
                  ( {selectedItems?.length} {t("general.item")})
                </span>
              )}
            </div>
            <div
              className="flex items-center gap-1"
              onClick={handleCloseSelectMode}
            >
              <Close
                config={{
                  height: 18,
                  width: 18,
                  stroke: "#585858",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="-top-[52px] absolute flex items-center gap-2">
            {data?.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <div
                  className={`${
                    pageNumber !== 1 ? "opacity-100" : "opacity-25"
                  } flex justify-center bg-white items-center rounded w-[36px] h-[36px]`}
                  onClick={() => {
                    const prevPage = pageNumber - 1;
                    if (prevPage > 0) {
                      handlePaginationChange(prevPage);
                    }
                  }}
                >
                  {direction === "rtl" ? <RightChevron /> : <LeftChevron />}
                </div>

                <div className="flex flex-col justify-center">
                  <span className="font-medium text-base">{pageNumber}</span>
                </div>
                <div
                  className={`${
                    returnCount === mobilePerPageCount
                      ? "opacity-100"
                      : "opacity-25"
                  } flex justify-center items-center bg-white rounded w-[36px] h-[36px]`}
                  onClick={() => {
                    const nextPage = pageNumber + 1;
                    if (returnCount === mobilePerPageCount) {
                      handlePaginationChange(nextPage);
                    }
                  }}
                >
                  {direction === "rtl" ? <LeftChevron /> : <RightChevron />}
                </div>
              </div>
            )}
          </div>
        )}
        <div
          className="hidden-show-scrollBar w-full h-[calc(100dvh-185px)] overflow-y-auto scroll-smooth"
          onScroll={(e) => e.preventDefault()}
        >
          {processedData?.length > 0 ? (
            <>
              {!loading ? (
                <div className="w-full">
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
                  {data?.length > 0 && (
                    <div className="flex justify-center items-end gap-4 h-[60px] text-sm">
                      <div
                        className={`${
                          pageNumber !== 1 ? "opacity-100" : "opacity-25"
                        } flex justify-center bg-white items-center rounded w-[36px] h-[36px]`}
                        onClick={() => {
                          const firstPage = 1;
                          if (firstPage) {
                            handlePaginationChange(firstPage);
                          }
                        }}
                      >
                        {direction === "rtl" ? (
                          <RightChevronDouble />
                        ) : (
                          <LeftChevronDouble />
                        )}
                      </div>
                      <div
                        className={`${
                          pageNumber !== 1 ? "opacity-100" : "opacity-25"
                        } flex justify-center bg-white items-center rounded w-[36px] h-[36px]`}
                        onClick={() => {
                          const prevPage = pageNumber - 1;
                          if (prevPage > 0) {
                            handlePaginationChange(prevPage);
                          }
                        }}
                      >
                        {direction === "rtl" ? (
                          <RightChevron />
                        ) : (
                          <LeftChevron />
                        )}
                      </div>

                      <div className="flex flex-col justify-center h-[32px]">
                        <span className="font-medium text-base">
                          {pageNumber}
                        </span>
                      </div>
                      <div
                        className={`${
                          returnCount === mobilePerPageCount
                            ? "opacity-100"
                            : "opacity-25"
                        } flex justify-center items-center bg-white rounded w-[36px] h-[36px]`}
                        onClick={() => {
                          const nextPage = pageNumber + 1;
                          if (returnCount === mobilePerPageCount) {
                            handlePaginationChange(nextPage);
                          }
                        }}
                      >
                        {direction === "rtl" ? (
                          <LeftChevron />
                        ) : (
                          <RightChevron />
                        )}
                      </div>
                      <div
                        className={`${
                          totalCount ? "opacity-100" : "opacity-25"
                        } flex justify-center bg-white items-center rounded w-[36px] h-[36px]`}
                        onClick={() => {
                          const lastPageNumber = Math.floor(
                            totalCount / mobilePerPageCount,
                          );

                          if (lastPageNumber) {
                            handlePaginationChange(lastPageNumber);
                          }
                        }}
                      >
                        {direction === "rtl" ? (
                          <LeftChevronDouble />
                        ) : (
                          <RightChevronDouble />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex justify-center items-center backdrop-blur-none">
                  <CustomSpin size="large" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col justify-center items-center gap-8 m-6">
              <NoData />
              <span className="text-gray-gray9 text-sm">
                {t("general.noData")}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default ActionCard;
