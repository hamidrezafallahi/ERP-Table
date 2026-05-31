import { useEffect } from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  setPageFilters,
  setViewData,
} from '@slice/pages';

import { ReportMode } from '../../type';

function OfficeReportSidebar() {
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
    }),
    shallowEqual,
  );

  const t = useTranslations();
  const dispatch = useDispatch();

  const handleButtonClick = (reportType: ReportMode) => {
    dispatch(
      setViewData({
        ...(activePage?.viewData ?? {}),
        reportType,
      }),
    );
  };
  const reportType = activePage?.viewData?.reportType;
  useEffect(() => {
    dispatch(
      setPageFilters({
         reportType: ReportMode.bookkeeping,
      }),
    );
  }, [activePage?.pageId]);
  return (
    <div className="flex flex-col gap-3 p-3 w-full h-full overflow-y-auto">
      <CustomButton
        type="text"
        className={`w-full h-10 text-center text-xs bg-gray-gray2 dark:bg-gray-gray95  dark:text-white active:bg-gray-gray9 active:font-medium ${reportType == ReportMode.bookkeeping && "!bg-gray-gray7 !font-medium text-main-black border border-gray-gray7"}`}
        onClick={() => handleButtonClick(ReportMode.bookkeeping)}
      >
        {t("report.sidebar.bookKeeping")}
      </CustomButton>
      <CustomButton
        type="text"
        className={`w-full h-10 text-center text-xs bg-gray-gray2 dark:bg-gray-gray95  dark:text-white active:bg-gray-gray9 active:font-medium ${reportType == ReportMode.office && "!bg-gray-gray7 !font-medium text-main-black border border-gray-gray7"}`}
        onClick={() => handleButtonClick(ReportMode.office)}
      >
        {t("report.sidebar.books")}
      </CustomButton>
    </div>
  );
}

export default OfficeReportSidebar;
