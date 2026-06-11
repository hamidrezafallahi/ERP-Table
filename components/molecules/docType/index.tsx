import './customStyle.css';

import {
  useEffect,
  useState,
} from 'react';

import {
  Dropdown,
  Skeleton,
  Table,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { DownChevron } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import { setViewData } from '@slice/pages';
import type { ISelectOption } from '@type/elementType';

function DocType() {
  const { direction } = useAppSelector(
    (state) => ({
      direction: state.withPersist.config.direction,
    }),
    shallowEqual,
  );
  const { FilterTypeIds } = useAppSelector(
    (state) => ({
      FilterTypeIds: state.withPersist.pages?.find((item) => item.isActive)
        ?.viewData?.FilterTypeIds,
    }),
    shallowEqual,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>();
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  const { data, isFetching } = useGetData<ISelectOption[], null>({
    url: "/api/acc/select/VoucherTypeCategoryReport",
    body: {},
  });
  const handleCloseDropdown = () => {
    setOpen(!open);
  };
  const items = [
    {
      key: "test",
      label: (
        <>
          <CustomTable
            setOpen={setOpen}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            data={data}
          />
        </>
      ),
    },
  ];
  useEffect(() => {
    setSelectedRowKeys(FilterTypeIds);
  }, [FilterTypeIds]);
  return (
    <div>
      {isFetching ? (
        <div className="rounded-lg w-full overflow-hidden">
          <Skeleton.Input active={true} />
        </div>
      ) : (
        <Dropdown
          menu={{ items }}
          trigger={["click"]}
          open={open}
          placement={direction == "rtl" ? "bottomRight" : "bottomLeft"}
          overlayClassName="[&>ul>li]:!p-1 [&>ul>li]:hover:!bg-main-white"
          className="h-9"
        >
          <CustomButton
            type="text"
            className="flex justify-end gap-2 bg-gray-gray2 m-0 p-1 border border-gray-gray5 w-full overflow-hidden text-gray-gray10"
            onClick={handleCloseDropdown}
          >
            {data?.Data?.filter((item) =>
              FilterTypeIds?.includes(item._SelectId),
            ).length > 0 ? (
              <>
                {t("report.header.selected")} (
                {
                  data?.Data?.filter((item) =>
                    FilterTypeIds?.includes(item._SelectId),
                  ).length
                }
                )
              </>
            ) : (
              <>{t("report.header.select")}</>
            )}

            <DownChevron />
          </CustomButton>
        </Dropdown>
      )}
    </div>
  );
}

export default DocType;

function CustomTable({ setOpen, selectedRowKeys, setSelectedRowKeys, data }) {
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
    }),
    shallowEqual,
  );
  const t = useTranslations();
  const dispatch = useDispatch();
  const onSelectChange = (newSelectedRowKeys: number[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const columns = [
    {
      dataIndex: "name",
      key: "name",
      render: (text: string, record) => (
        <div className="py-1 w-fit text-gray-gray9 text-center cursor-pointer">
          {text}
        </div>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const handleRefuse = () => {
    setSelectedRowKeys(activePage?.viewData?.FilterTypeIds);
    setOpen(false);
  };
  const handleAccept = () => {
    setOpen(false);
    dispatch(
      setViewData({
        ...activePage?.viewData,
        FilterTypeIds: selectedRowKeys,
      }),
    );
  };

  return (
    <div className="relative flex flex-col gap-2 w-full max-h-96">
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data?.Data?.map((item) => ({
          key: item._SelectId,
          name: item._SelectDisplay,
        }))}
        rowKey="key"
        pagination={false}
        bordered={false}
        className="[*>.ant-table-selection]:!right-2 max-h-80 overflow-y-auto"
      />
      <div className="flex justify-end gap-2 w-full">
        <CustomButton
          onClick={handleRefuse}
          className="!bg-main-white dark:bg-gray-gray10 p-4 hover:!border-black-black8 hover:!text-black-black8 dark:text-white"
        >
          {t("general.refuse")}
        </CustomButton>
        <CustomButton
          onClick={handleAccept}
          className="!bg-main-black p-4 hover:!border-main-white text-main-white hover:!text-main-white"
        >
          {t("general.accept")}
        </CustomButton>
      </div>
    </div>
  );
}
