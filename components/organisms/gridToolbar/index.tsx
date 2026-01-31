import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomModal } from '@components/atoms/defaultElements';
import {
  FilterIcon,
  SortAscending,
  Undo,
} from '@components/atoms/iconComponents';
import AdvancedFilter from '@components/molecules/advancedFilter';
import AdvancedSort from '@components/molecules/advancedSort';
import Filter from '@components/molecules/filter';
import { QuickSearch } from '@components/molecules/quickSearch';
import { RangeFilter } from '@components/molecules/rangeFilter';
import Sort from '@components/molecules/sort';
import { useAppSelector } from '@redux/index';

import type { IProps } from './type';
import { useFiltersAndSorts } from './useFiltersAndSorts';

export const GridToolbar = ({
  viewData,
  config,
  rowFieldKey,
  rangeFilterKey,
}: IProps) => {
  const t = useTranslations();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const {
    filterFields,
    sortFields,
    applySorts,
    applyFilters,
    onResetFilters,
    onResetSortOrder,
    handleRefresh,
    state,
    dispatchState,
    onReload,
  } = useFiltersAndSorts({
    viewData,
    config,
  });

  const openSortModal = () => {
    dispatchState({ type: "OPEN_SORT_MODAL" });
  };

  const closeSortModal = () => {
    dispatchState({ type: "CLOSE_SORT_MODAL" });
  };

  const openFilterModal = () => {
    dispatchState({ type: "OPEN_FILTER_MODAL" });
  };

  const closeFilterModal = () => {
    dispatchState({ type: "CLOSE_FILTER_MODAL" });
  };

  const showOnlyBookmark = viewData?.Filters?.ShowOnlyBookmarked ? 1 : 0;
  const tagIdsFilter = viewData?.Filters?.TagIdsFilter?.length > 0 ? 1 : 0;
  const filterCount =
    viewData?.Filters?.FilterInfo?.length + showOnlyBookmark + tagIdsFilter;
  return (
    <>
      <div className="flex justify-end gap-2">
        {match && (
          <div className="w-full">
            <QuickSearch
              onFocus={() => setIsSearchFocused(true)}
              isActive={null}
            />
          </div>
        )}
        <div className={`flex gap-2 `}>
          {sortFields?.length > 0 && (
            <div
              className={`${
                match ? "min-w-[140px]" : "min-w-[36px]"
              } flex justify-between items-center gap-2 bg-gray-gray3 dark:bg-gray-gray95 rounded w-full  lg:min-w-max`}
            >
              <Sort
                openSortModal={openSortModal}
                onResetSortOrder={onResetSortOrder}
                data={sortFields}
                viewData={viewData}
                rowFieldKey={rowFieldKey}
              />
            </div>
          )}

          {!rangeFilterKey && filterFields?.length > 0 && (
            <div
              className={`${
                match
                  ? "min-w-[96px] bg-gray-gray6"
                  : "min-w-[36px] bg-gray-gray3"
              } flex gap-2 items-center  rounded text-gray-gray10  overflow-hidden  dark:bg-gray-gray8 dark:text-gray-gray2 `}
            >
              <Filter
                openFilterModal={openFilterModal}
                onResetFilters={onResetFilters}
                filterCount={filterCount}
              />
            </div>
          )}
          {rangeFilterKey && (
            <RangeFilter
              onResetFilters={onResetFilters}
              rangeFilterKey={rangeFilterKey}
            />
          )}

          {!match && (
            <>
              <div
                className="flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded h-full"
                onClick={onReload}
              >
                <Undo
                  config={{
                    width: 22,
                    height: 22,
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <CustomModal
        contentClassName={`${match ? "w-[520px] h-fit" : ""}`}
        headerIcon={<SortAscending />}
        headerName={t("general.sortData")}
        closeModal={closeSortModal}
        isModalOpen={state.isSortModalOpen}
        content={
          <AdvancedSort
            data={sortFields}
            onReset={onResetSortOrder}
            onApplySort={applySorts}
            viewData={viewData}
          />
        }
      />
      <CustomModal
        contentClassName={`${match ? "w-[520px]" : ""}`}
        headerName={t("general.filterData")}
        headerIcon={<FilterIcon />}
        closeModal={closeFilterModal}
        isModalOpen={state.isFilterModalOpen}
        content={
          <AdvancedFilter
            data={filterFields}
            onReset={onResetFilters}
            onApplyFilters={applyFilters}
            viewData={viewData}
          />
        }
      />
    </>
  );
};
