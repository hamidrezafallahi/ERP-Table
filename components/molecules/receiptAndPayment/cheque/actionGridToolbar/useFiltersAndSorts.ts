import { useReducer } from "react";

import { useDispatch } from "react-redux";

import type { IData } from "@components/molecules/advancedFilter/type";
import { useAppSelector } from "@redux/index";
import { StateTypeEnum } from "@services/trh/receivedCheque/type";
import { setPageState } from "@slice/pages";
import { PageStateEnum } from "@slice/pages/enum";

interface IState {
  isSortModalOpen: boolean;
  isFilterModalOpen: boolean;
}

type Action =
  | { type: "OPEN_SORT_MODAL" }
  | { type: "CLOSE_SORT_MODAL" }
  | { type: "OPEN_FILTER_MODAL" }
  | { type: "CLOSE_FILTER_MODAL" };

export const useFiltersAndSorts = ({
  setOrderInfo,
  setPageNumber,
  setFilterInfo,
  filterInfo,
}) => {
  const initialState: IState = {
    isSortModalOpen: false,
    isFilterModalOpen: false,
  };

  const activePage = useAppSelector((state) =>
    state.withPersist.pages.find((page) => page.isActive),
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

  const filterFields: IData[] = [
    {
      value: "DocumentCheque.MaturityDate",
      label: "تاریخ سررسید",
      type: "date",
      valueOption: {},
    },
    {
      value: "DocumentCheque.StateId",
      label: "آخرین وضعیت",
      type: "select",
      valueOption: {
        Options: [
          {
            caption: "نزد بانک",
            value: StateTypeEnum.Bank,
          },
          {
            caption: "نزد صندوق",
            value: StateTypeEnum.CashDesk,
          },
          {
            caption: "وصول شده",
            value: StateTypeEnum.Collected,
          },
          {
            caption: "نزد شخص",
            value: StateTypeEnum.Person,
          },
          {
            caption: "نزد تنخواه",
            value: StateTypeEnum.Tankhah,
          },
          {
            caption: "استرداد شده",
            value: StateTypeEnum.Returned,
          },
        ],
      },
    },
    {
      value: "CheckReceiptHeader.TafsiliId",
      label: "صادرکننده چک",
      type: "select",
      valueOption: {
        endpoint: "/api/acc/select/tafsili4SelectOption",
        TafsiliTypeId: 1,
        repoViewId: 10017,
      },
    },
  ];
  const sortFields = [
    {
      value: "DocumentCheque.MaturityDate",
      label: "تاریخ سررسید",
      type: "date",
      valueOption: {},
    },
    {
      value: "CreateDate",
      label: "تاریخ دریافت",
      type: "date",
      valueOption: {},
    },
  ];

  const applySorts = (appliedSorts: { field: string; order: string }[]) => {
    setOrderInfo(
      appliedSorts.map((sort) => ({
        ColName: sort.field,
        Asc: sort.order === "asc",
      })),
    );
    setPageNumber(1);

    dispatchState({ type: "CLOSE_SORT_MODAL" });
  };

  const applyFilters = (
    appliedFilters: { field: string; value: any; type: any }[],
  ) => {
    setFilterInfo(
      ...filterInfo,
      appliedFilters.map((item) => ({
        ColName: item.field,
        Value: item.value,
        FilterType: item.type,
      })),
    );
    setPageNumber(1);
    dispatchState({ type: "CLOSE_FILTER_MODAL" });
  };

  const onResetFilters = () => {
    setFilterInfo([]);
    setPageNumber(1);
    dispatchState({ type: "CLOSE_FILTER_MODAL" });
  };

  const onResetSortOrder = () => {
    setOrderInfo([]);
    setPageNumber(1);
    dispatchState({ type: "CLOSE_SORT_MODAL" });
  };

  const handleRefresh = () => {
    dispatch(
      setPageState({
        ...activePage,
        pageState: PageStateEnum.Opened,
      }),
    );
  };
  const onReload = () => {
    setFilterInfo([]);
    setOrderInfo([]);
    setPageNumber(1);
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
