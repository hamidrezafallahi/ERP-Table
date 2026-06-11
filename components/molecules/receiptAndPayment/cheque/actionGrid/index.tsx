import { Pagination, Spin, Table, TableColumnsType } from "antd";
import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import {
  CustomButton,
  CustomSelect,
  CustomTooltip,
} from "@components/atoms/defaultElements";
import {
  InfoIcon,
  LeftChevron,
  NoData,
  RightChevron,
  SpinIcon,
  Undo,
} from "@components/atoms/iconComponents";
import RenderStatus from "@components/molecules/renderStatus";
import { useDarkMode, useProcessedData } from "@hooks/custom";
import type { IColumnConfig } from "@services/generalType/type";
import { getColoredIcon } from "@utils/core";

import type { IProps } from "./type";
import { useAppSelector } from "@hooks/custom/useAppSelector";
import { ActionLabelsEnum } from "@components/organisms/receiptAndPayment/action/enum";

export const ActionGrid = ({
  data,
  totalCount,
  actions,
  columnsConfig,
  pageNumber,
  setPageNumber,
  recordPerPage,
  setRecordPerPage,
  loading,
  rowFieldKey,
  headerKey,
  onActionClick,
  selectedItems,
  setSelectedItems,
  setSelectedHeaderId,
  setSelectedDetails,
}: IProps) => {
  const { mode = "light" } = useDarkMode();

  const t = useTranslations();

  const { locale, isFullScreen } = useAppSelector((state) => {
    const locale = state.withPersist.config.lang;
    const isFullScreen = state.withPersist.config.fullScreen;

    return {
      locale,

      isFullScreen,
    };
  }, shallowEqual);

  const processedData = useProcessedData({
    data,
    columnsConfig,
    locale,
  });

  const columns: TableColumnsType = columnsConfig?.map(
    (item: IColumnConfig, index: number) => {
      const hasPendingStatus = processedData?.find(
        (i) => i.PendingStatusId !== undefined,
      );
      const isFirstColumn = index === 0;

      if (hasPendingStatus && isFirstColumn) {
        return {
          title: item.fieldCaption,
          key: item.fieldName,
          render: (text: any, record: any) => {
            const action = {
              MenuId: null,
              Icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"fill="none"><path d="M10 9.16667V13.3333M10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5ZM10.0415 6.66667V6.75L9.9585 6.75016V6.66667H10.0415Z"className="stroke-gray-gray10 dark:stroke-gray-gray1"stroke="stroke-gray-gray10  dark:stroke-gray-gray1"strokeLinecap="round"strokeLinejoin="round"/></svg>`,
              ActionId: null,
              MenuDesc: "عملیات چک دریافتی",
              key: "عملیات چک دریافتی",
              FatherId: null,
              MenuType: null,
              loggedInUserId: null,
              condition: "",
            };
            return (
              <div className="flex flex-wrap items-center gap-2">
                {record[item.fieldName] && (
                  <span>{record[item.fieldName]}</span>
                )}

                <RenderStatus
                  id={record[rowFieldKey]}
                  pendingStatusId={record.PendingStatusId}
                  pendingMessage={record.PendingMessage}
                  isMobile={false}
                />
                <div
                  className="cursor-pointer"
                  onClick={() => onActionClick(action, record)}
                >
                  <InfoIcon
                    config={{ stroke: "#595959", width: 20, height: 20 }}
                  />
                </div>
              </div>
            );
          },
        };
      }
      if (!hasPendingStatus && isFirstColumn) {
        return {
          title: item.fieldCaption,
          key: item.fieldName,
          render: (text: any, record: any) => {
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
              <div className="flex flex-wrap items-center gap-2">
                {record[item.fieldName] && (
                  <span>{record[item.fieldName]}</span>
                )}

                <CustomTooltip title={ActionLabelsEnum.ChequeCirculation}>
                  <div
                    className="cursor-pointer"
                    onClick={() => onActionClick(action, record)}
                  >
                    <InfoIcon
                      config={{ stroke: "#595959", width: 20, height: 20 }}
                    />
                  </div>
                </CustomTooltip>
              </div>
            );
          },
        };
      }

      if (item.fieldName === "DocumentCheque.StateId") {
        return {
          title: item.fieldCaption,
          key: item.fieldName,
          render: (text: any, record: any) => {
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
              <div className="flex flex-wrap items-center gap-2">
                {record[item.fieldName] && (
                  <span>{record[item.fieldName]}</span>
                )}

                <div
                  className="cursor-pointer"
                  onClick={() => onActionClick(action, record)}
                >
                  <CustomTooltip title={ActionLabelsEnum.ChequeStatus}>
                    <InfoIcon
                      config={{ stroke: "#595959", width: 20, height: 20 }}
                    />{" "}
                  </CustomTooltip>
                </div>
                {record["DocumentCheque.StateId"] !== "نزد صندوق" && (
                  <div
                    className="cursor-pointer"
                    onClick={() => onActionClick(prevStepAction, record)}
                  >
                    <CustomTooltip title={ActionLabelsEnum.PrevStep}>
                      <Undo config={{ width: 20, height: 20 }} />
                    </CustomTooltip>
                  </div>
                )}
              </div>
            );
          },
        };
      }

      return {
        title: item.fieldCaption,
        dataIndex: item.fieldName,
        key: item.fieldName,
      };
    },
  );

  const handlePaginationChange = (page: number) => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (value: string) => {
    setRecordPerPage(Number(value));
  };
  if (actions) {
    columns?.push({
      title: t("general.action"),
      key: "action",
      fixed: "left",
      align: "center",
      render: (_, record) => {
        return (
          <div className="flex justify-center items-center gap-3">
            {actions
              .filter((i) => i.condition === record["DocumentCheque.StateId"])
              .map((action) => {
                return (
                  <CustomTooltip key={action.MenuDesc} title={action.MenuDesc}>
                    <span
                      className={`${
                        record["DocumentCheque.StateId"] === "وصول شده" ||
                        record["DocumentCheque.StateId"] === "استرداد شده"
                          ? "cursor-default text-gray-gray8 dark:text-white "
                          : "cursor-pointer"
                      }`}
                      aria-label={action.MenuDesc}
                      onClick={() => {
                        record["DocumentCheque.StateId"] !== "وصول شده" &&
                          record["DocumentCheque.StateId"] !== "استرداد شده" &&
                          onActionClick(action, record);
                      }}
                    >
                      {typeof action.Icon === "string" ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: getColoredIcon(action.Icon, mode),
                          }}
                          style={{
                            width: "18px",
                            height: "17px",
                            opacity: `${1}`,
                          }}
                        />
                      ) : (
                        action.Icon
                      )}
                    </span>
                  </CustomTooltip>
                );
              })}
          </div>
        );
      },
    });
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        tabIndex={-1}
        className={`${
          isFullScreen ? "h-[calc(100dvh-160px)]" : "h-[calc(100dvh-265px)]"
        } pt-3 outline-none overflow-x-auto overflow-y-hidden`}
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
                {/* <CustomButton
                  type="text"
                  className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
                >
                  {t("general.addNew")}
                </CustomButton> */}
              </div>
            ),
          }}
          size="small"
          rowSelection={{
            renderCell: (_value, _record, _index, originNode) => {
              return (
                <>
                  <div className="flex justify-start items-center gap-2 w-[42px] h-9">
                    {originNode}
                  </div>
                </>
              );
            },
            type: "checkbox",
            selectedRowKeys: selectedItems as any,

            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedDetails(selectedRows as any);
              setSelectedItems(selectedRowKeys as any);
              setSelectedHeaderId(selectedRows.map((i) => i[headerKey]));
            },
            getCheckboxProps: (record) => ({
              disabled: record[rowFieldKey] === "Disabled User",
              name: record[rowFieldKey],
            }),
          }}
          pagination={false}
          rowKey={rowFieldKey}
          columns={columns}
          dataSource={processedData}
          onRow={(data, index) => ({
            className: index % 2 === 0 ? "custom-row-even" : "custom-row-odd",
          })}
        />
      </div>
      {totalCount && (
        <div className="flex justify-end items-center gap-2 text-xs">
          {totalCount && <span className="p-2 rounded">{totalCount}</span>}
          {data?.length > 0 && (
            <CustomSelect
              className="!w-[92px]"
              styles={{
                popup: {
                  root: {
                    width: "fit-content",
                  },
                },
              }}
              defaultValue={recordPerPage}
              style={{ minWidth: "4rem" }}
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
              className=""
              prevIcon={
                <CustomButton className="m-0 p-0 rounded w-fit">
                  <RightChevron />
                </CustomButton>
              }
              nextIcon={
                <CustomButton className="m-0 p-0 w-fit">
                  <LeftChevron />
                </CustomButton>
              }
              current={pageNumber}
              jumpNextIcon={<span>...</span>}
              jumpPrevIcon={<span>...</span>}
              pageSize={recordPerPage}
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
};
