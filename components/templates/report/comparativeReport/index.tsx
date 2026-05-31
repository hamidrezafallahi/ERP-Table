"use client";
import { useEffect } from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import ExpandedButton from '@components/molecules/expandedButton';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { addNewPage } from '@slice/pages';
import { HeaderTypeEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';

import ComparativeReportContext from './context';
import ComparativeReportNavbar from './navBar';
import ComparativeReportSidebar from './sidebar';

const ComparativeReportTemplate = () => {
  const dispatch = useDispatch();
  const { initPage, match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );
  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: "title.comparativeReport",
        icon: "IssuingProformaInvoiceIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "acc/report/comparativeReport",
        listPageId: initPage?.listPageId,
        headerType: HeaderTypeEnum.MobileWithoutSearch,
        returnPageId: initPage.pageId,
      }),
    );
  }, []);

  return (
    <>
      <div className="relative flex w-full h-full">
        <div className="-top-16 absolute flex justify-start items-center -end-2">
          <ExpandedButton />
        </div>
        <div className="flex flex-col gap-3 border rounded-lg w-full lg:w-60 lg:min-w-60 h-full overflow-hidden">
          <ComparativeReportSidebar />
        </div>
        <div className="flex flex-col gap-1 ps-3 w-full h-full">
          <ComparativeReportNavbar />
          <ComparativeReportContext />
        </div>
      </div>
    </>
  );
};

export default ComparativeReportTemplate;
