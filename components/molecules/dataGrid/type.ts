import { IRepoViewConfig } from "@services/generalType/type";
import type { IViewData } from "@slice/pages/type";
import type { IToolbarMenu } from "@type/toolbar";

export interface IProps<T> {
    data: T[];
    totalCount: number;
    totalIsLoading: boolean;
    actions: IToolbarMenu[];
    columnsList: IRepoViewConfig;
    viewData: IViewData;
    loading: boolean;
    rowFieldKey: keyof T;
    additionalFieldKey?: string;
    onActionClick: (
        action: IToolbarMenu,
        id: number | null,
        additionalId: number | null,
        PendingStatusId: number | null,
        formViewId: number | null,
        correctUniqueId?: string | null,
    ) => void;
    recordPerPage: number;
    conditionalActions?: {
        conditionalProperty: keyof T;
        conditionallyAction?: string;
        opposite?: boolean;
    }[];
    EditField?: string;
    withoutActivation?: boolean;
    formUrl?: string;
    filteringAction?: (actions: IToolbarMenu[], rowData: T) => IToolbarMenu[];
    renderSimple?: boolean;
    isShowChangeStatus?: boolean;
    system?: string;
}

export interface IChangesField {
    id: number;
    HasBookMark: boolean;
}
