import { useReducer } from "react";

import { useDispatch } from "react-redux";

import { useAppSelector } from "@redux/index";
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

  const filterFields = [];
  const sortFields = [];

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
