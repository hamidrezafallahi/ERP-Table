import { Dispatch, SetStateAction } from "react";

import type { IBaseQueryResponse } from "@services/base/type";
import type { IRepoViewConfig } from "@services/generalType/type";
import type { IViewData } from "@slice/pages/type";
import type { IToolbarMenu } from "@type/toolbar";

export interface IProps<T> {
    gridData: IBaseQueryResponse<T[]>;
    columnsList: IRepoViewConfig;
    actions: IToolbarMenu[];
    staticKey: string;
    staticKeyII: string;
    onActionClick: (
        action: IToolbarMenu,
        id: number | null,
        additionalId: number | null,
        PendingStatusId: number | null,
        formViewId: number | null,
    ) => void;
    rowFieldKey: string;
    additionalFieldKey?: string;
    conditionalActions?: {
        conditionalProperty: string;
        conditionallyAction?: string;
    }[];
    isSelectMode: boolean;
    setIsSelectMode: Dispatch<SetStateAction<boolean>>;
    mobilePerPageCount: number;
    viewData: IViewData;
    direction: "rtl" | "ltr";
    totalCount?: number;
    loading?: boolean;
    withoutActivation?: boolean;
    filteringAction?: (actions: IToolbarMenu[], rowData: T) => IToolbarMenu[];
    isShowChangeStatus?: boolean;
    system?: string;
}
