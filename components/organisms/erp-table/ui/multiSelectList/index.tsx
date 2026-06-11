import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Pagination } from 'antd';
import { useLocale } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  LeftChevron,
  RightChevron,
} from '@components/atoms/iconComponents';
import { useGetData } from '@services/base';

import { UITableController } from '../../infrastructure/ui/UITableController';
import { IMultiSelectConfig } from '../type';
import { MultiSelectListBody } from './body';
import { MultiSelectListHeader } from './header';

interface Props {
  controller: UITableController;
  multiSelectConfig: IMultiSelectConfig;
  handleCloseModal: () => void;
}

export default function MultiselectList({
  multiSelectConfig,
  controller,
  handleCloseModal,
}: Props) {
  const { dynamicValue, fieldKey, detailFieldKey, onAdd, ListConfig } =
    multiSelectConfig;
  const locale = useLocale();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageRecordCount, setPageRecordCount] = useState(8);
  const [selectedRows, setSelectedRows] = useState<Map<any, any>>(new Map());
  const [searchInput, setSearchInput] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const { endpoint, repoViewId, dependOn, ...bodyRequest } = dynamicValue;
  const body = {
    ...bodyRequest,
    ...(dependOn ? { [dependOn.fieldName]: dependOn.value } : {}),
    PagingInfo: {
      PageRecordCount: pageRecordCount,
      PageNumber: pageNumber,
    },
    FullSearchPhrase: quickSearch,
    RepoViewId: repoViewId,
  };
  const existBody = Object.fromEntries(
    Object.entries(body).filter(([_, value]) => value !== null),
  );
  const { data } = useGetData<any, null>({
    url: endpoint,
    body: existBody,
    skip: dependOn ? !dependOn.value : false,
  });
  // const processedData = useProcessedData({
  //   data: data?.Data,
  //   columnsConfig: ListConfig,
  //   locale,
  // });
  // console.log(processedData);
  const rows = useMemo(() => {
    return data?.Data ?? [];
  }, [data]);

  const toggleRow = (row: any) => {
    const id = row[fieldKey];
    setSelectedRows((prev) => {
      const newMap = new Map(prev);

      if (newMap.has(id)) {
        newMap.delete(id);
      } else {
        newMap.set(id, row);
      }

      return newMap;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = rows.every((r) => selectedRows.has(r[fieldKey]));

    setSelectedRows((prev) => {
      const newMap = new Map(prev);

      if (allSelected) {
        rows.forEach((r) => newMap.delete(r[fieldKey]));
      } else {
        rows.forEach((r) => newMap.set(r[fieldKey], r));
      }

      return newMap;
    });
  };

  const handleAdd = () => {
    const selected = Array.from(selectedRows.values());
    const rows = selected.map((row) =>
      Object.entries(row).map(([key, value]) => {
        const config = multiSelectConfig.ListConfig.find(
          (cfg) => cfg.fieldName === key,
        );
        return {
          key,
          value: config?.returnValue ? config.returnValue(row, key) : value,
          display: config?.returnDisplayValue
            ? config.returnDisplayValue(row, key)
            : value,
        };
      }),
    );
    controller.dispatch({ type: "ADD_NEW_ROWS", rows, detailFieldKey });
    onAdd?.(selected);
    handleCloseModal();
  };

  const handlePagination = (page: number) => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (_: any, size: number) => {
    setPageRecordCount(size);
    setPageNumber(1);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setQuickSearch(searchInput);
      setPageNumber(1);
    }, 808);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);
  return (
    <div className="flex flex-col justify-between gap-2 p-2 border !h-full">
      <div className="flex flex-col gap-2">
        <InputText
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="جستجو..."
          className=" "
        />
        <table className="w-full border-collapse">
          <MultiSelectListHeader
            ListConfig={ListConfig}
            fieldKey={fieldKey}
            rows={rows}
            selectedRows={selectedRows}
            onToggleAll={toggleSelectAll}
          />

          <MultiSelectListBody
            rows={rows}
            fieldKey={fieldKey}
            ListConfig={ListConfig}
            selectedRows={selectedRows}
            onToggleRow={toggleRow}
          />
        </table>
      </div>

      <div className="flex justify-between items-center">
        <CustomButton
          type="text"
          className="bg-main-black dark:bg-main-white text-gray-gray3 dark:text-gray-gray7"
          onClick={handleAdd}
        >
          افزودن
        </CustomButton>

        <Pagination
          prevIcon={
            <CustomButton className="m-0 p-0 rounded w-fit">
              {locale === "fa" ? <RightChevron /> : <LeftChevron />}
            </CustomButton>
          }
          nextIcon={
            <CustomButton className="m-0 p-0 w-fit">
              {locale === "fa" ? <LeftChevron /> : <RightChevron />}
            </CustomButton>
          }
          current={pageNumber}
          pageSize={pageRecordCount}
          total={data?.TotalCount ?? 0}
          onShowSizeChange={handlePageSizeChange}
          onChange={handlePagination}
          // hideOnSinglePage
          showTitle={false}
          className={`
  [&_.ant-pagination-item-active:hover]:!bg-main-black 
  [&_.ant-pagination-item-active:hover]:!border-main-black 
  [&_.ant-pagination-item-active]:!border-main-black 
  [&_.ant-pagination-next_.ant-btn:hover]:!border-main-black 
  [&_.ant-pagination-prev_.ant-btn:hover]:!border-main-black 
  [&_.ant-pagination-item-active_a:hover]:!text-main-white 
  [&_.ant-pagination-item-active_a]:!text-main-black
`}
        />
      </div>
    </div>
  );
}
