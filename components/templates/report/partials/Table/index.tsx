import './customStyle.css';

import {
  Pagination,
  Table,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  DownChevron,
  LeftChevron,
  NoData,
  RightChevron,
  SpinIcon,
} from '@components/atoms/iconComponents';
import { useMediaQuery } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  setSelectedRows,
  setViewData,
} from '@slice/pages';
import { IStep } from '@slice/pages/type';

import Summary from './summary';
import type { IProps } from './type';

export default function MainTable({ ...rest }: IProps) {
  const {
    active = false,
    data,
    isLoading,
    PageRecordCount,
    PageNumber,
    handleRowClick,
  } = rest;
  const t = useTranslations();
  const dispatch = useDispatch();
  const { activePage, fullScreen } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
      fullScreen: state.withPersist.config.fullScreen,
    }),
    shallowEqual
  );
      const { match: minDesktop } = useMediaQuery("XLUP");
      const { match: maxDesktop } = useMediaQuery("XXLUP");
  const handlePaginationChange = (page: number) => {
    dispatch(
      setViewData({
        ...activePage?.viewData,
        PageNumber: page,
      })
    );
  };
  const handleSelectRows = (selectedRows, Level) => {
    dispatch(
      setSelectedRows({ selectedRows: { Level: Level, Items: selectedRows } })
    );
  };

  const renderEmptyText = () => (
    <div className="flex flex-col justify-center items-center gap-8 m-12 h-full">
      <NoData />
      <span className="text-[18px] text-gray-gray9">{t("general.noData")}</span>
    </div>
  );
  const handleFetchChildren = (record) => {
    dispatch(
      setViewData({
        ...activePage?.viewData,
        child: { Level: record.Level, Id: record.AccId, Nested: record.Nested },
      })
    );
  };
  const antTableWrapper =
    document.getElementsByClassName("ant-table-wrapper")[0];
  const handleScroll = (e) => {
    const summary = document.getElementsByClassName("summary")[0];
    if (summary) {
      summary.scrollLeft = e.target.scrollLeft;
    }
  };
  antTableWrapper?.addEventListener("scroll", handleScroll);
  const selectedRows: IStep[] = activePage?.viewData?.selectedItems;
  const limitDesktop = minDesktop && !maxDesktop
  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className={` h-[calc(100dvh-370px)] w-full 
          ${active ? 
            fullScreen ? "lg:w-[calc(100dvw-200px)]":limitDesktop?"lg:w-[calc(100dvw-400px)]": "lg:w-[calc(100dvw-450px)]":
            fullScreen ? "lg:w-[calc(100dvw-70px)]":limitDesktop?"lg:w-[calc(100dvw-270px)]": "lg:w-[calc(100dvw-320px)]"
        }  
        overflow-y-auto transition-all duration-500 `}
      >
        {!isLoading ? (
          <Table
            className={` overflow-auto [&>.ant-table-wrapper .ant-table-selection]:right-2 transition-all duration-500 report-table `}
            tableLayout="auto"
            locale={{ emptyText: renderEmptyText() }}
            size="large"
            rowSelection={{
              renderCell: (_value, _record, _index, originNode) => {
                 return (
                  <div className={`flex justify-start items-center ps-1 gap-2 min-w-14 h-10 ${_index % 2 === 0 ? "!bg-main-white " : "!bg-gray-gray3 "}`}>
                    {originNode}
                    {!activePage?.viewData?.TreeView && (
                      <CustomButton
                        type="text"
                         onClick={() => {
                          handleRowClick(_record);
                        }}
                        className={`m-0 p-0  `}
                      >
                        <DownChevron />
                      </CustomButton>
                    )}
                  </div>
                );
              },
              type: "checkbox",
              fixed: "right",
              onCell: (record) => {
                return {
                  style: {
                    position: "absolute",
                    right: "0",
                  },
                };
              },
              selectedRowKeys: selectedRows
                ?.filter((item) => item.Level === activePage?.viewData?.Level)
                .flatMap((item) => item.Items.map((item) => item.AccId)),
              onChange: (selectedRowKeys, selectedRows) => {
                handleSelectRows(selectedRows, activePage?.viewData?.Level);
              },
            }}
            expandable={{
              onExpand: (expanded, record) => {
                if (expanded) {
                  handleFetchChildren(record);
                }
              },
            }}
            pagination={false}
            columns={data?.columns}
            dataSource={data?.Data}
            onRow={(record, index) => ({
              className:
                index % 2 === 0 ? "!bg-main-white " : "!bg-gray-gray3 ",
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
        className={`flex flex-col justify-end items-end gap-2 text-xs transition-all duration-500  ${active ? 
            fullScreen ? "lg:w-[calc(100dvw-200px)]":limitDesktop?"lg:w-[calc(100dvw-400px)]": "lg:w-[calc(100dvw-450px)]":
            fullScreen ? "lg:w-[calc(100dvw-70px)]":limitDesktop?"lg:w-[calc(100dvw-270px)]": "lg:w-[calc(100dvw-320px)]"
        }  `}
      >
        <Summary active={active} />
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
          showTitle={false}
        />
      </div>
    </div>
  );
}
