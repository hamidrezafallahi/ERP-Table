import { Spin, Table, TableColumnsType } from "antd";
import { useTranslations } from "next-intl";

import { CustomSwitch, CustomTooltip } from "@components/atoms/defaultElements";
import { CloseSm, NoData, SpinIcon } from "@components/atoms/iconComponents";
import RenderStatus from "@components/molecules/renderStatus";
import { useDarkMode, useProcessedData } from "@hooks/custom";
import type { IColumnConfig } from "@services/generalType/type";
import { columnsSorting, getColoredIcon, renderBadge } from "@utils/core";

import type { IProps } from "./type";

export const TableDynamicModal = <T,>({
  data,
  locale,
  fieldKey,
  columnsList,
  actions,
  handleAction,
  isLoading,
  scroll = null,
  activation = null,
}: IProps<T>) => {
  const { mode = "light" } = useDarkMode();

  const t = useTranslations();
  const columnsConfig = columnsList && columnsList?.column;

  const processedData = useProcessedData({
    data,
    columnsConfig,
    locale,
  });

  const hasBadge = columnsConfig?.find((item) => item.fieldType === "badge");

  const correctColumns = columnsConfig?.filter(
    (column) => column?.fieldType !== "badge",
  );

  const sortedColumns = columnsSorting(correctColumns);

  const columns: TableColumnsType<any> = sortedColumns?.map(
    (item: IColumnConfig, index: number) => {
      const hasPendingStatus = processedData?.find(
        (i) => i.PendingStatusId !== undefined,
      );
      const isFirstColumn = index === 0;

      if (hasPendingStatus && isFirstColumn) {
        return {
          title: item.fieldCaption,
          key: item.fieldName,
          align: typeof item.fieldName === "string" ? "right" : "left",
          render: (text: any, record: any) => {
            const badgeValue =
              hasBadge &&
              hasBadge?.conditionalConfig?.find(
                (el) => el.value === item[hasBadge.fieldName],
              );
            return (
              <div
                className={`flex flex-wrap items-center gap-2 w-fit max-w-full `}
              >
                {record[item.fieldName] && (
                  <span>{record[item.fieldName]}</span>
                )}

                <RenderStatus
                  id={record[fieldKey]}
                  pendingStatusId={record.PendingStatusId}
                  pendingMessage={record.PendingMessage}
                  isMobile={false}
                />

                {!!hasBadge &&
                  badgeValue &&
                  renderBadge({
                    type: hasBadge?.badgeType,
                    title: badgeValue,
                  })}
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
      if (item.fieldType === "boolean") {
        return {
          title: item.fieldCaption,
          key: item.fieldName,
          align: typeof item.fieldName === "string" ? "right" : "left",
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
        align: typeof item.fieldName === "string" ? "right" : "left",
        width: item.width,
        render: (text: any, record: any) => {
          return <div className="my-2">{record?.[item.fieldName]}</div>;
        },
      };
    },
  );

  if (actions?.length > 0) {
    columns?.push({
      title: <div className="!w-full">{t("general.action")}</div>,
      key: "action",
      fixed: "left",
      align: "center",
      render: (_, record) => {
        return (
          <div className="flex justify-center items-center gap-3">
            {actions.map((action) => {
              return (
                <CustomTooltip key={action.MenuDesc} title={action.MenuDesc}>
                  <span
                    className="cursor-pointer"
                    aria-label={action.MenuDesc}
                    onClick={() =>
                      handleAction(
                        action,
                        record[fieldKey],
                        record["PendingStatusId"],
                        record,
                      )
                    }
                  >
                    {typeof action.Icon === "string" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: getColoredIcon(action.Icon, mode),
                        }}
                        style={{ width: "18px", height: "17px" }}
                      />
                    ) : (
                      action.Icon
                    )}
                  </span>
                </CustomTooltip>
              );
            })}
            {activation?.url && (
              <CustomTooltip
                title={
                  record.Inactive ? t("general.notActive") : t("general.active")
                }
              >
                <CustomSwitch
                  config={{
                    fieldKey: fieldKey,
                    url: activation.url,
                    id: record[fieldKey],
                    body: activation.body,
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
    <Table
      loading={{
        spinning: isLoading,
        indicator: <Spin size="large" indicator={<SpinIcon />} />,
      }}
      scroll={scroll}
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
              {t("general.noData")}
            </span>
          </div>
        ),
      }}
      size="small"
      pagination={false}
      rowKey={fieldKey}
      columns={columns}
      dataSource={processedData}
      onRow={(data, index) => ({
        className: index % 2 === 0 ? "custom-row-even" : "custom-row-odd",
      })}
    />
  );
};
