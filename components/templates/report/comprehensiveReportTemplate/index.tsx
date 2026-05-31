"use client";
import {
  useEffect,
  useState,
} from 'react';

import { Form } from 'antd';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import Title from '@components/atoms/Title';
import ComprehensiveReportContext
  from '@components/organisms/comprehensiveReport/comprehensiveReportContext';
import ComprehensiveReportSidebar
  from '@components/organisms/comprehensiveReport/comprehensiveReportSidebar';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { addNewPage } from '@slice/pages';
import { HeaderTypeEnum } from '@slice/pages/enum';
import { IViewData } from '@slice/pages/type';
import { PageTypeEnum } from '@type/enum';

import { comprehensiveReportConfig } from './comprehensiveReportConfig';

const ComprehensiveReportTemplate = () => {
  const [reportState, setReportState] = useState<{
    viewDataFilter: Partial<IViewData>;
    tableData: any[];
    cardData: any;
  }>({
    viewDataFilter: {},
    tableData: [],
    cardData: null,
  });
  const dispatch = useDispatch();
  const [form] = Form.useForm();
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
        caption: "title.comprehensiveReport",
        icon: "IssuingProformaInvoiceIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "acc/report/comprehensiveReport",
        listPageId: initPage?.listPageId,
        headerType: HeaderTypeEnum.MobileWithoutSearch,
        returnPageId: initPage.pageId,
      }),
    );
  }, []);

  return (
    <div
      className={`${match ? "h-full mt-0" : "h-[calc(100dvh-10rem)] mt-4 overflow-hidden"} relative flex lg:flex-row items-center flex-col gap-4`}
    >
      <Title caption={"title.comprehensiveReport"} />
      <ComprehensiveReportSidebar sidebarForm={form} />
      <ComprehensiveReportContext
        config={comprehensiveReportConfig(
          reportState?.viewDataFilter,
          form.getFieldValue("ReportType"),
        )}
        sidebarForm={form}
        reportState={reportState}
        setReportState={setReportState}
      />
    </div>
  );
};

export default ComprehensiveReportTemplate;
