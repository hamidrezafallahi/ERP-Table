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
  VoucherForm,
  VoucherResult,
} from '@components/molecules/accounting';
import ExpandedButton from '@components/molecules/expandedButton';
import {
  ERPTable,
  ERPTableApi,
  ERPTableProps,
} from '@components/organisms/erp-table/ui';
import { useInitializePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { useGetConditionallyMutation } from '@services/base';
import { addNewPage } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { IPageConfig } from '@type/elementType';
import { PageTypeEnum } from '@type/enum';
import {
  showErrorToast,
  showSuccessToast,
} from '@utils/core';

import {
  columnConfig,
  formConfig,
} from './config';
import { IProps } from './type';

export default function VoucherTemplate<T, K>({ ...props }: IProps) {
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
    tableTitle,
  } = props;

  const [pageReady, setPageReady] = React.useState(false);
  const [rows, setRows] = React.useState<any[] | null>(null);
  const [sum, setSum] = React.useState<{ bed: number; bes: number }>({
    bed: 0,
    bes: 0,
  });
  const [getToolbarData] = useGetConditionallyMutation();
  const [itemMutate] = useGetConditionallyMutation();
  const initializePage = useInitializePage();
  const [tableApi, setTableApi] = useState<ERPTableApi | null>(null);
  const t = useTranslations();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const [fetchDefault] = useGetConditionallyMutation();
  const { initPage, activePage, match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      activePage: state?.withPersist?.pages?.find((item) => item.isActive),
      pages: state?.withPersist?.pages,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );
  const VoucherDate = activePage?.pageData?.find(
    (d) => d.name == "VoucherDate",
  )?.value;
  const VoucherTypeId = activePage?.pageData?.find(
    (d) => d.name == "VoucherTypeId",
  )?.value;

  const recordHeight = 40;
  const deviceHeight = window.innerHeight;
  const formHeight = 300;
  const mobileRecordsPerPage = 100;
  const recordsPerPage = !match
    ? mobileRecordsPerPage
    : Math.floor((deviceHeight - formHeight) / recordHeight);
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
  const fetchDefaultValues = async (id) => {
    let defaultData = [];
    if (id) {
      const res = await fetchDefault({
        url: headerGetUrl,
        body: {
          Id: id,
          RepoViewId: 10011,
          ShowBookmarked: true,
          ShowTags: true,
        },
      }).unwrap();
      if (res.Result == "Success") {
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
            isTitleField: item.name === headerFieldKey,
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
          isTitleField: item.name === headerFieldKey,
          value: item?.value,
          originalValue: item?.originalValue,
        }));
      }
    } else {
      defaultData = formConfig.map((item) => ({
        ...item,
        isTitleField: item.name === headerFieldKey,
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
  }, []);

  const fetchDefaultDetails = async (headerId: number) => {
    const detailRes = await fetchDefault({
      url: detailGetUrl,
      body: {
        HeaderId: headerId,
        RepoViewId: 70003,
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: recordsPerPage,
        },
      },
    }).unwrap();

    if (detailRes.Result === "Success") {
      const bed = detailRes.Data.reduce(
        (acc, curr) => acc + (curr.Bed || 0),
        0,
      );
      const bes = detailRes.Data.reduce(
        (acc, curr) => acc + (curr.Bed || 0),
        0,
      );
      setSum({ bed, bes });
      return detailRes.Data ?? [];
    }

    return [];
  };

  useEffect(() => {
    if (id === 0) return;
    const loadDetails = async () => {
      const details = await fetchDefaultDetails(id);
      const mappedRows = details.map((item, i) => ({
        id: item[detailFieldKey],
        values: { ...item },
        moreDetails: {
          data: item,
        },
      }));
      setRows(mappedRows);
    };
    loadDetails();
  }, [id]);

  const colConfigs = useMemo(() => {
    return columnConfig(t);
  }, []);
  const testActor = { userId: "12", roles: ["ADMIN"] };

  function mapSnapshotToDetailsDynamic(snapshot: any) {
    return snapshot.rows
      .filter((row: any) => row.rowState !== "None")
      .map((row: any) => {
        const detail: Record<string, any> = {};
        detail.RowState = row.rowState;
        detail.ChangeFields = row.changeFields;
        if (id && row.rowState !== "Add") {
          detail[detailFieldKey] = row.id;
        }
        Object.entries(row.cells).forEach(([col, cell]: [string, any]) => {
          if (cell == null || cell == undefined) return;
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
    const validationFn = tableApi?.validation();
    validationFn(async (result) => {
      if (!result.valid) {
        showErrorToast("فیلد های جدول ایراد دارد");
        return;
      } else {
        const formValues = Object.fromEntries(
          Object.entries(form.getFieldsValue()).filter(
            ([key, value]) => value !== null && value !== undefined,
          ),
        );
        const ChangeFields = [];

        Object.entries(formValues).forEach(([key, value]: [string, any]) => {
          if (
            storedData?.find((i) => i.name === key)?.value !==
              storedData?.find((i) => i.name === key)?.originalValue &&
            id !== 0
          ) {
            ChangeFields.push(key);
          }
        });
        const payload = {
          ...formValues,
          ChangeFields: ChangeFields.length > 0 ? ChangeFields : undefined,
          Details: mapSnapshotToDetailsDynamic(tableApi?.getSnapshot()),
          VoucherHeaderId: id !== 0 ? id : undefined,
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
      }
    });
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
    const unsubscribe1 = tableApi.subscribeColumn<{
      id: number;
      rowNum: number;
      value: number;
    }>("Bed", (values) => {
      setSum((prev) => ({
        ...prev,
        bed: values.reduce((acc, curr) => acc + (curr.value || 0), 0),
      }));
    });
    const unsubscribe2 = tableApi.subscribeColumn<{
      id: number;
      rowNum: number;
      value: number;
    }>("Bes", (values) => {
      setSum((prev) => ({
        ...prev,
        bes: values.reduce((acc, curr) => acc + (curr.value || 0), 0),
      }));
    });
    return () => {
      unsubscribe1?.();
      unsubscribe2?.();
    };
  }, [tableApi]);

  const prop = useMemo<ERPTableProps>( //<IMoreProps>>(
    () => ({
      actor: testActor,
      store: "Voucher",
      tableKey: params.get("id") ?? activePage?.pageId ?? "",
      rows,
      columns: colConfigs,
      tableHeight: formHeight,
      tableTitle,
      // rowAccess,
      // tableHeight:100,
      // recordPerPage:6
    }),
    [activePage?.pageId, colConfigs, rows],
  );
  return (
    <div className="relative">
      <div className="-top-14 absolute flex gap-2 -end-3 item-center">
        <ExpandedButton />
        <button
          className="bg-black-black95 hover:bg-white px-3 py-1 border hover:border-black-black95 rounded text-white hover:text-black-black95 cursor-pointer"
          onClick={handleSubmit}
        >
          {t("general.submit")}
        </button>
      </div>
      <VoucherForm form={form} />

      {pageReady &&
        activePage?.pageId &&
        VoucherTypeId &&
        VoucherDate &&
        rows !== null && (
          <ERPTable //<IMoreProps>
            {...prop}
            // moreDetailComponent={More}
            onReady={(api) => {
              setTableApi(api);
            }}
          />
        )}
      <div className="-bottom-20 absolute start-0">
        <VoucherResult
          balance={sum.bes - sum.bed}
          totalCredit={sum.bes}
          totalDebit={sum.bed}
        />
      </div>
    </div>
  );
}
// interface IMoreProps {
//   data: unknown;
// }

// const More = ({ data }: IMoreProps) => {
//   const moreDetail = data;
//   console.log(moreDetail);
//   return <>test</>;
// };
