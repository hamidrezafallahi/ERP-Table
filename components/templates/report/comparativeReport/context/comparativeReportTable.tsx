import React from 'react';

import {
  Pagination,
  Table,
} from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  LeftChevron,
  NoData,
  RightChevron,
  SpinIcon,
} from '@components/atoms/iconComponents';
import { useMediaQuery } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import MiniChartComponent from './miniChartComponent';
import { OfficeReportTableProps } from './type';

export default function ComparativeReportTable({ ...rest }: OfficeReportTableProps) {
  const { data, isLoading, PageRecordCount, PageNumber,handlePaginationChange,handlePageSizeChange } = rest;
  const t = useTranslations();
  const { match: minDesktop } = useMediaQuery("XLUP");
  const { match: maxDesktop } = useMediaQuery("XXLUP");

  const { fullScreen } = useAppSelector(
    (state) => ({
      fullScreen: state.withPersist.config.fullScreen,
    }),
    shallowEqual,
  );
  const renderEmptyText = () => (
    <div className="flex flex-col justify-center items-center gap-8 m-12 h-full">
      <NoData />
      <span className="text-[18px] text-gray-gray9">{t("general.noData")}</span>
    </div>
  );
  const limitDesktop = minDesktop && !maxDesktop;
  const tableColumns = (data?.columns || []).map((col) => {
  if (col.dataIndex === "Periods") {
    return {
      ...col,
      render: (_, record) => (
        <div style={{ width: 100, height: 40 }}>
          <MiniChartComponent record={record} />
        </div>
      ),
    };
  }

  return col;
});
  return (
    <>
      <div
        className={` h-[calc(100dvh-500px)] w-full 
          ${
            fullScreen
              ? "lg:w-[calc(100dvw-300px)]"
              : limitDesktop
                ? "lg:w-[calc(100dvw-500px)]"
                : "lg:w-[calc(100dvw-600px)]"
          }  
        overflow-y-auto transition-all duration-500 `}
      >
        {!isLoading ? (
          <Table
            className={` overflow-auto  `}
            tableLayout="auto"
            locale={{ emptyText: renderEmptyText() }}
            size="large"
            pagination={false}
            // rowKey={(record) => record.VoucherHeaderId}
            columns={tableColumns}
            dataSource={data?.Data}
            onRow={(record, index) => ({
              className: `
    ${index % 2 === 0 ? "!bg-main-white" : "!bg-gray-gray3"}
    h-10
  `,
            })}
            scroll={{ x: "max-content" }}
          />
        ) : (
          <div className="absolute inset-0 flex justify-center items-center">
            <SpinIcon config={{ width: 70, height: 70 }} />
          </div>
        )}
      </div>
      <div
        className={`flex flex-col justify-end items-end gap-2 text-xs transition-all duration-500   `}
      >
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
          
          current={PageNumber}
          jumpNextIcon={<span>...</span>}
          jumpPrevIcon={<span>...</span>}
          pageSize={PageRecordCount}
          total={data?.TotalCount}
          showSizeChanger={false}
          onChange={handlePaginationChange}
          onShowSizeChange={handlePageSizeChange}
          showTitle={false}
        />
      </div>
    </>
  );
}
