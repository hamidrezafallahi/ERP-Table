import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { CustomModal } from "@components/atoms/defaultElements";
import {
  FilterIcon,
  SortAscending,
  Undo,
} from "@components/atoms/iconComponents";
import AdvancedSort from "@components/molecules/advancedSort";
import Filter from "@components/molecules/filter";
import { LocalQuickSearch } from "@components/molecules/localQuickSearch";
import Sort from "@components/molecules/sort";
import { useAppSelector } from "@redux/index";

import AdvancedFilter from "@components/molecules/advancedFilter";
import type { IProps } from "./type";
import { useFiltersAndSorts } from "./useFiltersAndSorts";

export const ActionGridToolbar = ({
  filterInfo,
  setFilterInfo,
  setOrderInfo,
  setPageNumber,
  quickSearch,
  setQuickSearch,
  rowFieldKey,
}: IProps) => {
  const t = useTranslations();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  const {
    filterFields,
    sortFields,
    applySorts,
    applyFilters,
    onResetFilters,
    onResetSortOrder,
    state,
    dispatchState,
    onReload,
  } = useFiltersAndSorts({
    filterInfo,
    setFilterInfo,
    setOrderInfo,
    setPageNumber,
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

  const filterCount = filterInfo?.length;
  return (
    <>
      <div className="flex justify-between gap-2 py-2 border-b border-b-gray-300">
        <div
          className="w-full"
          // className={`transition-all rounded duration-500 ${
          //   !match && !isSearchFocused
          //     ? "max-w-[36px]"
          //     : "w-full"
          // }`}
        >
          <LocalQuickSearch
            quickSearch={quickSearch}
            setQuickSearch={setQuickSearch}
            setPageNumber={setPageNumber}
          />
        </div>
        <div className={`flex gap-2 `}>
          <div
            className={`${
              match ? "min-w-[140px]" : "min-w-[36px]"
            } flex justify-between items-center gap-2 bg-gray-gray3 dark:bg-gray-gray10 rounded w-full  lg:min-w-max`}
          >
            <Sort
              openSortModal={openSortModal}
              onResetSortOrder={onResetSortOrder}
              data={sortFields}
              viewData={null}
              rowFieldKey={rowFieldKey}
            />
          </div>

          <div
            className={` dark:bg-gray-gray8 dark:text-gray-gray2 ${
              match
                ? "min-w-[96px] bg-gray-gray6"
                : "min-w-[36px] bg-gray-gray3"
            } flex gap-2 items-center  rounded text-gray-gray10  overflow-hidden `}
          >
            <Filter
              openFilterModal={openFilterModal}
              onResetFilters={onResetFilters}
              filterCount={filterCount}
            />
          </div>
          {!match && (
            <>
              <div
                className="flex bg-gray-gray3 dark:bg-gray-gray10 p-[6px] rounded h-full"
                onClick={onReload}
              >
                <Undo
                  config={{
                    width: 24,
                    height: 24,
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
            viewData={null}
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
            // filterInfo={filterInfo}
            defaultFilters={null}
          />
        }
      />
    </>
  );
};
