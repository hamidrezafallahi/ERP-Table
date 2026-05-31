import {
  useCallback,
  useEffect,
} from 'react';

import moment from 'moment-jalaali';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetConditionallyMutation } from '@services/base';
import {
  setPageData,
  setPageFilters,
} from '@slice/pages';

import {
  HookResponse,
  TableData,
} from '../type';

export const useFetchDataForComparativeReport = (): HookResponse => {
    const { viewData, tableData, locale } = useAppSelector(
        (state) => ({
            viewData: state.withPersist.pages?.find(p => p.isActive)?.viewData,
            tableData: state.withPersist.pages?.find(p => p.isActive)?.pageData?.find(d => d.name === "tableData")?.value as TableData,
            locale: state.withPersist.config.lang,
        }),
        shallowEqual
    );
    const dispatch = useDispatch()
    const [fetchData, { isLoading }] = useGetConditionallyMutation();
    const t = useTranslations()
    const recordHeight = 40;
    const deviceHeight = window.innerHeight;
    const recordsPerPage = Math.floor((deviceHeight - 500) / recordHeight);
    const PageNumber = viewData?.PagingInfo?.PageNumber ?? 1
    const PageRecordCount = viewData?.PagingInfo?.PageRecordCount ?? recordsPerPage
    const fetchDataForComparative = useCallback(async ({ url, body }: { url: string, body: any }) => {
        try {
            const res = await fetchData({
                url, body
            }).unwrap()
            const paginateRes = await fetchData({
                url, body: {
                    ...body,
                    PagingInfo: {
                        ...body.PagingInfo,
                        OnlyTotalCount: true
                    },
                }
            }).unwrap()


            if (res && res.Result == "Success" && res.Data.length > 0 && paginateRes && paginateRes.Result == "Success") {
                const returnTitleByKey = (key: string): string | boolean => {
                    const regex = /^(\d{4}\/\d{2}\/\d{2}) - (\d{4}\/\d{2}\/\d{2})$/;
                    const names: Record<string, any> = {
                        AccountCode: "کد حساب",
                        AccountDesc: "شرح حساب",
                        Periods: "نمودار",
                    };
                    if (key in names) {
                        return names[key];
                    } else if (key.match(regex)) {
                        const match = key.match(regex);
                        const startDate = match[1];
                        const endDate = match[2];
                        return `${moment(startDate).format("jYYYY/jMM/jDD")} - ${moment(endDate).format("jYYYY/jMM/jDD")}`
                    } else {

                        return key;
                    }
                };
                const columnOrder = ["AccountCode", "AccountDesc"];
                const lastColumns = ["Periods"];

                const regexDateRange = /(\d{4}\/\d{2}\/\d{2})\s*-\s*(\d{4}\/\d{2}\/\d{2})/;

                const comparativeReportColumns = Object.entries(res.Data[0])
                    .sort(([a], [b]) => {
                        const indexA = columnOrder.indexOf(a);
                        const indexB = columnOrder.indexOf(b);

                        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                        if (indexA !== -1) return -1;
                        if (indexB !== -1) return 1;

                        const lastIndexA = lastColumns.indexOf(a);
                        const lastIndexB = lastColumns.indexOf(b);

                        if (lastIndexA !== -1 && lastIndexB !== -1) return lastIndexA - lastIndexB;
                        if (lastIndexA !== -1) return 1;
                        if (lastIndexB !== -1) return -1;
                        return a.localeCompare(b);
                    })
                    .map(([k]) => {
                        const title = returnTitleByKey(k);
                        return {
                            title,
                            dataIndex: k,
                            key: k,
                            width: 100,
                            ellipsis: true,
                            // align: k === "ColCode" ? "right" : "center",
                            className: "text-nowrap text-ellipsis overflow-hidden max-w-36",
                        };
                    });
                const formatted = res.Data.map((item, index) => {
                    const newItem = { ...item };
                    Object.keys(newItem).forEach(key => {
                        const lowerKey = key.toLowerCase();

                        if (lowerKey.match(regexDateRange) && newItem[key]) {
                            newItem[key] = formatCurrency(newItem[key]);
                        }
                    });
                    return {
                        ...newItem,
                        key: newItem.RowNum ?? index
                    };
                });

                dispatch(
                    setPageData({
                        name: "tableData",
                        value: { Data: formatted, columns: comparativeReportColumns, TotalCount: paginateRes.TotalCount },
                    }),
                );
                dispatch(
                    setPageFilters({
                        PagingInfo: body.PagingInfo
                    }),
                );
            }

            return { success: true, data: res };
        } catch (error) {
            return { success: false, error };
        }
    }, [fetchData]);
    useEffect(() => {
        if (viewData?.reportType && tableData) {
            dispatch(
                setPageData({
                    name: "tableData",
                    value: null,
                }),
            );
        }

    }, [viewData?.reportType])
    return [fetchDataForComparative, { data: tableData, isLoading, PageNumber: PageNumber, PageRecordCount: PageRecordCount }] as const
}
export interface ComparativeReportRow {
    VoucherHeaderId: number;
    VoucherNumber: string;
    VoucherDate: string;
    VoucherDesc: string;
    RowNum: number;
    DetailDesc: string;

    PeriodTitle: string
}




export const formatCurrency = (value: number | string): string => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    return new Intl.NumberFormat("fa-IR", {
        minimumFractionDigits: 0,
    }).format(numericValue);
};

export const returnFieldTypeByKey = (key: string): "date"
    | "price"
    | "string"
    | "number"
    | "boolean"
    | string => {
    if (key.toLowerCase().includes("date")) {
        return "date"
    } else if (["Bed", "Bes", "RunningBalance"].includes(key.toLowerCase())) {
        return "price"
    } else {
        return "string"
    }


};