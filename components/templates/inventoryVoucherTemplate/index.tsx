"use client";
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Form } from 'antd';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  InventoryVoucherHeaderForm,
} from '@components/molecules/inventoryVoucher';
import { ERPTable } from '@components/organisms/erp-table';
import {
  ERPTableApi,
  ERPTableProps,
} from '@components/organisms/erp-table/ui';
import { useInitializePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import {
  useGetConditionallyMutation,
  useGetData,
} from '@services/base';
import { addNewPage } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { IPageConfig } from '@type/elementType';
import { PageTypeEnum } from '@type/enum';
import { showSuccessToast } from '@utils/core';

import {
  columnConfig,
  formConfig,
} from './config';
import { IProps } from './type';

export default function InventoryVoucherTemplate<T, K>({ ...props }: IProps) {
  const {
    caption,
    captionII,
    listUrl,
    pageIcon,
    detailFieldKey,
    headerFieldKey,
    headerGetUrl,
    detailGetUrl,
    addUrl,
    updateUrl,
  } = props;
  const [pageReady, setPageReady] = React.useState(false);
  const t = useTranslations();
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const [fetchDefault] = useGetConditionallyMutation();
  const { initPage, activePage } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      activePage: state?.withPersist?.pages?.find((item) => item.isActive),
      pages: state?.withPersist?.pages,
    }),
    shallowEqual,
  );
  const vti = activePage?.data?.voucherTypeId;
  const internal = activePage?.data?.InOut == 0 || activePage?.data?.InOut == 1;
  const NeedReference = activePage?.data?.NeedReference;
  const StockId = activePage?.pageData?.find((d) => d.name == "StockId")?.value;
  const VoucherHeaderId = activePage?.pageData?.find(
    (d) => d.name == "VoucherHeaderId",
  )?.value;
  const voucherTypeId = vti ? Number(vti) : null;
  const titleKey = "VoucherNumber";
  const recordHeight = 40;
  const formHeight = 400;
  const mobileRecordsPerPage = 20;
  const recordsPerPage = window.matchMedia("(min-width: 768px)").matches
    ? Math.floor(formHeight / recordHeight)
    : mobileRecordsPerPage;

  const storedData = activePage?.pageData;
  const pageType = PageTypeEnum.Form;
  const {
    pageId,
    RepoId,
    SystemId,
    url,
    pageState,
    originalPageState,
    Id,
    data: initData,
    returnPageId,
  } = initPage;

  const safeParse = (s: any) => {
    try {
      return typeof s === "string" && s.trim() !== "" ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  };

  const [headerId, setHeaderId] = React.useState<number | null>(null);
  const [rows, setRows] = React.useState<any[] | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [totalRecords, setTotalRecords] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(recordsPerPage);
  const [getToolbarData] = useGetConditionallyMutation();
  const [itemMutate] = useGetConditionallyMutation();
  const initializePage = useInitializePage();
  const [tableApi, setTableApi] = useState<ERPTableApi | null>(null);
  const fetchDefaultValues = async (id) => {
    let defaultData = [];
    if (id) {
      const res = await fetchDefault({
        url: headerGetUrl,
        body: {
          Id: id,
        },
      }).unwrap();
      if (res.Result == "Success") {
        const currentHeaderId = res.Data[0][headerFieldKey];
        setHeaderId(currentHeaderId);
        const correctDefaultValue = {
          ...res.Data[0],
        };
        defaultData = formConfig.map((item) => {
          const storedDataValue = storedData?.find(
            (i) => i.name === item.name,
          )?.value;

          const correctValue = storedDataValue
            ? storedDataValue
            : correctDefaultValue[item.name];

          const storedDataOriginalValue = storedData?.find(
            (i) => i.name === item.name,
          )?.originalValue;
          const correctOriginalValue = storedDataOriginalValue
            ? storedDataOriginalValue
            : correctDefaultValue[item.name];
          const newValue = {
            ...item,
            value: correctValue ?? item?.value,
            originalValue: correctOriginalValue ?? item?.originalValue,
            isTitleField: item.name === titleKey,
          };
          return newValue;
        });

        defaultData.push({
          name: headerFieldKey,
          caption: "MainIdField",
          value: id,
          originalValue: id,
          isTitleField: false,
          type: "",
        });
      } else {
        defaultData = formConfig.map((item) => ({
          ...item,
          isTitleField: item.name === titleKey,
          value: item?.value,
          originalValue: item?.originalValue,
        }));
      }
    } else {
      defaultData = formConfig.map((item) => ({
        ...item,
        isTitleField: item.name === titleKey,
        value: item?.value,
        originalValue: item?.originalValue,
      }));
    }
    return defaultData;
  };
  useEffect(() => {
    const fetchData = async () => {
      const res = await getToolbarData({
        url: "/api/menu/getToolbarData",
        body: { RepoId, SystemId, Type: pageType },
        id: RepoId,
      }).unwrap();
      if (res.Result) {
        let formData = [];
        const Config: IPageConfig =
          safeParse(res?.Data?.List?.ListProp?.[0]?.Config) ||
          ({} as IPageConfig);
        const info = {
          addEndpoint: Config.addEndpoint,
          deleteEndpoint: Config.deleteEndpoint,
          updateEndpoint: Config.updateEndpoint,
          formIdField: Config.formIdField,
        };

        formData = await fetchDefaultValues(id);
        dispatch(
          addNewPage({
            Id: Id,
            pageId,
            icon: pageIcon,
            caption: caption,
            captionII: captionII ?? "",
            pageState: pageState ? pageState : PageStateEnum.Opened,
            originalPageState: originalPageState
              ? originalPageState
              : PageStateEnum.Opened,
            type: pageType,
            pageData: formData,
            viewData: {
              PagingInfo: {
                PageNumber: 1,
                PageRecordCount: recordsPerPage,
              },
            },
            data: initData,
            RepoId,
            SystemId,
            url,
            pageInfo: info,
            listUrl,
          }),
        );
        if (!id) {
          setRows([]);
        }
        setPageReady(true);
      }
    };

    fetchData();
  }, [id]);

  const { data: details } = useGetData({
    url: detailGetUrl,
    body: {
      HeaderId: headerId,
      RepoViewId: 70003,
      PagingInfo: { PageNumber: page, PageRecordCount: pageSize },
      OrderInfo: [{ ColName: "RowNum", Asc: true }],
    },
    skip: !headerId,
  });
  const { data: totalDetails } = useGetData({
    url: detailGetUrl,
    body: {
      HeaderId: headerId,
      RepoViewId: 70003,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: pageSize,
        OnlyTotalCount: true,
      },
      OrderInfo: [{ ColName: "RowNum", Asc: true }],
    },
    skip: !headerId,
  });

  useEffect(() => {
    if (totalDetails?.Result === "Success") {
      setTotalRecords(totalDetails.TotalCount);
    }
  }, [totalDetails]);

  useEffect(() => {
    if (details?.Result === "Success") {
      const rows = details.Data as Array<Record<string, unknown>>;
      setRows(
        rows.map((item) => ({
          id: item[detailFieldKey],
          values: { ...item },
          moreDetails: { data: item },
        })),
      );
    }
  }, [details]);

  const colConfigs = useMemo(() => {
    return columnConfig(vti, internal, NeedReference, StockId, VoucherHeaderId);
  }, [vti, internal, NeedReference, StockId, VoucherHeaderId]);
  const testActor = { userId: "12", roles: ["ADMIN"] };

  function mapSnapshotToDetailsDynamic(snapshot: any) {
    return snapshot.rows
      .filter((row: any) => row.rowState !== "None")
      .map((row: any) => {
        const detail: Record<string, any> = {};
        detail.RowState = row.rowState;
        detail.ChangeFields = row.changeFields;
        if (id) {
          detail[detailFieldKey] = row.id;
        }

        Object.entries(row.cells).forEach(([col, cell]: [string, any]) => {
          if (!cell) return;

          if (col === "index") {
            detail.RowNum = cell;
            return;
          }

          const value =
            typeof cell === "object" && "value" in cell ? cell.value : cell;

          detail[col] = value;
        });

        return detail;
      });
  }

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue();
    const ChangeFields = [];

    Object.entries(formValues).forEach(([key, value]: [string, any]) => {
      if (
        storedData?.find((i) => i.name === key)?.value !==
        storedData?.find((i) => i.name === key)?.originalValue
      ) {
        ChangeFields.push(key);
      }
    });
    const payload = {
      ...formValues,
      ChangeFields,
      VoucherTypeId: voucherTypeId,
      Details: mapSnapshotToDetailsDynamic(tableApi?.getSnapshot()),
    };
    const res = await itemMutate({
      url: !id ? addUrl : updateUrl,
      body: payload,
    }).unwrap();
    if (res?.Result == "Success") {
      showSuccessToast(t("toast.successTitle"), t(caption));

      initializePage({
        config: {
          ...initData,
          RepoId: activePage.RepoId,
          SystemId: activePage.SystemId,
          url: listUrl,
          pageId: returnPageId,
          data: initData,
        },
      });
    }
  };

  // const { data: renderUnitData } = useGetData<IPlaceConfig[], null>({
  //   url: `/api/mng/select/placeConfigValue`,
  //   body: {},
  // });
  // const rowAccess = {
  //   denyRoles: ["VIEWER"],
  // allowRoles: ["ADMIN"],
  // rule(ctx) {
  //   return false;
  // },
  // };
  useEffect(() => {
    if (!tableApi) {
      return;
    }
    const unsubscribe = tableApi.subscribeColumn<number>(
      "Quantity1",
      (values) => {
        console.log("COLUMN CHANGED:", values);
      },
    );
    return () => {
      unsubscribe?.();
    };
  }, [tableApi]);

  const prop = useMemo<ERPTableProps<IMoreProps>>(
    () => ({
      actor: testActor,
      store: "inventoryVoucher",
      tableKey: params.get("id") ?? activePage?.pageId ?? "",
      rows,
      columns: colConfigs,
      totalRecord: totalRecords,
      page,
      pageSize,
      tableHeight: formHeight,
      totalRecords,
      onPageChange: (e) => {
        setPage(e);
      },
      onPageSizeChange: (p, s) => {
        setPageSize(s);
      },
      // rowAccess,
      // tableHeight:100,
      // recordPerPage:6
    }),
    [colConfigs, rows],
  );
  return (
    <div className="relative">
      <button
        className="-top-14 absolute flex bg-black-black95 hover:bg-white px-3 py-[6px] border hover:border-black-black95 rounded text-white hover:text-black-black95 cursor-pointer -end-3 item-center"
        onClick={handleSubmit}
      >
        {t("general.submit")}
      </button>
      <InventoryVoucherHeaderForm form={form} />
      {pageReady && activePage?.pageId && StockId && rows !== null && (
        <ERPTable<IMoreProps>
          {...prop}
          moreDetailComponent={More}
          onReady={(api) => {
            setTableApi(api);
          }}
        />
      )}
    </div>
  );
}

interface IMoreProps {
  data: unknown
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  return String(value);
};

const More = ({ data }: IMoreProps) => {
  const actualData =
    typeof data === "object" &&
    data !== null &&
    "data" in data
      ? (data as any).data
      : data;

  const entries = Object.entries(actualData as Record<string, unknown>);
  return (
    <div
      className="gap-x-6 gap-y-3 grid grid-1 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 border border-slate-200 rounded-[10px] w-full text-[13px] [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]"
    >
      {entries.map(([key, value]) => {
        if (value === null || value === undefined) return null;

        if (typeof value === "object" && !Array.isArray(value)) {
          const nestedEntries = Object.entries(
            value as Record<string, unknown>,
          );

          return (
            <div
              key={key}
              style={{
                border: "1px solid #f1f5f9",
                borderRadius: 8,
                padding: 12,
                background: "#f9fafb",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#334155",
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: 4,
                }}
              >
                {key}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                }}
              >
                {nestedEntries.map(([nKey, nValue]) => (
                  <div key={nKey}>
                    <span style={{ color: "#64748b" }}>{nKey}:</span>{" "}
                    <strong style={{ color: "#0f172a" }}>
                      {formatValue(nValue)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={key}>
            <span style={{ color: "#64748b" }}>{key}:</span>{" "}
            <strong style={{ color: "#0f172a" }}>{formatValue(value)}</strong>
          </div>
        );
      })}
    </div>
  );
};
