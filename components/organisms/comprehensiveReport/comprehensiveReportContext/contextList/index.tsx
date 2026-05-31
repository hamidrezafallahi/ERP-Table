import {
  CardDynamicModal,
  TableDynamicModal,
} from "@components/molecules/dynamicModal";
import { IMenu } from "@type/toolbar";
import { RefObject } from "react";
import IResponseItem from "../../types";
import { IDynamicModalConfig } from "@components/organisms/sideBarForm/types";

interface ContextListProps {
  match: boolean;
  config: IDynamicModalConfig;
  handleActionClick: (action: IMenu, id: number, record: unknown) => void;
  lastItemRef: RefObject<HTMLDivElement>;
  locale: string;
  isModal: boolean;
  reportState: {
    tableData: any[];
    cardData: any;
  };
}

export function ContextList(props: ContextListProps) {
  const {
    match,
    config,
    handleActionClick,
    lastItemRef,
    locale,
    isModal,
    reportState,
  } = props;
  return (
    <>
      {!match ? (
        <CardDynamicModal
          actions={config.actions}
          columnsList={config.listConfig}
          data={reportState.cardData as IResponseItem[]}
          onActionClick={handleActionClick}
          fieldKey={config.fieldKey}
          staticKey={config.staticKey}
          ref={lastItemRef}
          variant="simple"
          customMobileClassName={
            isModal ? "h-[calc(100dvh-303px)]" : "h-[calc(100dvh-538px)]"
          }
        />
      ) : (
        <div className="w-[calc(100dvw-515px)] h-[calc(100dvh-411px)]">
          <TableDynamicModal
            isLoading={false}
            actions={config.actions}
            columnsList={config.listConfig}
            data={reportState.tableData}
            handleAction={handleActionClick}
            locale={locale}
            fieldKey={config.fieldKey}
            {...(reportState.tableData?.length && {
              scroll: { x: "max-content", y: 600 },
            })}
          />
        </div>
      )}
    </>
  );
}
