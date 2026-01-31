import {
  Spin,
  Table,
  TableColumnsType,
} from 'antd';
import { useTranslations } from 'next-intl';

import { CustomTooltip } from '@components/atoms/defaultElements';
import {
  CloseSm,
  NoData,
  SpinIcon,
} from '@components/atoms/iconComponents';
import RenderStatus from '@components/molecules/renderStatus';
import {
  useDarkMode,
  useProcessedData,
} from '@hooks/custom';
import type { IColumnConfig } from '@services/generalType/type';
import type { IToolbarMenu } from '@type/toolbar';
import { getColoredIcon } from '@utils/core';

export const AccountSettingTable = ({
  data,
  locale,
  rowIdField,
  columnsConfig,
  actions,
  handleAction,
  isLoading,
}) => {
  const { mode = "light" } = useDarkMode();

  const t = useTranslations();

  const processedData = useProcessedData({
    data,
    columnsConfig,
    locale,
  });
  const columns: TableColumnsType<any> = columnsConfig?.map(
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
                  id={record[rowIdField]}
                  pendingStatusId={record.PendingStatusId}
                  pendingMessage={record.PendingMessage}
                  isMobile={false}
                />
              </div>
            );
          },
        };
      }
      if (item.fieldType === "boolean") {
        return {
          title: item.fieldCaption,
          key: item.fieldName,
          render: (text: any, record: any) => {
            return (
              <div className="flex justify-center items-center gap-2">
                {record[item.fieldName] ? <CloseSm /> : ""}
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
  if (actions) {
    columns?.push({
      title: t("general.action"),
      key: "action",
      fixed: "left",
      align: "center",
      render: (_, record) => {
        return (
          <div className="flex justify-center items-center gap-3">
            {actions.map((action: IToolbarMenu) => {
              return (
                <CustomTooltip key={action.MenuDesc} title={action.MenuDesc}>
                  <span
                    className="cursor-pointer"
                    aria-label={action.MenuDesc}
                    onClick={() =>
                      handleAction(
                        action,
                        record[rowIdField],
                        record["PendingStatusId"]
                      )
                    }
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getColoredIcon(action.Icon, mode),
                      }}
                      style={{ width: "18px", height: "17px" }}
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
    <Table
      loading={{
        spinning: isLoading,
        indicator: <Spin size="large" indicator={<SpinIcon />} />,
      }}
      tableLayout="auto"
      locale={{
        emptyText: (
          <div className="flex flex-col justify-center items-center gap-4 m-8">
            <NoData
              config={{
                width: 80,
                height: 80,
              }}
            />
            <span className="text-gray-gray9 dark:text-white text-sm">
              {t("general.accountSettingNoData")}
            </span>
          </div>
        ),
      }}
      // rowSelection={{
      //   renderCell: (_value, _record, _index, originNode) => (
      //     <>
      //       <div className="flex justify-start items-center gap-x-1 ps-1">
      //         {originNode}
      //         {_record.HasBookMark && <BookMarkIconFilled />}
      //       </div>
      //     </>
      //   ),
      //   selectedRowKeys: items,
      //   onChange: (selectedRowKeys, selectedRows) => {
      //     setItems({ items: selectedRowKeys as number[] });
      //   },
      //   getCheckboxProps: (record) => ({
      //     disabled: record[rowIdField] === "Disabled User",
      //     name: record[rowIdField],
      //   }),
      // }}
      size="small"
      pagination={false}
      rowKey={rowIdField}
      columns={columns}
      dataSource={processedData}
      onRow={(data, index) => ({
        className: index % 2 === 0 ? "custom-row-even" : "custom-row-odd",
      })}
    />
  );
};
