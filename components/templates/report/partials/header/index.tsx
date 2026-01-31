import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import RangeFilter from '@components/organisms/rangeFilter';
import { useAppSelector } from '@redux/index';
import { setViewData } from '@slice/pages';

import DocType from './docType';
import FilterModal from './filterModal';
import SortModal from './sortModal';

function Header({ active = false }) {
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
    }),
    shallowEqual
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
      })
    );
  };
  return (
    <div className="flex items-end gap-2 w-full">
      {active && <DocType />}
      <RangeFilter />
      <FilterModal />
      <SortModal
        label={t("report.header.moreSorts")}
        sortOptions={sortOptions}
        handleChangeSort={handleChangeSort}
      />
    </div>
  );
}

export default Header;
