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

import OfficeReportContext from './context';
import OfficeReportNavbar from './navBar';
import OfficeReportSidebar from './sidebar';

const OfficeReportTemplate = () => {
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
        caption: "title.officeReport",
        icon: "IssuingProformaInvoiceIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "acc/report/officeReport",
        listPageId: initPage?.listPageId,
        headerType: HeaderTypeEnum.MobileWithoutSearch,
        returnPageId: initPage.pageId,
      }),
    );
  }, []);

  return (
    <>
       <div className="relative flex w-full h-full">
        <div className='-top-16 absolute flex justify-start items-center -end-2'>
          <ExpandedButton/>
        </div>
        <div className="flex flex-col gap-3 p-4 border rounded-lg w-full lg:w-60 lg:min-w-60 h-full overflow-hidden">
          <OfficeReportSidebar />
        </div>
        <div className="flex flex-col gap-1 px-3 w-full h-full">
          <OfficeReportNavbar />
          <OfficeReportContext />
        </div>
      </div>
    </>
  );
};

export default OfficeReportTemplate;
