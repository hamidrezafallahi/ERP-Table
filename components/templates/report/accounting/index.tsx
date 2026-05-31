import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomTooltip } from '@components/atoms/defaultElements';
import ExpandedButton from '@components/molecules/expandedButton';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetConfigValueById } from '@hooks/custom/useGetConfigValueById';
import { addNewPage } from '@slice/pages';
import type { IViewData } from '@slice/pages/type';
import { PageTypeEnum } from '@type/enum';

import Header from '../partials/header';
import Navbar from '../partials/navbar';
import AccountingTable from './accountingTable';
import ReportSidebar from './sidebar';
import ReportToolbar from './toolbar';

const initialReport: IViewData = {
  url: "/api/acc/select/repReviewCol",
  RepoViewId: 10015,
  PageNumber: 1,
  FilterTypeIds: [1, 2, 3, 4, 5],
  showCurrency: true,
  steps: [],
  selectedItems: [],
  Level: 1,
};
function ReportTemplate() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const { initPage } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
    }),
    shallowEqual,
  );
  const [ready, setReady] = useState(false);
  const {Value} = useGetConfigValueById({ id: 5006 });
  const level =  Number(Value)
  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: `title.accountingReport`,
        icon: "ReportIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Report,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "acc/report/accounting",
        viewData: {
          ...initialReport,
          AccessLevel: level,
        },
        listUrl: "acc/report/transaction",
      }),
    );
    setReady(true);
  }, []);

  return (
    <div className="relative flex w-full h-full">
      <div className={`absolute end-0 -top-[60px] flex gap-2`}>
        <CustomTooltip title={t("general.fullScreenMode")}>
          <ExpandedButton />
        </CustomTooltip>
        <ReportToolbar />
      </div>
      <div className="hidden lg:block lg:min-w-32">
        <ReportSidebar />
      </div>
      <div className="flex flex-col gap-1 px-3 w-full h-full">
        <Header active />
        <Navbar active />
        {ready && <AccountingTable />}
      </div>
    </div>
  );
}
export default ReportTemplate;
