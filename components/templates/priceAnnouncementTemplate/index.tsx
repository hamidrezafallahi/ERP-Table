"use client";
import {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { Form } from 'antd';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { shallowEqual } from 'react-redux';

import {
  ClipboardIcon,
} from '@components/atoms/iconComponents/icons/ClipboardIcon';
import {
  PriceAnnouncementForm,
} from '@components/molecules/salesAndPurchase/priceAnnouncementForm';
import { ERPTable } from '@components/organisms/erp-table/ui/erp-table';
import { useInitializePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { useGetConditionallyMutation } from '@services/base';
import { IBaseRequest } from '@services/base/type';
import { PageTypeEnum } from '@type/enum';
import { showSuccessToast } from '@utils/core';

import {
  columnConfig,
  formConfig,
} from './config';
import { IProps } from './type';
import { usePageLoader } from './usePageLoader';

export default function PriceAnnouncementTemplate<T, K>({ ...props }: IProps) {
  const { caption, listUrl, pageIcon } = props;
  const t = useTranslations();
  const [form] = Form.useForm();
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const { initPage, activePage, match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      activePage: state?.withPersist?.pages?.find((item) => item.isActive),
      pages: state?.withPersist?.pages,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );
  const recordHeight = 40;
  const addUrl = "api/sale/insert/SaleQuotation";
  const updateUrl = "api/sale/insert/SaleQuotation";
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
  const { VoucherNumber, CustomerId, VoucherDate, VoucherDesc } =
    useAppSelector((state) => {
      const active = state.withPersist.pages?.find((page) => page.isActive);
      const pageData = active?.pageData;
      const VoucherNumber = pageData?.find(
        (d) => d.name === "VoucherNumber",
      )?.value;
      const CustomerId = pageData?.find((d) => d.name === "CustomerId")?.value;
      const VoucherDate = pageData?.find(
        (d) => d.name === "VoucherDate",
      )?.value;
      const VoucherDesc = pageData?.find(
        (d) => d.name === "VoucherDesc",
      )?.value;
      const Details = pageData?.find((d) => d.name === "Details")?.value;
      return {
        VoucherNumber,
        CustomerId,
        VoucherDate,
        VoucherDesc,
        Details,
      };
    }, shallowEqual);

  const [itemMutate] = useGetConditionallyMutation();

  // for control table without re-render
  const tableApiRef = useRef(null);

  // save page in redux and navigation - chnage url - save
  const initializePage = useInitializePage();

  const colConfigs = useMemo(() => {
    return columnConfig(CustomerId);
  }, [CustomerId]);

  // hook get data when i have edit
  const { loadPage, prop } = usePageLoader({
    formConfig,
    storedData,
    fieldKey: "PriceAnnouncementHeaderId",
    titleKey: "PriceAnnouncement",
    recordsPerPage: recordsPerPage,
    getUrl: "api/sale/SaleQuotation",
    getDetailUrl: "api/sale/select/SaleQuatation/Detail",
    testActor: { userId: "12", roles: ["ADMIN"] },
    storeName: "priceAnnouncment",
    params,
    activePage,
    colConfigs,
  });

  // Loading page and form
  useEffect(() => {
    loadPage({
      pageId,
      pageType,
      pageIcon,
      caption,
      initPage,
      id,
      RepoId,
      SystemId,
      BaseUrl,
      listUrl,
    });
  }, []);

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
    const payload: IBaseRequest<any> = {
      VoucherNumber,
      CustomerId,
      VoucherDate,
      VoucherDesc,
      Details: mapSnapshotToDetailsDynamic(tableApiRef.current),
    };
    const res = await itemMutate({
      url: id ? updateUrl : addUrl,
      body: payload,
    }).unwrap();
    if (res?.Result == "Success") {
      showSuccessToast(t("toast.successTitle"), caption);
      initializePage({
        config: {
          RepoId: activePage.RepoId,
          SystemId: activePage.SystemId,
          url: activePage.listUrl,
          pageId: activePage.returnPageId,
          Id: id,
        },
      });
    }
  };

  return (
    <div className="relative flex flex-col gap-5">
      <button
        className="-top-14 absolute flex bg-black-black95 hover:bg-white px-3 py-[6px] border hover:border-black-black95 rounded text-white hover:text-black-black95 cursor-pointer -end-3 item-center"
        onClick={handleSubmit}
      >
        {t("general.submit")}
      </button>
      <PriceAnnouncementForm form={form} />
      {activePage?.pageId && CustomerId && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <ClipboardIcon config={{ stroke: "#585858" }} />
            <span className="font-medium text-gray-gray10 text-xs"></span>
            {t("general.priceAnnouncementDetail")}
          </div>
          <ERPTable
            {...prop}
            onReady={(api) => {
              tableApiRef.current = api.getSnapshot();
            }}
          />
        </div>
      )}
    </div>
  );
}
