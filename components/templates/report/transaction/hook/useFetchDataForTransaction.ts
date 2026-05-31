import {
  useEffect,
  useState,
} from 'react';

import moment from 'moment-jalaali';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import { setViewData } from '@slice/pages';
import { IReportResponse } from '@slice/pages/type';
import { formatCurrency } from '@utils/core';

const fieldsToFormat = ["Bed", "Bes", "Mandeh"];
const useFetchDataForTransaction = () => {
  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find((item) => item.isActive),
    }),
    shallowEqual
  );

  const {
    url = "/api/acc/select/repgardesh",
    RepoViewId = 5008,
    PageNumber = 1,
    YearIds = null,
    PlaceIds = null,
    StartDate = moment().locale("fa").clone().startOf("jYear").valueOf(),
    EndDate = moment().locale("fa").clone().endOf("day").valueOf(),
    InnerFilters = [],
    IsFirstPeriod = false,
    IsCurrencyCount = false,
    IsReferCount = false,
    IsShowMandehDar = false,
    PlaceIdsCols = null,
    FilterIds = null,
    FilterTypeIds = [1, 2, 3, 4, 5],
    // Level = 0,
    showCurrency = true,
    // child = null,
    TreeView = false,
    Filters = null,
    // selectedItems = [],
    OrderInfo = [{ ColName: "AccCode", Asc: true }],
  } = activePage?.viewData || {};
  const [data, setData] = useState<any | IReportResponse>({});
  const recordHeight = 40;
  const deviceHeight = window.innerHeight;
  const recordsPerPage = Math.floor((deviceHeight - 400) / recordHeight)-1;
  const dispatch = useDispatch();
  //TODO: add type
  const {
    data: dataResponse,
    // isSuccess,
    // isLoading,
    isFetching,
  } = useGetData<any, any>({
    url,
    body: {
      RepoViewId,
      OrderInfo,
      PagingInfo: {
        PageRecordCount: recordsPerPage,
        PageNumber,
        WithTotalCount: true,
      },
      YearIds,
      PlaceIds,
      StartDate: StartDate ? new Date(StartDate).toISOString() : null,
      EndDate: EndDate ? new Date(EndDate).toISOString() : null,
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

  useEffect(() => {
    if (dataResponse?.Result === "Success") {
      if (dataResponse?.Data.length > 0) {
        const { ReturnCount, TotalCount, Data } = dataResponse;
        let temp = Object.entries(Data[0])
          .map((item) =>
            typeof item[1] === "object" && item[1] !== null
              ? Object.keys(item[1])
              : item[0]
          )
          .flat();
        let cols = temp.map((key) => ({
          fieldType: "string",
          title: returnNameByKey(key),
          fieldName:key,
          dataIndex: key,
          key: key,
          hidden:
            key == "VoucherDetailId" ||
            key == "Levels" ||
            key == "VoucherHeaderId",
          // fixed: returnNameByKey(key).includes("شرح") ? "right" : "",
          // width: returnNameByKey(key).includes("شرح") ? 280 : returnNameByKey(key).includes("تاریخ سند") || returnNameByKey(key).includes("شماره سند	") || returnNameByKey(key).includes("شماره سریال") ? 60 : 130,
          className: " text-nowrap text-ellipsis ",
          align: "center",
        }));
        dispatch(
          setViewData({
            ...activePage?.viewData,
            Columns: cols,
          })
        );
        setData({
          columns: cols,
          Data: formatData(Data),
          ReturnCount,
          TotalCount,
        });
      } else {
        setData({ columns: [], Data: [], ReturnCount: 0, TotalCount: 0 });
        return;
      }
    } else {
      setData({ columns: [], Data: [], ReturnCount: 0, TotalCount: 0 });
    }
  }, [dataResponse, showCurrency, TreeView]);
  useEffect(() => {
    if (
      activePage &&
      dataResponse?.Result === "Success" &&
      dataResponse?.Data.length > 0 &&
      !activePage.viewData.Columns
    ) {
      const { Data } = dataResponse;
      let temp = Object.entries(Data[0])
        .map((item) =>
          typeof item[1] === "object" && item[1] !== null
            ? Object.keys(item[1])
            : item[0]
        )
        .flat();
      let cols = temp.map((key) => ({
        fieldType: "string",
        title: returnNameByKey(key),
        fieldName: key,
        dataIndex: key,
        key: key,
        hidden: key == "VoucherDetailId",
        // fixed: returnNameByKey(key).includes("شرح") ? "right" : "",
        // width: returnNameByKey(key).includes("شرح") ? 280 : returnNameByKey(key) === "کد حساب" ? 60 : 130,
        className: " text-nowrap text-ellipsis ",
        align: "center",
      }));
      dispatch(
        setViewData({
          ...activePage?.viewData,
          Columns: cols,
        })
      );
    }
  }, [activePage]);

  return {
    data,
    isLoading: isFetching,
    PageRecordCount: recordsPerPage,
    PageNumber,
  };
};
export default useFetchDataForTransaction;

const formatData = (Data) => {
  return Data.map((item) => {
    const formattedItem = {
      key: item.VoucherDetailId,
      ...flattenObject(item),
    };
    return formatFields(formattedItem, fieldsToFormat);
  });
};

const returnNameByKey = (key: string): string => {
  const names: Record<string, any> = {
    VoucherDate: "تاریخ سند",
    VoucherNumber: "شماره سند",
    ReferNumber: "شماره ارجاع",
    SerialNumber: "شماره سریال",
    DetailDesc: "شرح سند",
    Bed: "بدهکار",
    Bes: "بستانکار",
    Levels: "سطح ها",
    Mandeh: "مانده",
    VoucherDetailId: "آیدی جزئیات سند",
  };
  return names[key];
};

const flattenObject = (
  obj: Record<string, any>,
  parentKey = "",
  result: Record<string, any> = {}
) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${key}` : key;
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
  fieldsToFormat: string[]
): Record<string, any> => {
  return Object.keys(data).reduce((acc, key) => {
    // console.log(key)
    // console.log(data[key])
    if (fieldsToFormat.includes(key)) {
      // console.log(acc)
      acc[key] = formatCurrency(data[key]);
    } else if (key == "VoucherDate") {
      const date = new Date(data[key]);
      const jalaliDate = moment(date).format("jYYYY/jMM/jDD");
      acc[key] = jalaliDate;
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {} as Record<string, any>);
};
