import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setViewData } from '@slice/pages';
import { IFilterData } from '@type/filterTypes';

import ReportHeaderFilters from '../filters/reportHeaderFilters';
import DocType from './docType';
import { filterFields } from './filterConfig';
import SortModal from './sortModal';

function Header({ active = false }) {
  const [innerFilter, setInnerFilter] = useState<IFilterData[]>(filterFields);

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
    }),
    shallowEqual,
  );
  const dispatch = useDispatch();
  const t = useTranslations();
  const sortOptions = activePage?.viewData?.Columns?.map((item) => ({
    value: item.fieldName,
    label: item.fieldCaption,
  }));
  const handleChangeSort = (sort) => {
    dispatch(
      setViewData({
        ...activePage?.viewData,
        OrderInfo: sort,
      }),
    );
  };
  useEffect(() => {
    if (activePage?.viewData?.Columns) {
      const newItems: IFilterData[] = activePage?.viewData?.Columns.map((item) => ({
        label: item.fieldCaption,
        value: item.fieldName,
        type: "string",
      }));
      setInnerFilter((prev) => {
        const combined = [...prev, ...newItems];
        const uniqueItems = Array.from(
          new Map(combined.map((item) => [item.label, item])).values(),
        );
        return uniqueItems;
      });
    }
  }, [activePage?.viewData?.Columns]);
  return (
    <div className="flex items-end gap-2 w-full [&>*:nth-child(2)]:translate-y-[-4px]">
      {active && <DocType />}
      <ReportHeaderFilters
        filterFields={innerFilter}
        defaultRange={{
          from: "2026-03-21T00:00:00.000+03:30",
          to: "2027-03-20T23:59:59.999+03:30",
        }}
        // defaultFilters={[
        //   {
        //     ColName: "VoucherTypeIds",
        //     FilterType: filterTypeNumberEnum.Equal,
        //     Value: [5, 4, 3, 2, 1],
        //   },
        //   {
        //     ColName: "docStatusIds",
        //     FilterType: filterTypeNumberEnum.Equal,
        //     Value: [1, 2],
        //   },
        // ]}
      />
      <SortModal
        label={t("report.header.moreSorts")}
        sortOptions={sortOptions}
        handleChangeSort={handleChangeSort}
      />
    </div>
  );
}

export default Header;
