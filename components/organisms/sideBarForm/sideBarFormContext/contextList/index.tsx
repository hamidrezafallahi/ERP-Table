import {
  CardDynamicModal,
  TableDynamicModal,
} from "@components/molecules/dynamicModal";
import { IBaseQueryResponse } from "@services/base/type";
import { IMenu } from "@type/toolbar";
import { RefObject } from "react";
import IResponseItem, { IDynamicModalConfig } from "../../types";

interface ContextListProps {
  match: boolean;
  config: IDynamicModalConfig;
  cardData: IBaseQueryResponse<unknown[]>;
  handleActionClick: (action: IMenu, id: number, record: unknown) => void;
  lastItemRef: RefObject<HTMLDivElement>;
  tableDataWithDesc: IResponseItem[];
  locale: string;
  isModal: boolean;
}

export function ContextList(props: ContextListProps) {
  const {
    match,
    config,
    cardData,
    handleActionClick,
    lastItemRef,
    tableDataWithDesc,
    locale,
    isModal,
  } = props;
  return (
    <>
      {!match ? (
        <CardDynamicModal
          actions={config.actions}
          columnsList={config.listConfig}
          data={cardData?.Data as IResponseItem[]}
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
        <TableDynamicModal
          isLoading={false}
          actions={config.actions}
          columnsList={config.listConfig}
          data={tableDataWithDesc}
          handleAction={handleActionClick}
          locale={locale}
          fieldKey={config.fieldKey}
        />
      )}
    </>
  );
}
