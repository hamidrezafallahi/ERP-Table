import {
  CSSProperties,
  forwardRef,
  ReactNode,
  Ref,
  RefAttributes,
  useEffect,
  useState,
} from "react";

import { Checkbox, Collapse } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomSpin } from "@components/atoms/defaultElements";
import {
  Close,
  DownChevron,
  LeftChevron,
  LeftChevronDouble,
  NoData,
  RightChevron,
  RightChevronDouble,
} from "@components/atoms/iconComponents";
import { useProcessedData } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation } from "@services/base";
import { resetItemsByPage, setItems } from "@slice/items";
import { setViewData } from "@slice/pages";
import { getSystemNameById } from "@utils/core";

import type { IChangesField } from "../dataGrid/type";
import RenderStatus from "../renderStatus";
import { Details } from "./details";
import type { IProps } from "./type";

const Card = forwardRef(function Card<T>(
  {
    staticKey,
    staticKeyII,
    gridData,
    actions,
    columnsList,
    onActionClick,
    rowFieldKey,
    additionalFieldKey,
    conditionalActions,
    isSelectMode,
    setIsSelectMode,
    mobilePerPageCount,
    viewData,
    direction,
    totalCount,
    loading,
    withoutActivation,
  }: IProps<T> & { containerRef?: Ref<HTMLDivElement> },
  ref: RefAttributes<HTMLDivElement>["ref"],
) {
  const t = useTranslations();
  const dispatch = useDispatch();
  const {
    lang: locale,
    activePage,
    selectedItems,
    tagsInfo,
  } = useAppSelector((state) => {
    const activePage = state.withPersist.pages.find((item) => item.isActive);
    return {
      lang: state.withPersist.config.lang,
      activePage,
      selectedItems:
        state.withPersist.listItems.itemsByPage?.[activePage?.pageId],
      tagsInfo: state.withoutPersist.container.recordsTags,
    };
  }, shallowEqual);

  const systemId = activePage?.SystemId;
  const repoId = activePage?.RepoId;
  const showTags = activePage?.viewData?.ShowTags;

  const tagsDataFinder = (id) => {
    const tagsData = tagsInfo?.find(
      (item) => item.RepoId === repoId && item.RefId === id,
    )?.tags;
    if (tagsData?.length > 0) return tagsData;
    return [];
  };

  const returnCount = gridData?.ReturnCount;
  const data = gridData?.Data;

  const [setBookmark, { isLoading: bookmarkIsLoading }] = useCUDDataMutation();
  const columnsConfig = columnsList && columnsList?.column;
  const processedData = useProcessedData({ data, columnsConfig, locale });

  const [selectAll, setSelectAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  const [currentChanges, setCurrentChanges] = useState<IChangesField[]>([]);
  const [currentId, setCurrentId] = useState(null);

  const handleSelectRow = (item: number) => {
    if (selectedItems.includes(item)) {
      dispatch(
        setItems({
          pageId: activePage?.pageId,
          items: selectedItems.filter((i) => i !== item),
        }),
      );
    } else {
      dispatch(
        setItems({
          pageId: activePage?.pageId,
          items: [...selectedItems, item],
        }),
      );
    }
  };
  const handlePaginationChange = (page: number) => {
    dispatch(
      setViewData({
        ...viewData,
        PagingInfo: {
          PageNumber: page,
          PageRecordCount: viewData.PagingInfo.PageRecordCount,
        },
      }),
    );
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(
        setItems({
          pageId: activePage?.pageId,
          items: processedData.map((item) => item[rowFieldKey]),
        }),
      );
    } else {
      dispatch(resetItemsByPage({ pageId: activePage?.pageId }));
    }
  };
  const handleCloseSelectMode = () => {
    setIsSelectMode(false);
    dispatch(resetItemsByPage({ pageId: activePage?.pageId }));
  };
  const handleSetBookmark = async (id: number, isBookmarked: boolean) => {
    setCurrentId(id);
    const isStateBookmark = currentChanges.find((item) => item.id === id);
    if (isStateBookmark) {
      isBookmarked = isStateBookmark.HasBookMark;
    }

    if (isBookmarked === undefined) {
      isBookmarked = false;
    }
    try {
      const result = await setBookmark({
        url: `/api/${getSystemNameById(systemId)}/insert/bookmark`,
        body: {
          RepoId: repoId,
          RefId: id,
        },
      }).unwrap();

      if (result && result.Result === "Success") {
        setCurrentChanges((prevState) => {
          const existingChange = prevState.find((item) => item.id === id);

          if (existingChange) {
            return prevState.map((item) =>
              item.id === id
                ? { ...item, HasBookMark: isBookmarked ? false : true }
                : item,
            );
          }

          return [
            ...prevState,
            {
              id: id,
              HasBookMark: isBookmarked ? false : true,
            },
          ];
        });
      }
    } catch (error) {
      null;
    }
  };

  const Header = (item: any) => {
    let timer: NodeJS.Timeout;
    const handleMouseDown = (e) => {
      timer = setTimeout(() => {
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        setIsSelectMode(true);
        handleSelectRow(item[rowFieldKey]);
        e.preventDefault();
      }, 700);
    };

    const handleMouseUp = () => {
      clearTimeout(timer);
    };
    const displayStaticData: ReactNode = item[staticKey] as ReactNode;
    const displayStaticDataII: ReactNode = item[staticKeyII] as ReactNode;

    const isDeleted = activePage?.viewData?.deletedItems?.find(
      (el) => el === item[rowFieldKey],
    );

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
            handleSelectRow(item[rowFieldKey]);
          }
        }}
      >
        <div className="flex items-center gap-1">
          {isSelectMode && (
            <Checkbox
              checked={selectedItems.includes(item[rowFieldKey])}
              onClick={(event) => event.stopPropagation()}
              onChange={() => handleSelectRow(item[rowFieldKey])}
            />
          )}
          <p
            className={`${
              isDeleted ? "line-through text-gray-gray8" : ""
            } hidden-show-scrollBar w-[calc(100dvw-130px)] overflow-auto text-gray-gray10 text-sm whitespace-nowrap select-none`}
          >
            {displayStaticData}
            {displayStaticDataII ? ` - ${displayStaticDataII}` : null}
          </p>
        </div>

        <div
          className="flex justify-end gap-1 p-[2px]"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <RenderStatus
            id={item[rowFieldKey]}
            pendingStatusId={item.PendingStatusId}
            pendingMessage={item.PendingMessage}
            isMobile
          />
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

  const items = processedData?.map((item: T, index: number) => ({
    key: index.toString(),
    label: Header(item),
    children: (
      <Details
        actions={actions}
        additionalFieldKey={additionalFieldKey}
        bookmarkIsLoading={bookmarkIsLoading}
        columnsConfig={columnsConfig}
        conditionalActions={conditionalActions}
        currentChanges={currentChanges}
        currentId={currentId}
        handleSetBookmark={handleSetBookmark}
        item={item}
        onActionClick={onActionClick}
        rowFieldKey={rowFieldKey}
        key={item[rowFieldKey]}
        showTags={showTags}
        tagsData={tagsDataFinder(item[rowFieldKey])}
        repoId={repoId}
        systemId={systemId}
        withoutActivation={withoutActivation}
      />
    ),
    style: panelStyle,
  }));

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
  return (
    <>
      <div className="relative mt-2 w-full">
        {isSelectMode ? (
          <div className="-top-[45px] absolute flex justify-between items-center bg-white px-2 w-full h-[38px]">
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
          <div className="-top-[42px] absolute flex items-center gap-2">
            {data?.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <div
                  className={`${
                    viewData?.PagingInfo?.PageNumber !== 1
                      ? "opacity-100"
                      : "opacity-25"
                  } flex justify-center bg-white items-center rounded w-[36px] h-[36px]`}
                  onClick={() => {
                    const prevPage = viewData?.PagingInfo?.PageNumber - 1;
                    if (prevPage > 0) {
                      handlePaginationChange(prevPage);
                    }
                  }}
                >
                  {direction === "rtl" ? <RightChevron /> : <LeftChevron />}
                </div>

                <div className="flex flex-col justify-center h-[32px]">
                  <span className="font-medium text-base">
                    {viewData?.PagingInfo?.PageNumber}
                  </span>
                </div>
                <div
                  className={`${
                    returnCount === mobilePerPageCount
                      ? "opacity-100"
                      : "opacity-25"
                  } flex justify-center items-center bg-white rounded w-[36px] h-[36px]`}
                  onClick={() => {
                    const nextPage = viewData?.PagingInfo?.PageNumber + 1;
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
                          viewData?.PagingInfo?.PageNumber !== 1
                            ? "opacity-100"
                            : "opacity-25"
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
                          viewData?.PagingInfo?.PageNumber !== 1
                            ? "opacity-100"
                            : "opacity-25"
                        } flex justify-center bg-white items-center rounded w-[36px] h-[36px]`}
                        onClick={() => {
                          const prevPage = viewData?.PagingInfo?.PageNumber - 1;
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
                          {viewData?.PagingInfo?.PageNumber}
                        </span>
                      </div>
                      <div
                        className={`${
                          returnCount === mobilePerPageCount
                            ? "opacity-100"
                            : "opacity-25"
                        } flex justify-center items-center bg-white rounded w-[36px] h-[36px]`}
                        onClick={() => {
                          const nextPage = viewData?.PagingInfo?.PageNumber + 1;
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

export default Card;
