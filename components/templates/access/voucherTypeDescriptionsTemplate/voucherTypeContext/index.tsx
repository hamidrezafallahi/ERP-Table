"use client";

import { useEffect, useRef, useState } from "react";
import { Divider, Form, Pagination } from "antd";
import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";
import { CustomButton, CustomModal } from "@components/atoms/defaultElements";
import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import {
  LeftChevron,
  Play,
  RightChevron,
} from "@components/atoms/iconComponents";
import Confirmation from "@components/molecules/confirmation";
import {
  CardDynamicModal,
  TableDynamicModal,
} from "@components/molecules/dynamicModal";
import { ActionLabelsEnum } from "@components/organisms/list/enum";
import { useAppSelector } from "@redux/index";
import {
  apiService,
  useCUDDataMutation,
  useGetData,
  useGetInfinite,
} from "@services/base";
import type { IToolbarMenu } from "@type/toolbar";
import { showSuccessToast } from "@utils/core";
import type { IDynamicModalConfig } from "./type";
import CustomFormVoucherType from "./customFormVoucherType";
import IVoucherTypeItem from "./type";

export default function VoucherTypeContext({ voucherTypeId }) {
  const t = useTranslations();
  const [form] = Form.useForm();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);

  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = useState<number>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const [perPageCount, setPerPageCount] = useState(10);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { match, locale } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const locale = state.withPersist.config.lang;
    return { match, locale };
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight;
    const rowHeight = match ? 48 : 150;
    const count = Math.max(1, Math.floor(containerHeight / rowHeight));
    setPerPageCount(count);
  }, [match]);

  useEffect(() => {
    const calculate = () => {
      if (!containerRef.current) return;
      const containerHeight = containerRef.current.clientHeight;
      const rowHeight = match ? 48 : 150;
      const count = Math.max(1, Math.floor(containerHeight / rowHeight));
      setPerPageCount(count);
    };
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [match]);

useEffect(() => {
  console.log("REYHAN USE EFFECT");
}, []);  

  // const perPageCount = 3;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const config: IDynamicModalConfig = {
    fieldKey: "VocherTypeDescItemId",
    staticKey: "voucherTypeId",
    deleteUrl: "/api/acc/delete/voucherdescriptions",
    createUrl: "/api/acc/insert/voucherTypeDescriptions",
    updateUrl: "",
    listConfig: {
      repoViewId: null,
      RepoId: 0,
      selectUrl: `/api/acc/select/voucherTypeDescriptions`,
      body: { voucherTypeId },
      column: [{ fieldName: "Desc", fieldCaption: "شرح", fieldType: "string" }],
      IsDefault: true,
      IsDisableAutoRefresh: false,
      IsDisableCommentCount: false,
      IsDisableSidebarStats: false,
      IsDisableCount: false,
    },
    formConfig: { fields: [] },
    actions: [
      {
        MenuId: null,
        Icon: '<svg\r\n      xmlns="httpwww.w3.org/2000/svg"\r\n      width="18"\r\n      height="18"\r\n      viewBox="0 0 18 18"\r\n      fill="none"\r\n    >\r\n      <path\r\n        d="M15.3751 4.5H2.625"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n      />\r\n      <path\r\n        d="M14.125 6.375L13.78 11.5493C13.6473 13.5405 13.5809 14.5361 12.9322 15.1431C12.2834 15.75 11.2856 15.75 9.29001 15.75H8.70999C6.71439 15.75 5.71659 15.75 5.06783 15.1431C4.41907 14.5361 4.3527 13.5405 4.21996 11.5493L3.875 6.375"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n      />\r\n      <path\r\n        opacity="0.5"\r\n        d="M4.875 4.5C4.91691 4.5 4.93786 4.5 4.95686 4.49952C5.57444 4.48387 6.11927 4.09118 6.32941 3.51024C6.33588 3.49237 6.3425 3.47249 6.35576 3.43273L6.42857 3.21429C6.49073 3.02781 6.52181 2.93457 6.56304 2.8554C6.72751 2.53955 7.03181 2.32023 7.38346 2.26407C7.4716 2.25 7.56988 2.25 7.76645 2.25H10.2336C10.4301 2.25 10.5284 2.25 10.6165 2.26407C10.9682 2.32023 11.2725 2.53955 11.437 2.8554C11.4782 2.93457 11.5093 3.02781 11.5714 3.21429L11.6442 3.43273C11.6575 3.47244 11.6641 3.49238 11.6706 3.51024C11.8807 4.09118 12.4256 4.48387 13.0431 4.49952C13.0621 4.5 13.0831 4.5 13.125 4.5"\r\n        stroke="#585858"\r\n      />\r\n    </svg>',
        ActionId: null,
        MenuDesc: "حذف",
        key: "حذف",
        FatherId: null,
        MenuType: null,
        WebLink: "",
        loggedInUserId: null,
      },
    ],
  };

  

  const {
    data: tableData,
    isLoading: tableIsLoading,
    refetch: reload,
  } = useGetData<IVoucherTypeItem[], null>({
    url: config.listConfig.selectUrl,
    body: {
      ...config.listConfig.body,
      RepoViewId: config.listConfig.repoViewId,
      RepoId: config.listConfig.RepoId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
      },
    },
  });

  const { data: tableTotal } = useGetData<IVoucherTypeItem[], null>({
    url: config.listConfig.selectUrl,
    body: {
      ...config.listConfig.body,
      RepoViewId: config.listConfig.repoViewId,
      RepoId: config.listConfig.RepoId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
        OnlyTotalCount: true,
      },
    },
  });

  const { data: cardData, isFetching: cardIsFetching } = useGetInfinite<
    unknown[],
    null
  >({
    url: config.listConfig.selectUrl,
    body: {
      ...config.listConfig.body,
      RepoViewId: config.listConfig.repoViewId,
      RepoId: config.listConfig.RepoId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
      },
    },
    skip: !match || voucherTypeId === undefined,
  });

  useEffect(() => {
    if (
      !match &&
      cardData?.Data?.length > 0 &&
      cardData?.Data?.length < tableTotal?.TotalCount &&
      cardData?.ReturnCount === perPageCount
    ) {
      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && !cardIsFetching) {
          setPageNumber((prevState) => prevState + 1);
        }
      };
      observer.current = new IntersectionObserver(observerCallback);
      const currentLastItem = lastItemRef.current;
      if (currentLastItem) observer.current.observe(currentLastItem);
      return () => {
        if (observer.current && currentLastItem)
          observer.current.unobserve(currentLastItem);
      };
    }
  }, [cardIsFetching, pageNumber, match]);

  useEffect(() => {
    if (!voucherTypeId) {
      setPageNumber(1);
    }
  }, [voucherTypeId]);

  useEffect(() => {
    if (pageNumber > 1 && tableData?.Data?.length === 0) {
      setPageNumber((prevState) => prevState - 1);
    }
  }, [tableData?.Data]);

  const [triggerItem, { isLoading: triggerIsLoading }] = useCUDDataMutation();

  const handleActionClick = (action: IToolbarMenu, id: number) => {
    setSelectedId(id);
    if (action.MenuDesc === ActionLabelsEnum.Delete) {
      match ? setIsConfirmModalOpen(true) : setIsConfirmDrawerOpen(true);
    }
  };
  const handleConfirmation = async () => {
    try {
      const confirmResult = await triggerItem({
        url: config.deleteUrl,
        body: { Id: selectedId },
      }).unwrap();

      if (confirmResult.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        setSelectedId(null);
        (dispatch as any)(
          apiService.util.updateQueryData(
            "getInfinite",
            {
              url: config.listConfig.selectUrl,
              body: {
                RepoViewId: config.listConfig.repoViewId,
                RepoId: config.listConfig.RepoId,
              },
              id: "All",
            },
            (draft) => {
              if (draft?.Data) draft.Data = [];
            },
            false,
          ),
        );

        setPageNumber(1);
        await reload();
      }
      setIsConfirmModalOpen(false);
      setIsConfirmDrawerOpen(false);
    } catch (error) {
      null;
    }
  };

  const tableDataWithDesc = tableData?.Data?.map((item) => ({
    ...item,
  }));
  return (
    <>
      <div className="flex flex-col gap-2 m-2" ref={containerRef}>
        <div className="flex gap-2 mb-3 item-center">
          <Play />
          <p className="-mt-[6px] font-bold text-gray-gray135 text-sm">
            {t("general.newItem")}
          </p>
        </div>
        <CustomFormVoucherType voucherTypeId={voucherTypeId} form={form} />
        <Divider className="m-2" />
        {!match ? (
          <CardDynamicModal
            actions={config.actions}
            columnsList={config.listConfig}
            data={cardData?.Data}
            onActionClick={handleActionClick}
            fieldKey={config.fieldKey}
            staticKey={config.staticKey}
            ref={lastItemRef}
          />
        ) : (
          <TableDynamicModal
            isLoading={tableIsLoading}
            actions={config.actions}
            columnsList={config.listConfig}
            data={tableDataWithDesc}
            handleAction={handleActionClick}
            locale={locale}
            fieldKey={config.fieldKey}
          />
        )}
        {tableData && tableTotal?.TotalCount > perPageCount && (
          <Pagination
            className="flex justify-end"
            prevIcon={
              <CustomButton className="self-end m-0 p-0 rounded w-fit">
                <RightChevron />
              </CustomButton>
            }
            nextIcon={
              <CustomButton className="m-0 p-0 w-fit">
                <LeftChevron />
              </CustomButton>
            }
            current={pageNumber}
            jumpNextIcon={<span>...</span>}
            jumpPrevIcon={<span>...</span>}
            pageSize={perPageCount}
            total={tableTotal?.TotalCount}
            showSizeChanger={false}
            onChange={(page) => setPageNumber(page)}
            showTitle={false}
          />
        )}
      </div>
      {isConfirmModalOpen && (
        <CustomModal
          width={300}
          disableTitle
          centered
          closeModal={() => setIsConfirmModalOpen(false)}
          isModalOpen={isConfirmModalOpen}
          content={
            <Confirmation
              itemsToConfirm={selectedId}
              onCancel={() => setIsConfirmModalOpen(false)}
              onConfirm={handleConfirmation}
              onLoading={triggerIsLoading}
            />
          }
        />
      )}

      <CustomDrawer
        isOpen={isConfirmDrawerOpen}
        onClose={() => setIsConfirmDrawerOpen(false)}
        content={
          <Confirmation
            itemsToConfirm={selectedId}
            onCancel={() => setIsConfirmDrawerOpen(false)}
            onConfirm={handleConfirmation}
            onLoading={triggerIsLoading}
          />
        }
      />
    </>
  );
}
