"use client";
import {
  useEffect,
  useState,
} from 'react';

import moment from 'moment-jalaali';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useInitializePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import {
  useGetConditionallyMutation,
  useGetData,
} from '@services/base';
import type { IBaseQueryResponse } from '@services/base/type';
import { setParentPageId } from '@slice/config';
import { setViewData } from '@slice/pages';
import type {
  IReportResponse,
  IViewData,
} from '@slice/pages/type';
import {
  formatCurrency,
  levelUrl,
} from '@utils/core';

const fieldsToFormat = [
  "SumBes",
  "SumBed",
  "MandBes",
  "MandBed",
  "ReferBed",
  "ReferBes",
  "ReferRemain",
  "CurrencyBed",
  "CurrencyBes",
  "CurrencyRemain",
];
const useFetchDataForReport = () => {
  const initializePage = useInitializePage();
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
    }),
    shallowEqual
  );

  const {
    url = "/api/acc/select/repReviewGroh",
    RepoViewId = 10007,
    PageNumber = 1,
    YearIds = null,
    PlaceIds = null,
    FromDate = moment().locale("fa").clone().startOf("jYear").valueOf(),
    ToDate = moment().locale("fa").clone().endOf("day").valueOf(),
    InnerFilters = [],
    IsFirstPeriod = false,
    IsCurrencyCount = false,
    IsReferCount = false,
    IsShowMandehDar = false,
    PlaceIdsCols = null,
    FilterIds = null,
    FilterTypeIds = [1, 2, 3, 4, 5],
    Level = 0,
    showCurrency = true,
    child = null,
    TreeView = false,
    Filters = null,
    OrderInfo = [{ ColName: "AccCode", Asc: true }],
  } = activePage?.viewData || {};
  const [data, setData] = useState<any | IReportResponse>({});
  const [prevStates, setPrevStates] = useState<IViewData[]>([]);
  const recordHeight = 40;
  const deviceHeight = window.innerHeight;
  const recordsPerPage = Math.floor((deviceHeight - 400) / recordHeight);
  const dispatch = useDispatch();

  //TODO : add type
  const { data: dataResponse, isFetching } = useGetData<any, any>({
    url,
    body: {
      RepoViewId,
      OrderInfo,
      PagingInfo: {
        PageRecordCount: recordsPerPage,
        PageNumber,
        // WithTotalCount: false,
      },
      YearIds,
      PlaceIds,
      FromDate: FromDate ? new Date(FromDate).toISOString() : null,
      ToDate: ToDate ? new Date(ToDate).toISOString() : null,
      InnerFilters,
      IsFirstPeriod,
      IsCurrencyCount,
      IsReferCount,
      IsShowMandehDar,
      PlaceIdsCols,
      FilterIds,
      FilterTypeIds,
      Filters,
    },
  });
  const [getChild, { isLoading: isLoadingRepoTag }] =
    useGetConditionallyMutation();

  useEffect(() => {
    if (dataResponse?.Result === "Success") {
      if (dataResponse?.Data.length > 0) {
        const { ReturnCount, TotalCount, Data } = dataResponse;
        const columns = Object.keys(Data[0] || {})
          .map((key) => ({
            fieldName: key,
            fieldCaption: returnNameByKey(key, url),
            fieldType: typeof Data[0][key],
          }))
          .filter((column) => column.fieldName !== "AccId");
        dispatch(
          setViewData({
            ...activePage?.viewData,
            Columns: columns,
          })
        );
        setData({
          columns: columns.map(({ fieldCaption, fieldName }) => ({
            title: fieldCaption,
            dataIndex: fieldName,
            key: fieldName,
            fixed: fieldCaption === "شرح حساب" ? "right" : "",
            width: fieldCaption === "شرح حساب" ? 218 : 160,
            ellipsis: true,
            align: fieldCaption === "کد حساب" ? "right" : "center",
            className: `text-nowrap text-ellipsis overflow-hidden  ${
              fieldCaption === "شرح حساب" ? "!w-[218px]" : "!w-[160px]"
            } `,
          })),
          Data: formatData(Data, Level, child, TreeView, url),
          ReturnCount,
          TotalCount,
        });
      } else {
        if (FilterIds?.length > 0 && FilterIds !== prevStates[0]?.FilterIds) {
          dispatch(setParentPageId({ parentPageId: activePage.pageId }));
          dispatch(
            setViewData({ ...prevStates[0], lastSteps: prevStates[1]?.steps })
          );
          initializePage({
            config: {
              RepoId: activePage.RepoId,
              SystemId: activePage.SystemId,
              url: "acc/report/transaction",
            },
          });
        }
        setData({ columns: [], Data: [], ReturnCount: 0, TotalCount: 0 });
        return;
      }
    } else {
      setData({ columns: [], Data: [], ReturnCount: 0, TotalCount: 0 });
    }
  }, [dataResponse, showCurrency, TreeView]);
  useEffect(() => {
    const fetchChildData = async () => {
      if (child) {
        const flatNested = flattenToArray(child);
        const formattedNestedIds = flatNested.map((item) => ({
          Level: item.Level,
          Ids: [item.Id],
        }));
        try {
          // TODO: update type
          const newChild: IBaseQueryResponse<any> = await getChild({
            url: levelUrl(child.Level + 1),
            body: {
              RepoViewId,
              PagingInfo: {
                PageRecordCount: recordsPerPage,
                PageNumber,
                // WithTotalCount: false,
              },
              YearIds,
              PlaceIds,
              FromDate: new Date(FromDate).toISOString(),
              ToDate: new Date(ToDate).toISOString(),
              InnerFilters,
              IsFirstPeriod,
              IsCurrencyCount,
              IsReferCount,
              IsShowMandehDar,
              PlaceIdsCols,
              FilterIds: formattedNestedIds,
              FilterTypeIds,
            },
          }).unwrap();

          if (newChild?.Result == "Success") {
            addChildToData(newChild, child, setData, TreeView, url);
          }
        } catch (error) {
          null;
        }
      }
    };

    fetchChildData();
  }, [child]);
  useEffect(() => {
    if (activePage?.viewData) {
      setPrevStates((prev) => {
        const newStates = [...prev, activePage.viewData];
        return newStates.slice(-2);
      });
    }
    if (
      activePage &&
      dataResponse?.Result === "Success" &&
      dataResponse?.Data.length > 0 &&
      !activePage.viewData?.Columns
    ) {
      const { Data } = dataResponse;
      const columns = Object.keys(Data[0] || {})
        .map((key) => ({
          fieldName: key,
          fieldCaption: returnNameByKey(key, url),
          fieldType: typeof Data[0][key],
        }))
        .filter((column) => column.fieldName !== "AccId");
      dispatch(
        setViewData({
          ...activePage?.viewData,
          Columns: columns,
        })
      );
    }
  }, [activePage]);

  return {
    data,
    isLoading: isFetching,
    childIsLoading: isLoadingRepoTag,
    PageRecordCount: recordsPerPage,
    PageNumber,
  };
};
export default useFetchDataForReport;

const formatData = (Data, Level, child = null, TreeView, url) => {
  return Data.map((item) => {
    const formattedItem = {
      ...item,
      key: item.AccId,
      Level: Level,
      children: TreeView && Level <= 2 ? [] : null,
      Nested: child,
      ...flattenObject(item),
    };
    return formatFields(formattedItem, fieldsToFormat, url);
  });
};

export const returnNameByKey = (key: string, url?: string): string => {
  const names: Record<string, any> = {
    AccId: "AccId",
    AccCode: (url?: string) => {
      if (url && url.includes("Date")) {
        return "تاریخ پیگیری";
      } else {
        return "کد حساب";
      }
    },
    AccDesc: "شرح حساب",
    SumBed: "جمع بدهکار ",
    SumBes: "جمع بستانکار ",
    MandBed: "مانده بدهکار ",
    MandBes: "مانده بستانکار ",
    ReferBed: " پیگیری بدهکار",
    ReferBes: " پیگیری بستانکار ",
    ReferRemain: " پیگیری مانده ",
    CurrencyBed: "ارز بدهکار ",
    CurrencyBes: "ارز بستانکار ",
    CurrencyRemain: "ارز مانده ",
    FirstPeriodBed: "اول دوره بدهکار ",
    FirstPeriodBes: "اول دوره بستانکار ",
  };
  if (key in names) {
    if (key === "AccCode" && typeof names[key] === "function") {
      return names[key](url);
    }
    return names[key];
  }
  return key;
};

const flattenObject = (
  obj: Record<string, any>,
  parentKey = "",
  result: Record<string, any> = {}
) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flattenObject(obj[key], newKey, result);
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
};

const formatFields = (
  data: Record<string, any>,
  fieldsToFormat: string[],
  url: string
): Record<string, any> => {
  return Object.keys(data).reduce((acc, key) => {
    if (fieldsToFormat.includes(key)) {
      acc[key] = formatCurrency(data[key]);
    } else if (key == "AccCode" && url.includes("Date")) {
      const date = new Date(data[key]);
      const jalaliDate = moment(date).format("jYYYY/jMM/jDD");
      acc[key] = jalaliDate;
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {} as Record<string, any>);
};

const addChildToData = (Response, child, setData, TreeView, url) => {
  const newChildren = Response.Data.map((item) => item);
  const temp = formatData(newChildren, child.Level + 1, child, TreeView, url);
  setData((prevData) => {
    const flatArray = flattenToArray(child);
    const updateChildren = (data, ids, newChildren) => {
      if (ids.length === 0) return data;
      return data.map((item) => {
        if (item.AccId === ids[0].Id) {
          const updatedItem = { ...item };
          if (ids.length === 1) {
            updatedItem.children = newChildren;
          } else {
            updatedItem.children = updateChildren(
              item.children || [],
              ids.slice(1),
              newChildren
            );
          }
          return updatedItem;
        }
        return item;
      });
    };
    const updatedData = {
      ...prevData,
      Data: updateChildren(prevData.Data, flatArray, temp),
    };
    return updatedData;
  });
};
function flattenToArray(obj) {
  const result = [];
  function traverse(node) {
    if (node) {
      result.unshift({
        Level: node.Level,
        Id: node.Id,
      });
      if (node.Nested) {
        traverse(node.Nested);
      }
    }
  }

  traverse(obj);
  return result;
}
