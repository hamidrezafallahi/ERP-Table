import {
  Pagination,
  Spin,
  Table,
  TableColumnsType,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomSelect,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  LeftChevron,
  NoData,
  RightChevron,
  SpinIcon,
} from '@components/atoms/iconComponents';
import RenderStatus from '@components/molecules/renderStatus';
import {
  useDarkMode,
  useProcessedData,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import type { IColumnConfig } from '@services/generalType/type';
import { getColoredIcon } from '@utils/core';

import type { IProps } from './type';

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
}: IProps) => {
  const { mode = "light" } = useDarkMode();

  const t = useTranslations();

  const locale = useAppSelector((state) => state.withPersist.config.lang);

  const processedData = useProcessedData({
    data,
    columnsConfig,
    locale,
  });

  const columns: TableColumnsType = columnsConfig?.map(
    (item: IColumnConfig, index: number) => {
      const hasPendingStatus = processedData?.find(
        (i) => i.PendingStatusId !== undefined
      );
      const isFirstColumn = index === 0;

      if (hasPendingStatus && isFirstColumn) {
        return {
          title: item.fieldCaption,
          key: item.fieldName,
          render: (text: any, record: any) => {
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
    }
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
      <div className="hidden-show-scrollBar pt-3 h-[calc(100dvh-265px)] overflow-y-scroll">
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
                  <div className="flex justify-start items-center gap-2 w-[42px]">
                    {originNode}
                  </div>
                </>
              );
            },
            type: "checkbox",
            selectedRowKeys: selectedItems as any,

            onChange: (selectedRowKeys, selectedRows) => {
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
