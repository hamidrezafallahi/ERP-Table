import {
  forwardRef,
  KeyboardEvent,
  Ref,
  useCallback,
  useState,
} from 'react';

import {
  Form,
  Pagination,
  Popover,
  Skeleton,
  Spin,
  Table,
  TableColumnsType,
} from 'antd';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomDropdownButton,
  CustomSelect,
  CustomSwitch,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  BookMarkIcon,
  BookMarkIconFilled,
  Dots,
  LeftChevron,
  MoreVertical,
  New,
  NoData,
  RightChevron,
  SpinIcon,
} from '@components/atoms/iconComponents';
import { ActionLabelsEnum } from '@components/organisms/list/enum';
import {
  useDarkMode,
  useFullScreen,
  useInitializePage,
  useProcessedData,
} from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useCUDDataMutation } from '@services/base';
import {
  IBaseDto,
  PendingStatusEnum,
} from '@services/base/type';
import type { IColumnConfig } from '@services/generalType/type';
import {
  resetItemsByPage,
  setItems,
} from '@slice/items';
import { setViewData } from '@slice/pages';
import {
  findingPageState,
  getColoredIcon,
  getSystemNameById,
  renderBadge,
} from '@utils/core';
import {
  showInfoToast,
  showSuccessToast,
} from '@utils/toast';

import RenderStatus from '../renderStatus';
import { TagsRenderer } from '../tag';
import type {
  IChangesField,
  IProps,
} from './type';

function DataGridInner<T extends IBaseDto>(
  {
    data,
    totalCount,
    totalIsLoading,
    actions,
    columnsList,
    viewData,
    loading,
    rowFieldKey,
    additionalFieldKey,
    recordPerPage,
    onActionClick,
    conditionalActions,
    EditField,
    formUrl,
    withoutActivation,
    filteringAction,
    renderSimple = false,
    isShowChangeStatus = false,
    system,
  }: IProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const { mode = "light" } = useDarkMode();

  const t = useTranslations();
  const dispatch = useDispatch();
  const initializePage = useInitializePage();
  const pathname = usePathname();
  const toggleFullScreen = useFullScreen();
  const [openDocStatusId, setOpenDocStatusId] = useState(false);

  const { direction, locale, selectedItems, activePage, isFullScreen } =
    useAppSelector((state) => {
      const direction = state.withPersist.config.direction;
      const locale = state.withPersist.config.lang;
      const selectedItems = state.withPersist.listItems;
      const activePage = state.withPersist.pages?.find((item) => item.isActive);
      const isFullScreen = state.withPersist.config.fullScreen;
      const minimize = state.withoutPersist.container.minimize;

      return {
        direction,
        locale,
        selectedItems,
        activePage,
        isFullScreen,
        minimize,
      };
    }, shallowEqual);

  const parts = pathname.split("/").filter(Boolean);
  const systemName = parts[1];
  const repoName = parts[2]?.replace(/List$/, "");

  const systemId = activePage?.SystemId;
  const repoId = activePage?.RepoId;
  const columnsConfig = columnsList && columnsList?.column;
  const processedData = useProcessedData({
    data,
    columnsConfig,
    locale,
  });

  const [setBookmark, { isLoading: bookmarkIsLoading }] = useCUDDataMutation();
  const [currentChanges, setCurrentChanges] = useState<IChangesField[]>([]);
  const [currentId, setCurrentId] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleEdit = (id: number, PendingStatusId?: number) => {
    let statusId;
    const deletedItems = activePage?.viewData?.deletedItems;
    const findingStatusId = activePage?.viewData?.statusItems.find(
      (el) => el.id === id,
    );
    if (findingStatusId) {
      statusId = findingStatusId.status;
    } else {
      statusId = PendingStatusId;
    }
    const isDeleted = deletedItems?.find((item) => item === id);
    const isPending =
      PendingStatusId === PendingStatusEnum.Pending1 ||
      PendingStatusId === PendingStatusEnum.Pending2 ||
      PendingStatusId === PendingStatusEnum.Pending3;
    if (isDeleted || isPending) {
      showInfoToast(t("toast.needReload"));
    } else {
      initializePage({
        config: {
          RepoId: repoId,
          SystemId: systemId,
          url: `${formUrl}?id=${id}`,
          pageState: statusId && findingPageState(statusId?.toString()),
          originalPageState: statusId && findingPageState(statusId?.toString()),
          Id: Number(id),
          listPageId: activePage?.pageId,
        },
      });
    }
  };
  const handleAddNew = () => {
    initializePage({
      config: {
        RepoId: repoId,
        SystemId: systemId,
        url: formUrl,
        listPageId: activePage.pageId,
      },
    });
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
  const handlePageSizeChange = (value: string) => {
    dispatch(
      setViewData({
        ...viewData,
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: value ? value : recordPerPage,
        },
      }),
    );
  };
  const handleSetBookmark = async (id: number, isBookmarked: boolean) => {
    const deletedItems = activePage?.viewData?.deletedItems;
    const isDeleted = deletedItems?.find((item) => item === id);
    setCurrentId(id);

    if (isDeleted) {
      showInfoToast(t("toast.needReload"));
    } else {
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
                item.id === id ? { ...item, HasBookMark: !isBookmarked } : item,
              );
            }

            return [
              ...prevState,
              {
                id: id,
                HasBookMark: !isBookmarked,
              },
            ];
          });
        }
      } catch (error) {
        null;
      }
    }
  };

  const [mutateItem, { isLoading: changeDocStatusLoading }] =
    useCUDDataMutation();

  const handelDocStatus = async (id: number, values) => {
    //ریحانه کامل کنه
    const docStatusId = values.DocStatusId;
    const body = {
      DocId: id,
      StatusId: docStatusId,
      ChangeFields: ["StatusId"],
    };

    const res = await mutateItem({
      url: "api/" + system + "/update/ChangeDocStatus",
      body,
    }).unwrap();

    if (res?.Result == "Success") {
      const newId = res?.Key;
      showSuccessToast(t("toast.successTitle"));
    }
  };

  const handleKeyAction = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowUp") {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "ArrowDown") {
        setFocusedIndex((prev) => Math.min(prev + 1, processedData.length - 1));
      } else if (e.code === "Space") {
        const focusedKey = processedData[focusedIndex]?.[rowFieldKey];
        if (focusedKey) {
          const prev = selectedItems?.itemsByPage?.[activePage?.pageId] || [];
          const exist = prev.includes(focusedKey);
          const newSelectedData = exist
            ? prev.filter((item) => item !== focusedKey)
            : [...prev, focusedKey];
          dispatch(
            setItems({ pageId: activePage?.pageId, items: newSelectedData }),
          );
        }
      } else if (e.code === "Escape") {
        dispatch(resetItemsByPage({ pageId: activePage?.pageId }));
      } else if (e.code === "Enter") {
        const record = processedData[focusedIndex];
        if (record) {
          handleEdit(record[rowFieldKey], record.PendingStatusId);
        }
      } else if (e.altKey === true) {
        if (e.key === "n") {
          handleAddNew();
        }
        if (e.key === "b") {
          const record = processedData[focusedIndex];
          if (record) {
            handleSetBookmark(Number(record[rowFieldKey]), record?.HasBookMark);
          }
        }
        if (e.key === "a") {
          const allKeys = processedData?.map((i) => i[rowFieldKey]);
          dispatch(setItems({ pageId: activePage?.pageId, items: allKeys }));
        }

        if (e.key === "y") {
          toggleFullScreen();
        }
      } else if (e.key === "PageUp") {
        if (totalCount > viewData?.PagingInfo?.PageRecordCount) {
          handlePaginationChange(viewData?.PagingInfo?.PageNumber + 1);
        }
      } else if (e.key === "PageDown") {
        if (viewData?.PagingInfo?.PageNumber > 1) {
          handlePaginationChange(viewData?.PagingInfo?.PageNumber - 1);
        }
      }
    },
    [
      focusedIndex,
      processedData,
      rowFieldKey,
      selectedItems?.itemsByPage?.[activePage?.pageId],
      dispatch,
      handleEdit,
    ],
  );

  const hasBadge = columnsConfig?.find((item) => item.fieldType === "badge");

  const correctColumns = columnsConfig?.filter(
    (column) => column?.fieldType !== "badge",
  );

  const columns: TableColumnsType<T> = correctColumns?.map(
    (item: IColumnConfig, index: number) => {
      const hasPendingStatus = processedData?.find(
        (i) => i.PendingStatusId !== undefined,
      );

      const hasDocStatus = processedData?.find(
        (i) => i.DocStatusDesc !== undefined,
      );

      const isFirstColumn = index === 0;

      if (hasPendingStatus && isFirstColumn) {
        return {
          title: item.fieldCaption,
          key: item.fieldName,
          dataIndex: item.fieldName,
          align: typeof item.fieldName === "string" ? "right" : "left",
          fixed: direction === "rtl" ? "right" : "left",
          render: (text: any, record: any) => {
            const badgeValue = hasBadge && record[hasBadge?.fieldName];
            if (item.fieldType === "function")
              return item.renderFunction(record);
            return (
              <div className="flex flex-wrap items-center gap-2">
                {record[item.fieldName] && (
                  <span>
                    {EditField && item.fieldName === EditField ? (
                      <div className="my-2">
                        <span
                          className="hover:text-blue-400 cursor-pointer"
                          onClick={() =>
                            handleEdit(
                              record[rowFieldKey],
                              record.PendingStatusId,
                            )
                          }
                        >
                          {record[item.fieldName]}
                        </span>
                      </div>
                    ) : (
                      record[item.fieldName]
                    )}
                  </span>
                )}
                <RenderStatus
                  id={record[rowFieldKey]}
                  pendingStatusId={record.PendingStatusId}
                  pendingMessage={record.PendingMessage}
                  isMobile={false}
                />
                {!!hasBadge &&
                  renderBadge({ type: hasBadge?.badgeType, title: badgeValue })}
              </div>
            );
          },
        };
      }
      if (EditField && item.fieldName === EditField) {
        return {
          title: item.fieldCaption,
          dataIndex: item.fieldName,
          key: item.fieldName,
          align: typeof item.fieldName === "string" ? "right" : "left",
          render: (text: any, record: any) => {
            return (
              <div className="my-2">
                <span
                  className="hover:text-blue-400 cursor-pointer"
                  onClick={() =>
                    handleEdit(record[rowFieldKey], record.PendingStatusId)
                  }
                >
                  {record[item.fieldName]}
                </span>
              </div>
            );
          },
        };
      }
      if (hasBadge && isFirstColumn) {
        return {
          title: item.fieldCaption,
          key: item.fieldName,
          align: typeof item.fieldName === "string" ? "right" : "left",
          render: (text: any, record: any) => {
            const badgeValue = hasBadge?.conditionalConfig?.find(
              (el) => el.value === record[hasBadge?.fieldName],
            );
            return (
              <div className="flex items-center gap-2 my-2">
                {record?.[item.fieldName]}
                {!!badgeValue &&
                  badgeValue?.title &&
                  renderBadge({
                    type: hasBadge?.badgeType,
                    title: badgeValue?.title,
                  })}
              </div>
            );
          },
        };
      }
      if (
        isShowChangeStatus &&
        hasDocStatus &&
        item.fieldName === "DocStatusDesc"
      ) {
        return {
          title: item.fieldCaption,
          dataIndex: item.fieldName,
          key: item.fieldName,
          align: typeof item.fieldName === "string" ? "right" : "left",
          render: (text: any, record: any) => {
            if (item.renderFunction) return item.renderFunction(record);
            return (
              <div className="flex gap-2 my-2">
                {record?.[item.fieldName]}
                {/* onClick={() => handelDocStatus(Number(record["DocId"])}*/}
                <div key={record[rowFieldKey]}>
                  <Popover
                    content={
                      <div>
                        <Form
                          layout="vertical"
                          onFinish={(values) => {
                            handelDocStatus(record["DocId"], values);
                            setOpenDocStatusId(null);
                          }}
                          style={{ padding: 12, width: 220 }}
                        >
                          <Form.Item
                            label="وضعیت"
                            name="DocStatusId"
                            rules={[
                              { required: true, message: "وضعیت را وارد کنید" },
                            ]}
                          >
                            <CustomSelect
                              value={record["DocStatusId"]}
                              options={[
                                { value: 3, label: "پیش نویس" },
                                { value: 1, label: "تنظیم شده" },

                                { value: 5, label: "ابطال" },
                                { value: 2, label: "قطعی شده" },
                              ].filter(
                                (option) =>
                                  option.value !== record["DocStatusId"],
                              )}
                            />
                          </Form.Item>

                          <CustomButton
                            type="text"
                            htmlType="submit"
                            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
                          >
                            {changeDocStatusLoading ? (
                              <Spin size="large" indicator={<SpinIcon />} />
                            ) : (
                              t("general.submit")
                            )}
                          </CustomButton>
                        </Form>
                      </div>
                    }
                    trigger="click"
                    open={openDocStatusId === record[rowFieldKey]}
                    onOpenChange={(visible) => {
                      setOpenDocStatusId(visible ? record[rowFieldKey] : null);
                    }}
                    placement="bottomRight"
                  >
                    <span style={{ cursor: "pointer" }}>
                      <MoreVertical config={{ width: 18, height: 18 }} />
                    </span>
                  </Popover>
                </div>
              </div>
            );
          },
        };
      }
      return {
        title: item.fieldCaption,
        dataIndex: item.fieldName,
        key: item.fieldName,
        align: typeof item.fieldName === "string" ? "right" : "left",
        render: (text: any, record: any) => {
          if (item.renderFunction) return item.renderFunction(record);
          return <div className="my-2">{record?.[item.fieldName]}</div>;
        },
      };
    },
  );

  if (viewData?.ShowTags) {
    columns?.push({
      title: t("general.tags"),
      key: "tags",
      align: "end",
      render: (_, record) => {
        return (
          <div className="flex justify-end items-center gap-4">
            <TagsRenderer RefId={Number(record[rowFieldKey])} />
            <CustomButton
              type="text"
              className="flex justify-center items-center bg-main-white hover:!bg-transparent dark:bg-black-black4 dark:hover:!bg-black-black3 shadow p-0 w-5 h-5"
              onClick={() =>
                onActionClick(
                  {
                    MenuDesc: ActionLabelsEnum.AddTag as string,
                    key: `${record[rowFieldKey]}`,
                    loggedInUserId: Number(record[rowFieldKey]),
                  },
                  Number(record[rowFieldKey]),
                  record[additionalFieldKey],
                  record["PendingStatusId"],
                  record["FormViewId"],
                  record["UniqueId"],
                )
              }
            >
              <New
                config={{
                  width: 16,
                  height: 16,
                  stroke: mode === "dark" ? "#FBFBFB" : "#767676",
                }}
              />
            </CustomButton>
          </div>
        );
      },
    });
  }

  if (actions) {
    const haveMoreAction = actions?.length > 6 ? true : false;
    const firstSixActions = actions?.slice(0, 6);
    const restActions = actions?.slice(6);

    columns?.push({
      title: t("general.action"),
      key: "action",
      fixed: direction === "rtl" ? "left" : "right",
      onCell: (_, index) => ({
        style: {
          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f4f4f4",
        },
      }),
      minWidth: 120,
      align: direction === "rtl" ? "right" : "left",

      render: (_, record) => {
        const filteredRestActions = filteringAction
          ? filteringAction(restActions, record)
          : restActions;
        const filteredFirstSixActions = filteringAction
          ? filteringAction(firstSixActions, record)
          : firstSixActions;
        const moreActionItem = filteredRestActions?.map((action) => {
          const isDisabled =
            conditionalActions?.some((el) =>
              el.conditionallyAction === action.MenuDesc
                ? el.opposite
                  ? !!record[el.conditionalProperty]
                  : !record[el.conditionalProperty]
                : false,
            ) ?? false;

          return {
            key: action.MenuId,
            label: action.MenuDesc,
            disabled: isDisabled,
            icon: (
              <span>
                {typeof action.Icon === "string" && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(action.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )}
              </span>
            ),
            onClick: () => {
              if (!isDisabled) {
                onActionClick(
                  action,
                  Number(record[rowFieldKey]),
                  record[additionalFieldKey],
                  record["PendingStatusId"],
                  record["FormViewId"],
                  record["UniqueId"],
                );
              } else {
                null;
              }
            },
          };
        });

        const isDeleted = activePage?.viewData?.deletedItems?.find(
          (item) => item === record[rowFieldKey],
        );
        const isPending =
          record["PendingStatusId"] === PendingStatusEnum.Pending1 ||
          record["PendingStatusId"] === PendingStatusEnum.Pending2 ||
          record["PendingStatusId"] === PendingStatusEnum.Pending3;
        const isCanDelete = record["IsCanDelete"];
        const isCanUpdate = record["IsCanUpdate"];

        if (isDeleted || isPending)
          return (
            <div className="flex justify-center items-center gap-">
              <span className="w-[18px] h-[18px]"></span>
            </div>
          );
        return (
          <div className="flex justify-center items-center gap-3">
            {filteredFirstSixActions.map((action) => {
              const isDisabled =
                conditionalActions?.some((el) =>
                  el.conditionallyAction === action.MenuDesc
                    ? el.opposite
                      ? !!record[el.conditionalProperty]
                      : !record[el.conditionalProperty]
                    : false,
                ) ?? false;

              const shouldShow =
                action.ActionType === 4
                  ? isCanDelete === undefined || isCanDelete
                  : action.ActionType === 3
                    ? isCanUpdate === undefined || isCanUpdate
                    : true;

              if (!shouldShow) return null;

              return (
                <CustomTooltip
                  key={`${action.ActionType}-${action.MenuDesc}`}
                  title={action.MenuDesc}
                >
                  <span
                    className={
                      isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                    }
                    aria-label={action.MenuDesc}
                    onClick={() => {
                      if (!isDisabled) {
                        onActionClick(
                          action,
                          Number(record[rowFieldKey]),
                          record[additionalFieldKey],
                          record["PendingStatusId"],
                          record["FormViewId"],
                          record["UniqueId"],
                        );
                      }
                    }}
                  >
                    {typeof action.Icon === "string" && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: getColoredIcon(action.Icon, mode),
                        }}
                        style={{
                          width: "18px",
                          height: "17px",
                          opacity: isDisabled ? 0.2 : 1,
                        }}
                      />
                    )}
                  </span>
                </CustomTooltip>
              );
            })}
            {haveMoreAction && (
              <CustomDropdownButton
                placement={locale === "fa" ? "bottomRight" : "bottomLeft"}
                className="flex rounded h-full"
                items={moreActionItem}
              >
                <span className="cursor-pointer" id="addToHistory">
                  <Dots
                    config={{
                      width: 18,
                      height: 19,
                    }}
                  />
                </span>
              </CustomDropdownButton>
            )}
            {!withoutActivation && (
              <CustomTooltip
                title={
                  record.Inactive ? t("general.notActive") : t("general.active")
                }
              >
                <CustomSwitch
                  config={{
                    url: `/api/${systemName}/inActive/${repoName}`,
                    id: Number(record[rowFieldKey]),
                  }}
                  defaultChecked={record.Inactive ? false : true}
                />
              </CustomTooltip>
            )}
          </div>
        );
      },
    });
  }

  return (
    <div
      className={`${
        isFullScreen
          ? "h-[calc(100dvh-130px)]"
          : "max-h-[calc(100dvh-200px)] h-[calc(100dvh-200px)]"
      } flex flex-col justify-between w-full `}
    >
      <div
        tabIndex={-1}
        ref={ref}
        onKeyDown={handleKeyAction}
        className={`${
          isFullScreen ? "h-[calc(100dvh-160px)]" : "h-[calc(100dvh-260px)]"
        } pt-3 outline-none  overflow-x-auto overflow-y-hidden`}
      >
        <Table
          loading={{
            spinning: loading,
            indicator: <Spin size="large" indicator={<SpinIcon />} />,
          }}
          tableLayout="auto"
          locale={{
            emptyText: (
              <div className="flex flex-col justify-center items-center gap-8 m-28">
                <NoData />
                <span className="text-[18px] text-gray-gray9 dark:text-white">
                  {t("general.noData")}
                </span>
              </div>
            ),
          }}
          size="small"
          rowSelection={
            !renderSimple && {
              renderCell: (_value, _record, _index, originNode) => {
                return (
                  <>
                    <div className="flex items-center gap-2 w-[42px]">
                      {originNode}
                      <span
                        onClick={() =>
                          handleSetBookmark(
                            Number(_record[rowFieldKey]),
                            _record?.HasBookMark,
                          )
                        }
                      >
                        {currentId &&
                        currentId === _record[rowFieldKey] &&
                        bookmarkIsLoading ? (
                          <Spin size="small" indicator={<SpinIcon />} />
                        ) : currentChanges &&
                          currentChanges.find(
                            (item) => item.id === _record[rowFieldKey],
                          ) ? (
                          currentChanges.find(
                            (item) => item.id === _record[rowFieldKey],
                          ).HasBookMark === true ? (
                            <BookMarkIconFilled />
                          ) : (
                            <BookMarkIcon />
                          )
                        ) : _record?.HasBookMark ? (
                          <BookMarkIconFilled />
                        ) : (
                          <BookMarkIcon />
                        )}
                      </span>
                    </div>
                  </>
                );
              },
              type: "checkbox",
              selectedRowKeys: selectedItems?.itemsByPage?.[activePage?.pageId],
              onChange: (selectedRowKeys, _selectedRows) => {
                const prev =
                  selectedItems?.itemsByPage?.[activePage?.pageId] ?? [];
                const currentPageIds = processedData.map(
                  (item) => item[rowFieldKey],
                );

                const itemsFromOtherPages = prev.filter(
                  (item) => !currentPageIds.includes(item),
                );

                const numericKeys = selectedRowKeys.filter(
                  (key): key is number => typeof key === "number",
                );

                const finalItems = Array.from(
                  new Set<number>([...itemsFromOtherPages, ...numericKeys]),
                );

                dispatch(
                  setItems({ pageId: activePage?.pageId, items: finalItems }),
                );
              },
              getCheckboxProps: (record) => ({
                disabled: activePage?.viewData?.deletedItems?.find(
                  (item) => item === record[rowFieldKey],
                )
                  ? true
                  : false,
                name: String(record[rowFieldKey]),
              }),
            }
          }
          pagination={false}
          rowKey={rowFieldKey}
          columns={columns}
          dataSource={processedData}
          onRow={(data, index) => {
            const deletedItems = activePage?.viewData?.deletedItems;
            const isDeleted = deletedItems?.find(
              (item) => item === data[rowFieldKey],
            );

            return {
              onClick: () => setFocusedIndex(index),

              className: isDeleted
                ? "line-through text-gray-gray8"
                : focusedIndex === index
                  ? "custom-row-focused"
                  : index % 2 === 0
                    ? "custom-row-even"
                    : "custom-row-odd",
            };
          }}
          scroll={{
            x: "max-content",
            y: undefined,
          }}
        />
      </div>

      {totalIsLoading && (
        // <div className="flex items-center w-full">
        //   <CustomSpin className="w-full" size="large" />
        // </div>
        <div className="flex justify-end items-center gap-2">
          <Skeleton.Button active={true} style={{ width: 80 }} />
          <Skeleton.Button active={true} style={{ width: 70 }} />
          <Skeleton.Button active={true} style={{ width: 350 }} />
        </div>
      )}
      {!!totalCount && !totalIsLoading && (
        <div className="flex justify-end items-center gap-2 text-xs">
          {totalCount && (
            <span className="p-2 rounded">
              {locale === "fa"
                ? totalCount.toLocaleString("fa-IR")
                : totalCount.toLocaleString("en-US")}
            </span>
          )}
          {data?.length > 0 && viewData?.PagingInfo?.PageRecordCount && (
            <CustomSelect
              className="!w-[130px]"
              value={activePage?.viewData?.PagingInfo?.PageRecordCount}
              onChange={handlePageSizeChange}
              options={[
                { value: recordPerPage, label: t("general.auto") },
                { value: "10", label: "10" },
                { value: "50", label: "50" },
                { value: "100", label: "100" },
                { value: "300", label: "300" },
              ]}
            />
          )}

          {data?.length > 0 && (
            <Pagination
              prevIcon={
                <CustomButton className="m-0 p-0 rounded w-fit">
                  {direction === "rtl" ? <RightChevron /> : <LeftChevron />}
                </CustomButton>
              }
              nextIcon={
                <CustomButton className="m-0 p-0 w-fit">
                  {direction === "rtl" ? <LeftChevron /> : <RightChevron />}
                </CustomButton>
              }
              current={viewData?.PagingInfo?.PageNumber}
              jumpNextIcon={<span>...</span>}
              jumpPrevIcon={<span>...</span>}
              pageSize={viewData?.PagingInfo?.PageRecordCount}
              total={totalCount}
              showSizeChanger={false}
              onChange={handlePaginationChange}
              showTitle={false}
            />
          )}
        </div>
      )}
    </div>
  );
}
const DataGrid = forwardRef(DataGridInner) as <T extends IBaseDto>(
  props: IProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReturnType<typeof DataGridInner>;

export default DataGrid;
