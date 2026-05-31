import {
  useMemo,
  useReducer,
} from 'react';

import { useDispatch } from 'react-redux';

import { useInvalidateTag } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  setPageState,
  setViewData,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import type { IViewData } from '@slice/pages/type';
import type { IToolbarDetailConfig } from '@type/toolbar';

interface IProps {
  viewData: IViewData;
  config: IToolbarDetailConfig[];
}

interface IState {
  isSortModalOpen: boolean;
  isFilterModalOpen: boolean;
}

type Action =
  | { type: "OPEN_SORT_MODAL" }
  | { type: "CLOSE_SORT_MODAL" }
  | { type: "OPEN_FILTER_MODAL" }
  | { type: "CLOSE_FILTER_MODAL" };

export const useFiltersAndSorts = ({ viewData, config }: IProps) => {
  const initialState: IState = {
    isSortModalOpen: false,
    isFilterModalOpen: false,
  };
  const activePage = useAppSelector((state) =>
    state.withPersist.pages?.find((page) => page.isActive),
  );

  function reducer(state: IState, action: Action): IState {
    switch (action.type) {
      case "OPEN_SORT_MODAL":
        return { ...state, isSortModalOpen: true };
      case "CLOSE_SORT_MODAL":
        return { ...state, isSortModalOpen: false };
      case "OPEN_FILTER_MODAL":
        return { ...state, isFilterModalOpen: true };
      case "CLOSE_FILTER_MODAL":
        return { ...state, isFilterModalOpen: false };
      default:
        return state;
    }
  }

  const [state, dispatchState] = useReducer(reducer, initialState);

  const dispatch = useDispatch();
  const { invalidate } = useInvalidateTag();

  const newFilterFields = useMemo(
    () => config?.filter((item) => item.inFilter),
    [config],
  );
  const newSortFields = useMemo(
    () => config?.filter((item) => item.inSort),
    [config],
  );

  const filterFields = useMemo(
    () =>
      newFilterFields?.map((item) => ({
        value: item.fieldName,
        label: item.fieldCaption,
        type: item.fieldType,
        valueOption: item.valueOption,
      })),
    [newFilterFields],
  );

  const sortFields = useMemo(
    () =>
      newSortFields?.map((item) => ({
        value: item.fieldName,
        label: item.fieldCaption,
        type: item.fieldType,
        valueOption: item.valueOption,
      })),
    [newSortFields],
  );

  const applySorts = (appliedSorts: { field: string; order: string }[]) => {
    dispatch(
      setViewData({
        ...viewData,
        OrderInfo: appliedSorts.map((sort) => ({
          ColName: sort.field,
          Asc: sort.order === "asc",
        })),
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: viewData?.PagingInfo?.PageRecordCount,
        },
      }),
    );

    invalidate(activePage?.viewData?.url);
    dispatchState({ type: "CLOSE_SORT_MODAL" });
  };

  const applyFilters = (
    appliedFilters: { field: string; value: any; type: any }[],
  ) => {
    dispatch(
      setViewData({
        ...viewData,
        Filters: {
          ...viewData.Filters,
          FilterInfo: appliedFilters.map((item) => ({
            ColName: item.field,
            Value: item.value,
            FilterType: item.type,
          })),
        },
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: viewData?.PagingInfo?.PageRecordCount,
        },
      }),
    );

    invalidate(activePage?.viewData?.url);
    dispatchState({ type: "CLOSE_FILTER_MODAL" });
  };

  const onResetFilters = () => {
    dispatch(
      setViewData({
        ...viewData,
        Filters: {
          FilterInfo: [],
          ShowOnlyBookmarked: false,
          TagIdsFilter: null,
        },
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: viewData?.PagingInfo?.PageRecordCount,
        },
      }),
    );

    invalidate(activePage?.viewData?.url);
    dispatchState({ type: "CLOSE_FILTER_MODAL" });
  };

  const onResetSortOrder = () => {
    dispatch(
      setViewData({
        ...viewData,
        OrderInfo: [],
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: viewData?.PagingInfo?.PageRecordCount,
        },
      }),
    );

    invalidate(activePage?.viewData?.url);
    dispatchState({ type: "CLOSE_SORT_MODAL" });
  };

  const handleRefresh = () => {
    invalidate(activePage?.viewData?.url);
    dispatch(
      setPageState({
        ...activePage,
        pageState: PageStateEnum.Opened,
      }),
    );
  };
  const onReload = () => {
    invalidate(activePage?.viewData?.url);

    dispatch(
      setViewData({
        ...viewData,
        OrderInfo: [],
        Filters: {
          FilterInfo: [],
          ShowOnlyBookmarked: false,
          TagIdsFilter: null,
        },
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: viewData?.PagingInfo?.PageRecordCount,
        },
      }),
    );
    dispatch(
      setPageState({
        ...activePage,
        pageState: PageStateEnum.Opened,
      }),
    );
  };

  return {
    filterFields,
    sortFields,
    applySorts,
    applyFilters,
    onResetSortOrder,
    onResetFilters,
    handleRefresh,
    state,
    dispatchState,
    onReload,
  };
};
