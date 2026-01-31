import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomModal } from '@components/atoms/defaultElements';
import { FilterIcon } from '@components/atoms/iconComponents';
import AdvancedFilter from '@components/molecules/advancedFilter';
import Filter from '@components/molecules/filter';
import { useAppSelector } from '@redux/index';
import { useGetData } from '@services/base';
import { setViewData } from '@slice/pages';
import type { IColumns } from '@slice/pages/type';

interface IInnerFilter {
  InnerFilterId: number;
  Type: string;
  Url: string;
  FilterTitle: string;
}
export interface IFilterModalProps {}
function FilterModal({ ...props }: IFilterModalProps) {
  const {} = props;

  const t = useTranslations();
  const dispatch = useDispatch();
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [filterCount, setFilterCount] = useState(null);
  const [innerFilter, setInnerFilter] = useState([]);
  const [filterFields, setFilterFields] = useState([]);
  type IColumnsWithEndpoint = IColumns & {
    endpoint?: string;
  };
  const { activePage, } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
    }),
    shallowEqual
  );
  const { data: innerFilterResponse } = useGetData<IInnerFilter[], null>({
    url: `/api/acc/select/innerFilter `,
    body: {},
  });
  useEffect(() => {
    if (innerFilterResponse?.Result == "Success") {
      setInnerFilter(innerFilterResponse.Data);
    }
  }, [innerFilterResponse]);

  const handleResetFilters = () => {
    setFilterCount(null);
    dispatch(
      setViewData({
        ...activePage?.viewData,
        Filters: {
          ...activePage?.viewData?.Filters,
          FilterInfo: [],
        },
      })
    );
  };
  const applyFilters = (filters) => {
    if (filters.length > 0) {
      setFilterCount(filters.length);
      const filteredResults = [];
      const colsNames = activePage?.viewData?.Columns.map(
        (item) => item.fieldName
      );
      filters.forEach((item) => {
        if (colsNames.includes(item.field)) {
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
        })
      );
      setOpenFilterModal(false);
    }
  };
  useEffect(() => {
    if (innerFilter && activePage?.viewData?.Columns) {
      const temp = innerFilter.map((item) => ({
        fieldName: item.InnerFilterId,
        fieldCaption: item.FilterTitle,
        fieldType: item.Type,
        endpoint: item.Url,
      }));
      const combinedArray: IColumnsWithEndpoint[] =
        activePage?.viewData?.Columns.concat(temp);
      if (combinedArray.length > 0) {
        const newFilters = combinedArray.map((item, index) => ({
          key: index,
          value: item.fieldName,
          label: item.fieldCaption,
          type: item.fieldType,
          valueOption: { endpoint: item.endpoint },
        }));
        newFilters.length > 0 && setFilterFields(newFilters);
      }
    }
  }, [activePage?.viewData?.Columns, innerFilter]);

  return (
    <div className="flex flex-col gap-1 overflow-hidden">
      <div className="text-gray-gray10 dark:text-white text-xs">
        {t("report.header.moreFilters")}
      </div>
      <div
        className={`flex gap-2 items-center dark:bg-gray-gray8 dark:text-gray-gray2 ${
          filterCount > 0 ? "bg-gray-gray6" : "bg-gray-gray3"
        } rounded text-gray-gray10 min-w-[96px] h-9 overflow-hidden `}
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
          />
        }
      />
    </div>
  );
}

export default FilterModal;
