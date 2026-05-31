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

export const useFetchDataForOfficeReport = (): HookResponse => {
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
    const fetchDataForOffice = useCallback(async ({ url, body }: { url: string, body: any }) => {
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
                const returnTitleByKey = (key: string, reportMode?: number): string | boolean => {

                    const names: Record<string, any> = {
                        VoucherNumber: "شماره سند",
                        Bed: "بدهکار",
                        Bes: "بستانکار",
                        AccountCode: "کد معین",
                        AccountDesc: "شرح معین",
                        ColCode: "کد کل",
                        ColDesc: "شرح کل",
                        RunningBalance: " نهایی مانده",
                        VoucherDate: "تاریخ سند",
                        VoucherDesc: "شرح سند",
                        RowNum: "شماره سطر",
                        DetailDesc: "شرح ردیف",
                        PeriodTitle: "تاریخ سند",
                        AccountLevel: "سطوح",
                        DocStatusName: "وضعیت",
                        LevelDesc: reportMode ? `${t(`report.header.${reportMode}`)}` : "سطح",
                        LevelCode: reportMode ? `کد ${t(`report.header.${reportMode}`)}` : "کد سطح"
                    };
                    if (key in names) {
                        return names[key];
                    }
                    return false;
                };
                const getReportKey = (reportType: string, ledgerType: string, reportMode: string, isShowMoeen: boolean) =>
                    `${reportType}|${ledgerType}|${reportMode}|${isShowMoeen ? "1" : "0"}`;

                const reportKey = getReportKey(
                    body.reportType,
                    body.LedgerType ?? 0,
                    body.reportMode ?? 0,
                    body.ShowMoeen
                );
                console.log(reportKey,body.ShowMoeen)
                const columnOrder = reportColumnMap[reportKey] ?? [];
                const officeReportColumns =

                    Object.entries(res.Data[0])
                        .filter(([k]) =>{
                            console.log(k,columnOrder.includes(k),columnOrder)
                            return  columnOrder.includes(k)
                        })
                        .sort(([a], [b]) => {
                            const indexA = columnOrder.indexOf(a);
                            const indexB = columnOrder.indexOf(b);

                            if (indexA === -1) return 1;
                            if (indexB === -1) return -1;

                            return indexA - indexB;
                        })
                        .map(([k]) => {
                            const title = returnTitleByKey(k, body.reportMode);
                            return {
                                title,
                                dataIndex: k,
                                key: k,
                                width: 100,
                                ellipsis: true,
                                className: "text-nowrap text-ellipsis overflow-hidden max-w-36",
                            };
                        });

                const formatted = res.Data.map((item, index) => {
                    const newItem = { ...item };

                    Object.keys(newItem).forEach(key => {
                        const lowerKey = key.toLowerCase();
                        if ((lowerKey.includes("date") || lowerKey.includes("periodtitle")) && newItem[key]) {
                            newItem[key] = moment(newItem[key]).format("jYYYY/jMM/jDD");
                        }
                        else if (["bed", "bes", "runningbalance"].includes(lowerKey) && newItem[key]) {
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
                        value: { Data: formatted, columns: officeReportColumns, TotalCount: paginateRes.TotalCount },
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
    return [fetchDataForOffice, { data: tableData, isLoading, PageNumber: PageNumber, PageRecordCount: PageRecordCount }] as const
}
export interface OfficeReportRow {
    VoucherHeaderId: number;
    VoucherNumber: string;
    VoucherDate: string;
    VoucherDesc: string;
    RowNum: number;
    DetailDesc: string;
    Bed: number;
    Bes: number;
    ColId: number;
    ColCode: string;
    ColDesc: string;
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


const reportColumnMap: Record<string, string[]> = {
    // ---------------- تحریر دفاتر ----------------

    "2|3|0|0": [
        "PeriodTitle",
        "ColCode",
        "ColDesc",
        "Bed",
        "Bes",
    ],

    "2|3|0|1": [
        "PeriodTitle",
        "ColCode",
        "ColDesc",
        "AccountCode",
        "AccountDesc",
        "Bed",
        "Bes",
    ],

    "2|1|0|0": [
        "VoucherNumber",
        "VoucherDate",
        "ColCode",
        "ColDesc",
        "AccountCode",
        "AccountDesc",
        "Bed",
        "Bes",
        "VoucherDesc",
    ],

    "2|1|0|1": [
        "VoucherNumber",
        "VoucherDate",
        "ColCode",
        "ColDesc",
        "AccountCode",
        "AccountDesc",
        "Bed",
        "Bes",
        "VoucherDesc",
    ],

    "2|2|0|0": [
        "VoucherNumber",
        "VoucherDate",
        "ColCode",
        "ColDesc",
        "Bed",
        "Bes",
        "VoucherDesc",
    ],

    "2|2|0|1": [
        "VoucherNumber",
        "VoucherDate",
        "ColCode",
        "ColDesc",
        "AccountCode",
        "AccountDesc",
        "Bed",
        "Bes",
        "VoucherDesc",
    ],

    // ---------------- دفاتر ----------------

    "3|0|3|0": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|4|0": [
        "VoucherNumber",
        "VoucherDate",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|4|1": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|5|0": [
        "VoucherNumber",
        "VoucherDate",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|5|1": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],
    "3|0|6|0": [
        "VoucherNumber",
        "VoucherDate",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|6|1": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ], "3|0|7|0": [
        "VoucherNumber",
        "VoucherDate",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|7|1": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ], "3|0|8|0": [
        "VoucherNumber",
        "VoucherDate",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|8|1": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ], "3|0|9|0": [
        "VoucherNumber",
        "VoucherDate",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|9|1": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ], "3|0|10|0": [
        "VoucherNumber",
        "VoucherDate",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|10|1": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ], "3|0|11|0": [
        "VoucherNumber",
        "VoucherDate",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|11|1": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ], "3|0|12|0": [
        "VoucherNumber",
        "VoucherDate",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|12|1": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ], "3|0|13|0": [
        "VoucherNumber",
        "VoucherDate",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],

    "3|0|13|1": [
        "VoucherNumber",
        "VoucherDate",
        "AccountCode",
        "AccountDesc",
        "LevelCode",
        "LevelDesc",
        "DetailDesc",
        "Bed",
        "Bes",
        "RunningBalance",
    ],
};
