import './customStyle.css';

import {
  useEffect,
  useState,
} from 'react';

import { Skeleton } from 'antd';
import moment from 'moment-jalaali';
import { shallowEqual } from 'react-redux';

import { useMediaQuery } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { useGetData } from '@services/base';
import type { IReportResponse } from '@slice/pages/type';

function Summary({ active }) {
  const { cols, activePage, fullScreen } = useAppSelector(
    (state) => ({
      cols: state.withPersist.pages.find((item) => item.isActive)?.viewData
        ?.Columns,
      activePage: state.withPersist.pages.find((item) => item.isActive),
      fullScreen: state.withPersist.config.fullScreen,
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
    Filters = null,
    RefetchId,
    showCurrency,
    OrderInfo = [{ ColName: "AccCode", Asc: true }],
    PagingInfo,
  } = activePage?.viewData || {};
  const recordHeight = 40;
  const deviceHeight = window.innerHeight;
  const recordsPerPage = Math.floor((deviceHeight - 400) / recordHeight);
  const [data, setData] = useState<null | IReportResponse>(null);
  const { match: minDesktop } = useMediaQuery("XLUP");
  const { match: maxDesktop } = useMediaQuery("XXLUP");
  //TODO: add type
  const {
    data: dataResponse,
    isSuccess,
    isLoading,
    isFetching,
  } = useGetData<any, any>({
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
      OnlySum: true,
    },
    id: RefetchId,
  });

  useEffect(() => {
    if (dataResponse?.Result === "Success") {
      setData(dataResponse.Data[0]);
    }
  }, [dataResponse]);
  const limitDesktop = minDesktop && !maxDesktop;
  return (
    <div className="w-full h-10">
      {isFetching ? (
        <div className="rounded-lg w-full h-full overflow-hidden">
          <Skeleton.Button active block className="m-0 p-0 w-full !h-full" />
        </div>
      ) : (
        <div
          className={`w-full           ${
            active
              ? fullScreen
                ? "lg:w-[calc(100dvw-200px)]"
                : limitDesktop
                ? "lg:w-[calc(100dvw-400px)]"
                : "lg:w-[calc(100dvw-450px)]"
              : fullScreen
              ? "lg:w-[calc(100dvw-70px)]"
              : limitDesktop
              ? "lg:w-[calc(100dvw-270px)]"
              : "lg:w-[calc(100dvw-320px)]"
          } 
          transition-all duration-500  flex overflow-x-auto h-full bg-state-success2 summary hidden-show-scrollBar rounded-lg `}
        >
          <div className="min-w-[60px]"></div>
          {cols &&
            data &&
            cols.map((item, index) => {
              return (
                <div
                  key={index}
                  className={` w-full ${
                    item.fieldCaption == "شرح حساب"
                      ? "!min-w-[268px] !max-w-[160px]"
                      : "!min-w-[160px] !max-w-[160px]"
                  } flex justify-center items-center   ${
                    item.fieldName?.includes("Bes") ? " text-state-error1" : ""
                  } `}
                >
                  {data?.hasOwnProperty(item.fieldName)
                    ? `${formatCurrency(data[item.fieldName])}`
                    : ""}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default Summary;
const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: 0,
  }).format(numericValue);
};
