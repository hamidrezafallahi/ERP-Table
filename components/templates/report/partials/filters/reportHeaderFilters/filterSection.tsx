import { useState } from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomModal } from '@components/atoms/defaultElements';
import { FilterIcon } from '@components/atoms/iconComponents';
import Filter from '@components/molecules/filter';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setViewData } from '@slice/pages';

import AdvancedFilter from '../advancedFilter';
import { FilterSectionProps } from './type';

export const FilterSection = ({...props}:FilterSectionProps) => {
    const{defaultFilters,filterFields}=props
  const t = useTranslations();
  const [filterCount, setFilterCount] = useState(defaultFilters?.length);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const dispatch = useDispatch();

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
    }),
    shallowEqual,
  );
  const handleResetFilters = () => {
    setFilterCount(null);
    dispatch(
      setViewData({
        ...activePage?.viewData,
        Filters: {
          ...activePage?.viewData?.Filters,
          FilterInfo: [],
        },
      }),
    );
  };

  const applyFilters = (filters) => {
    if (filters.length > 0) {
      setFilterCount(filters.length);
      const filteredResults = [];
      const colsNames = activePage?.viewData?.Columns?.map(
        (item) => item.fieldName
      );
      filters.forEach((item) => {
        if (colsNames?.includes(item.field)) {
          filteredResults.push({
            ColName: item.field,
            Value: item.value,
            FilterType: item.type,
          });
        } else {
          filteredResults.push({
            ColName: item.field,
            Value: item.value,
            FilterType: item.type,
          });
        }
      });
      dispatch(
        setViewData({
          ...activePage?.viewData,
          Filters: {
            ...activePage?.viewData?.Filters,
            FilterInfo: filteredResults
          }
        })
      );
      setOpenFilterModal(false);
    }
  };
 
   return (
    <>
      <div
        className={`flex gap-2 items-center dark:bg-gray-gray8 dark:text-gray-gray2 ${
          filterCount > 0 ? "bg-gray-gray6" : "bg-gray-gray3"
        } rounded text-gray-gray10 min-w-[96px] w-24 h-9 overflow-hidden `}
      >
        <Filter
          openFilterModal={() => {
            setOpenFilterModal(true);
          }}
          onResetFilters={handleResetFilters}
          filterCount={filterCount}
        />
      </div>
      {<CustomModal
        contentClassName="  h-full"
        headerName={t("general.filterData")}
        headerIcon={<FilterIcon />}
        width={600}
        closeModal={() => {
          setOpenFilterModal(false);
        }}
        isModalOpen={openFilterModal}
        content={
          <AdvancedFilter
            onReset={handleResetFilters}
            onApplyFilters={applyFilters}
            data={filterFields}
            defaultFilters={defaultFilters}

          />
        }
      />}
    </>
  );
};