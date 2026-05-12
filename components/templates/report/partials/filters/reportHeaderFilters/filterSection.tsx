import { useState } from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomModal } from '@components/atoms/defaultElements';
import { FilterIcon } from '@components/atoms/iconComponents';
import Filter from '@components/molecules/filter';
import { useAppSelector } from '@redux/index';
import { setViewData } from '@slice/pages';

import AdvancedFilter from '../../advancedFilter';
import { IData } from '../../advancedFilter/type';
import {
  FilterSectionProps,
  ValueTypeEnum,
} from './type';

const filterFields: IData[] = [
  { label: "گزارش جامع", value: "ComprehensiveReport", type: "string" },
  { label: "شماره سند", value: "DocumentNumber", type: "string" },
  { label: "شماره ارجاع", value: "ReferenceNumber", type: "string" },
  { label: "شماره سریال", value: "SerialNumber", type: "string" },
  {
    label: "نوع سند",
    value: "DocumentType",
    type: "dynamicSelect",
    dynamicValue: {
      endpoint: "/api/acc/select/voucherType4searchBox",
    },
  },
  {
    label: "وضعیت سند",
    value: "DocumentStatus",
    type: "multiSelect",
    options: [
      { caption: "پیش نویس", value: ValueTypeEnum.Draft },
      { caption: "تنظیم شده", value: ValueTypeEnum.Prepared },
      { caption: "ابطال شده", value: ValueTypeEnum.Canceled },
      { caption: "قطعی شده", value: ValueTypeEnum.Finalized },
    ],
  },
  { label: "کد گروه", value: "GroupCode", type: "select" },
  { label: "کد کل", value: "GeneralLedgerCode", type: "select" },
  { label: "کد معین", value: "SubsidiaryCode", type: "select" },
  { label: "کد تفصیلی", value: "DetailCode", type: "select" },
  { label: "کد سطح 5", value: "Level5Code", type: "select" },
  { label: "کد سطح 6", value: "Level6Code", type: "select" },
  { label: "کد سطح 7", value: "Level7Code", type: "select" },
  { label: "کد سطح 8", value: "Level8Code", type: "select" },
  { label: "کد سطح 9", value: "Level9Code", type: "select" },
  { label: "کد سطح 10", value: "Level10Code", type: "select" },
  { label: "کد سطح 11", value: "Level11Code", type: "select" },
  { label: "کد سطح 12", value: "Level12Code", type: "select" },
  { label: "کد سطح 13", value: "Level13Code", type: "select" },
  { label: "ایجاد کننده", value: "CreatedBy", type: "select" },
  { label: "شرکت", value: "Company", type: "select" },
];

export const FilterSection = ({...props}:FilterSectionProps) => {
    const{defaultFilter}=props
  const t = useTranslations();
  const [filterCount, setFilterCount] = useState(null);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const dispatch = useDispatch();

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
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
        (item) => item.fieldName,
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
            InnerFilterId: item.field,
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
            FilterInfo: filteredResults,
          },
        }),
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
      <CustomModal
        contentClassName="min-w-[580px] h-full"
        headerName={t("general.filterData")}
        headerIcon={<FilterIcon />}
        closeModal={() => {
          setOpenFilterModal(false);
        }}
        isModalOpen={openFilterModal}
        content={
          <AdvancedFilter
            onReset={handleResetFilters}
            onApplyFilters={applyFilters}
            data={filterFields}
            defaultFilters={defaultFilter}
          />
        }
      />
    </>
  );
};