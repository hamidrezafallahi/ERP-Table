"useClient";
import { SpinIcon } from "@components/atoms/iconComponents";
import { ContextPagination } from "@components/molecules/contextPagination";
import React, { useEffect, useRef, useState } from "react";
import { useDataManager } from "../hooks/useDataManager";
import { useAppSelector } from "@redux/index";
import { ContextHeader } from "./contextHeader";
import { ContextList } from "./contextList";
import { IDynamicModalConfig } from "@type/dynamicModalConfig";
import { FormInstance } from "antd";

interface ComprehensiveReportContextProps {
  typeId: number;
  isModal?: boolean;
  config: IDynamicModalConfig;
  sidebarForm:FormInstance<any>;
}

const ComprehensiveReportContext = (props: ComprehensiveReportContextProps) => {
  const { typeId, isModal = false, config,sidebarForm } = props;
  const [pageNumber, setPageNumber] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { match, locale } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const locale = state.withPersist.config.lang;
    return { match, locale };
  });

  const perPageCount = isModal ? 3 : 7;
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!typeId) {
      setPageNumber(1);
    }
  }, [typeId]);

  const {
    tableData,
    tableIsLoading,
    tableTotal,
    cardData,
    cardIsLoading,
    refetchCard,
    refetchTable,
    tableDataWithDesc,
  } = useDataManager({
    pageNumber,
    perPageCount,
    match,
    typeId,
  });

  //   useEffect(() => {
  //     if (pageNumber > 1 && tableData?.Data?.length === 0) {
  //       setPageNumber((prevState) => prevState - 1);
  //     }
  //   }, [tableData?.Data]);

  const noModal = match
    ? "h-full p-0"
    : "h-[calc(100dvh-288px)] border-2 border-dashed rounded p-4";

  const hasModal = match
    ? "h-full border-0 p-4"
    : "h-[calc(100dvh-64px)] border-0 p-4";
  return (
    <div
      className={`${isModal ? hasModal : noModal} overflow-hidden hidden-show-scrollBar relative w-full`}
    >
      <div
        className={`${match ? "" : isModal ? "" : "h-[calc(100dvh-21.5rem)]"} flex flex-col gap-2 my-2 lg:my-0`}
        ref={containerRef}
      >
        <ContextHeader
          typeId={typeId}
          refetchCard={refetchCard}
          refetchTable={refetchTable}
          sidebarForm={sidebarForm}
        />
        {cardIsLoading || tableIsLoading ? (
          <div className="flex justify-center items-center h-[calc(100dvh-23.25rem)] text-gray-400">
            <SpinIcon config={{ width: 24, height: 24 }} />
          </div>
        ) : (
          <ContextList
            match={match}
            config={config}
            cardData={cardData}
            handleActionClick={() => {}}
            lastItemRef={lastItemRef}
            tableDataWithDesc={tableDataWithDesc}
            locale={locale}
            isModal={isModal}
          />
        )}
        {match && (
          <ContextPagination
            perPageCount={perPageCount}
            tableTotal={tableTotal}
            tableData={tableData}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
        )}
      </div>
    </div>
  );
};

export default ComprehensiveReportContext;
