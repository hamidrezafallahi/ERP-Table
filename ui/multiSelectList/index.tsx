import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Pagination, CustomButton, InputText, LeftChevron, RightChevron } from '../primitives';
import {
  useDirection,
  useHostDependOn,
  useLocale,
  useRemoteQuery,
  useTranslations,
} from '../host';

import { UITableController } from '../../infrastructure/ui/UITableController';
import { IMultiSelectConfig } from '../type';
import { MultiSelectListBody } from './body';
import { MultiSelectListHeader } from './header';

function asRowId(value: unknown): string | number | undefined {
  return typeof value === 'string' || typeof value === 'number'
    ? value
    : undefined;
}

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
  const direction = useDirection();
  const t = useTranslations();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageRecordCount, setPageRecordCount] = useState(8);
  const [selectedRows, setSelectedRows] = useState<
    Map<string | number, Record<string, unknown>>
  >(new Map());
  const [searchInput, setSearchInput] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const { endpoint, repoViewId, dependOn, ...bodyRequest } = dynamicValue;
  const { dependencyBody, isReady } = useHostDependOn(dependOn, {
    enabled: Boolean(multiSelectConfig.dependOnFromHost),
  });
  const body = {
    ...bodyRequest,
    ...dependencyBody,
    PagingInfo: {
      PageRecordCount: pageRecordCount,
      PageNumber: pageNumber,
    },
    FullSearchPhrase: quickSearch,
    RepoViewId: repoViewId,
  };
  const existBody = Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== null),
  );
  const { data } = useRemoteQuery<Record<string, unknown>[]>({
    url: endpoint,
    body: existBody,
    skip: !isReady,
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

  const toggleRow = (row: Record<string, unknown>) => {
    const id = asRowId(row[fieldKey]);
    if (id === undefined) return;
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
    const allSelected = rows.every((r: Record<string, unknown>) => {
      const id = asRowId(r[fieldKey]);
      return id !== undefined && selectedRows.has(id);
    });

    setSelectedRows((prev) => {
      const newMap = new Map(prev);

      if (allSelected) {
        rows.forEach((r: Record<string, unknown>) => {
          const id = asRowId(r[fieldKey]);
          if (id !== undefined) newMap.delete(id);
        });
      } else {
        rows.forEach((r: Record<string, unknown>) => {
          const id = asRowId(r[fieldKey]);
          if (id !== undefined) newMap.set(id, r);
        });
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

  const handlePageSizeChange = (_page: number, size: number) => {
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
          onChange={(e: { target: { value: string } }) => setSearchInput(e.target.value)}
          placeholder={t('general.search')}
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
          {t('general.add')}
        </CustomButton>

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
