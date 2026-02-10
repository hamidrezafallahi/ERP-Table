"use client";
import React, {
  useEffect,
  useMemo,
  useRef,
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
  useFullScreen,
  useNavigatePage,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { useGetConditionallyMutation } from '@services/base';
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
  const { caption, url, listUrl, pageIcon } = props;
  const [pageReady, setPageReady] = React.useState(false);
  const t = useTranslations();
  const dispatch = useDispatch();
  const toggleFullScreen = useFullScreen();
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
  const vti = activePage?.data?.voucherTypeId;
  const internal = activePage?.data?.InOut == 0 || activePage?.data?.InOut == 1;
  const NeedReference = activePage?.data?.NeedReference;
  const StockId = activePage?.pageData?.find(d=>d.name == 'StockId')?.value
  const InvoiceHeaderId = activePage?.pageData?.find(d=>d.name == 'InvoiceHeaderId')?.value
  const voucherTypeId = vti ? Number(vti) : null;
  const titleKey = "VoucherNumber";
  const fieldKey = "VoucherHeaderId";
  const getUrl = "api/inv/select/voucher/header";
  const getDetailUrl = "api/inv/select/voucher/detail";
  const addUrl = "api/inv/insert/voucher";
  const updateUrl = "api/inv/update/voucher";
  const deleteUrl = "api/inv/delete/voucher";
  const info = {
    addEndpoint: addUrl,
    deleteEndpoint: deleteUrl,
    updateEndpoint: updateUrl,
    formIdField: fieldKey,
  };
  const recordHeight = 40;
  const deviceHeight = window.innerHeight;
  const formHeight = 200;
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
    url: BaseUrl,
    pageState,
    originalPageState,
  } = initPage;

  const safeParse = (s: any) => {
    try {
      return typeof s === "string" && s.trim() !== "" ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  };

  const [getToolbarData] = useGetConditionallyMutation();
  const [itemMutate] = useGetConditionallyMutation();
  const { navigateBack } = useNavigatePage();
  const tableApiRef = useRef(null);
  const fetchDefaultValues = async (id) => {
    let defaultData = [];
    const res = await fetchDefault({
      url: getUrl,
      body: {
        Id: id,
      },
    }).unwrap();
    if (res.Result == "Success") {
      const temp = res.Data[0];
      const detailRes = await fetchDefault({
        url: getDetailUrl,
        body: {
          HeaderId: temp[fieldKey],
          RepoViewId: 70003,
          PagingInfo: {
            PageNumber: 1,
            PageRecordCount: recordsPerPage,
          },
        },
      }).unwrap();
      if (detailRes.Result == "Success") {
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
            value:
              item.name == "Details"
                ? detailRes.Data
                : (correctValue ?? item?.value),
            originalValue:
              item.name == "Details"
                ? detailRes.Data
                : (correctOriginalValue ?? item?.originalValue),
            isTitleField: item.name === titleKey,
          };
          return newValue;
        });

        defaultData.push({
          name: fieldKey,
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
      return defaultData;
    } else {
      return [];
    }
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
        if (id) {
          formData = await fetchDefaultValues(id);
        }
        dispatch(
          addNewPage({
            pageId,
            icon: pageIcon,
            caption: caption,
            captionII: initPage.caption ?? "",
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
            data: initPage.data,
            RepoId,
            SystemId,
            url: BaseUrl,
            pageInfo: info,
            listUrl,
          }),
        );
        setPageReady(true);
      }
    };

    fetchData();
  }, []);
  const { Details } = useAppSelector(
    (state) => ({
      Details: state?.withPersist?.pages
        ?.find((item) => item.isActive)
        ?.pageData?.find((i) => i.name === "Details")?.value,
    }),
    shallowEqual,
  );

  const rows = useMemo(() => {
    const correctArray = Details?.map((_, i) => ({
      id: _.RowNum,
      values: {
        ..._,
      },
    }));
    return correctArray ?? [];
  }, [Details]);
  const colConfigs = useMemo(() => {
    return columnConfig(vti, internal, NeedReference, StockId, InvoiceHeaderId);
  }, [vti, internal, NeedReference, StockId, InvoiceHeaderId]);
  const testActor = { userId: "12", roles: ["ADMIN"] };

  function mapSnapshotToDetailsDynamic(snapshot: any) {
    return snapshot.rows.map((row: any) => {
      const detail: Record<string, any> = {};
      detail.RowState = row.rowState;
      detail.ChangeFields = row.changeFields;
      Object.entries(row.cells).forEach(([col, cell]: [string, any]) => {
        if (!cell || cell === undefined || cell === null || cell === "") {
          return;
        }
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
    const payload = {
      ...formValues,
      VoucherTypeId: voucherTypeId,
      Details: mapSnapshotToDetailsDynamic(tableApiRef.current),
    };
    const res = await itemMutate({
      url: addUrl,
      body: payload,
    }).unwrap();
    if (res?.Result == "Success") {
      showSuccessToast(t("toast.successTitle"), caption);
      navigateBack();
    }
  };

  // const { data: renderUnitData } = useGetData<IPlaceConfig[], null>({
  //   url: `/api/mng/select/placeConfigValue`,
  //   body: {},
  // });

  const prop = useMemo(() => {
    return {
      actor: testActor,
      store: "inventoryVoucher",
      tableKey: params.get("id") ?? activePage?.pageId,
      rows,
      columns: colConfigs,
    };
  }, [activePage?.pageId, colConfigs]);


  return (
    <div className="relative">
      <button
        className="-top-14 absolute flex bg-black-black95 hover:bg-white px-3 py-[6px] border hover:border-black-black95 rounded text-white hover:text-black-black95 cursor-pointer -end-3 item-center"
        onClick={handleSubmit}
      >
        {t("general.submit")}
      </button>
      <InventoryVoucherHeaderForm form={form} />
      {pageReady && activePage?.pageId && StockId && InvoiceHeaderId && (
        <ERPTable
          {...prop}
          onReady={(api) => {
            tableApiRef.current = api.getSnapshot();
          }}
        />
      )}
    </div>
  );
}
