import React, {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
} from 'react';

import { FormInstance } from 'antd';
import { shallowEqual } from 'react-redux';

import { SpinIcon } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { IViewData } from '@slice/pages/type';
import { IDynamicModalConfig } from '@type/dynamicModalConfig';

import { ContextHeader } from './contextHeader';
import { ContextList } from './contextList';

"useClient";

interface ComprehensiveReportContextProps {
  isModal?: boolean;
  config: IDynamicModalConfig;
  sidebarForm: FormInstance<any>;
  setReportState: Dispatch<
    SetStateAction<{
      viewDataFilter: Partial<IViewData>;
      tableData: any[];
      cardData: any;
    }>
  >;
  reportState: {
    viewDataFilter: Partial<IViewData>;
    tableData: any[];
    cardData: any;
  };
}

const ComprehensiveReportContext = (props: ComprehensiveReportContextProps) => {
  const {
    isModal = false,
    config,
    sidebarForm,
    setReportState,
    reportState,
  } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mutateIsLoading, setMutateIsLoading] = useState(false);
  const { match, locale } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const locale = state.withPersist.config.lang;
    return { match, locale };
  },shallowEqual);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

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
          sidebarForm={sidebarForm}
          setReportState={setReportState}
          setMutateIsLoading={setMutateIsLoading}
        />
        {mutateIsLoading ? (
          <div className="flex justify-center items-center h-[calc(100dvh-23.25rem)] text-gray-400">
            <SpinIcon config={{ width: 24, height: 24 }} />
          </div>
        ) : (
          <ContextList
            match={match}
            config={config}
            handleActionClick={() => {}}
            lastItemRef={lastItemRef}
            locale={locale}
            isModal={isModal}
            reportState={reportState}
          />
        )}
      </div>
    </div>
  );
};

export default ComprehensiveReportContext;
