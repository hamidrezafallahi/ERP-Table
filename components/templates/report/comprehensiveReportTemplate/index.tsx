"use client";
import Title from "@components/atoms/Title";
import ComprehensiveReportContext from "@components/organisms/comprehensiveReport/comprehensiveReportContext";
import ComprehensiveReportSidebar from "@components/organisms/comprehensiveReport/comprehensiveReportSidebar";
import { useAppSelector } from "@redux/index";
import { addNewPage } from "@slice/pages";
import { HeaderTypeEnum } from "@slice/pages/enum";
import { PageTypeEnum } from "@type/enum";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { comprehensiveReportConfig } from "./comprehensiveReportConfig";
import { Form } from "antd";

const ComprehensiveReportTemplate = () => {
  const [reportId, setReportId] = useState<number>(undefined);
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
        url: "acc/comprehensiveReport",
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
      <ComprehensiveReportSidebar sidebarForm={form}/>
      <ComprehensiveReportContext
        config={comprehensiveReportConfig(reportId)}
        typeId={reportId}
        sidebarForm={form}
      />
    </div>
  );
};

export default ComprehensiveReportTemplate;
