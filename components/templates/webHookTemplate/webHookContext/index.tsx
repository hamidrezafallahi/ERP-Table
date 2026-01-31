"use client";

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Divider,
  Form,
  Pagination,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import { CustomDrawer } from '@components/atoms/defaultElements/drawer';
import {
  LeftChevron,
  Play,
  RightChevron,
} from '@components/atoms/iconComponents';
import Confirmation from '@components/molecules/confirmation';
import {
  CardDynamicModal,
  TableDynamicModal,
} from '@components/molecules/dynamicModal';
import { ActionLabelsEnum } from '@components/organisms/list/enum';
import { useAppSelector } from '@redux/index';
import {
  apiService,
  useCUDDataMutation,
  useGetData,
  useGetInfinite,
} from '@services/base';
import type { IToolbarMenu } from '@type/toolbar';
import {
  getSystemNameById,
  showSuccessToast,
} from '@utils/core';

import CustomFormWebHook from './customFormWebHook';
import type { IDynamicModalConfig } from './type';
import IWebHookItem from './type';

export default function WebHookContext({ systemId, selectedGoodId }) {
  const t = useTranslations();
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState<IWebHookItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"Delete" | "Confirm">(
    "Delete"
  );

  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = useState<number>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { match, locale } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const locale = state.withPersist.config.lang;
    return { match, locale };
  });

  const mapSendType = { 1: "POST", 2: "DELETE", 3: "GET" };
  const mapParamType = {
    1: "QueryParam",
    2: "JsonBody",
    3: "FormData",
    4: "FormURL",
    5: "NONE",
  };
  const mapOpMode = { 1: "Add/Insert", 2: "Update/Edit", 3: "Delete" };

  const perPageCount = 3;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  // const exactFieldKey = config.sourceFieldKey
  //   ? config.sourceFieldKey
  //   : sourceKey;

  const config: IDynamicModalConfig = {
    fieldKey: "WebHookId",
    staticKey: "RelatedPersonName",
    deleteUrl: `/api/${getSystemNameById(systemId)}/delete/webHook`,
    createUrl: `/api/${getSystemNameById(systemId)}/insert/webHook`,
    updateUrl: `/api/${getSystemNameById(systemId)}/update/webHook`,
    listConfig: {
      repoViewId: null,
      RepoId: selectedGoodId,
      selectUrl: `/api/${getSystemNameById(systemId)}/select/webHook`,
      column: [
        {
          fieldName: "Name",
          fieldCaption: t("general.title"),
          fieldType: "string",
        },
        {
          fieldName: "EndPoint",
          fieldCaption: "EndPoint",
          fieldType: "string",
        },
        {
          fieldName: "SendType",
          fieldCaption: t("general.typeOfExtension"),
          fieldType: "string",
        },
        {
          fieldName: "ParamType",
          fieldCaption: t("general.parameterType"),
          fieldType: "string",
        },
        {
          fieldName: "OpMode",
          fieldCaption: t("general.operationType"),
          fieldType: "string",
        },
      ],
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
        Icon: ' <svg\r\n      xmlns="http://www.w3.org/2000/svg"\r\n      width="18"\r\n      height="18"\r\n      viewBox="0 0 15 15"\r\n      fill="none"\r\n    >\r\n      <path\r\n        d="M5.50015 2H3.40015C2.56007 2 2.13972 2 1.81885 2.16349C1.5366 2.3073 1.3073 2.5366 1.16349 2.81885C1 3.13972 1 3.56007 1 4.40015V11.6001C1 12.4402 1 12.86 1.16349 13.1809C1.3073 13.4632 1.5366 13.6929 1.81885 13.8367C2.1394 14 2.55925 14 3.39768 14H10.6023C11.4408 14 11.86 14 12.1805 13.8367C12.4628 13.6929 12.6929 13.4629 12.8367 13.1807C13 12.8601 13 12.4408 13 11.6023V9.5M10 2.75L5.5 7.25V9.5H7.75L12.25 5M10 2.75L12.25 0.5L14.5 2.75L12.25 5M10 2.75L12.25 5"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n        strokeLinejoin="round"\r\n      />\r\n    </svg>',
        ActionId: null,
        MenuDesc: "ویرایش",
        key: "ویرایش",
        FatherId: null,
        MenuType: null,
        loggedInUserId: null,
      },
      {
        MenuId: null,
        Icon: '<svg\r\n      xmlns="http://www.w3.org/2000/svg"\r\n      width="18"\r\n      height="18"\r\n      viewBox="0 0 18 18"\r\n      fill="none"\r\n    >\r\n      <path\r\n        d="M15.3751 4.5H2.625"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n      />\r\n      <path\r\n        d="M14.125 6.375L13.78 11.5493C13.6473 13.5405 13.5809 14.5361 12.9322 15.1431C12.2834 15.75 11.2856 15.75 9.29001 15.75H8.70999C6.71439 15.75 5.71659 15.75 5.06783 15.1431C4.41907 14.5361 4.3527 13.5405 4.21996 11.5493L3.875 6.375"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n      />\r\n      <path\r\n        opacity="0.5"\r\n        d="M4.875 4.5C4.91691 4.5 4.93786 4.5 4.95686 4.49952C5.57444 4.48387 6.11927 4.09118 6.32941 3.51024C6.33588 3.49237 6.3425 3.47249 6.35576 3.43273L6.42857 3.21429C6.49073 3.02781 6.52181 2.93457 6.56304 2.8554C6.72751 2.53955 7.03181 2.32023 7.38346 2.26407C7.4716 2.25 7.56988 2.25 7.76645 2.25H10.2336C10.4301 2.25 10.5284 2.25 10.6165 2.26407C10.9682 2.32023 11.2725 2.53955 11.437 2.8554C11.4782 2.93457 11.5093 3.02781 11.5714 3.21429L11.6442 3.43273C11.6575 3.47244 11.6641 3.49238 11.6706 3.51024C11.8807 4.09118 12.4256 4.48387 13.0431 4.49952C13.0621 4.5 13.0831 4.5 13.125 4.5"\r\n        stroke="#585858"\r\n      />\r\n    </svg>',
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

  const { data: tableData, isLoading: tableIsLoading } = useGetData<
    IWebHookItem[],
    null
  >({
    url: config.listConfig.selectUrl,
    body: config.listConfig.body
      ? {
          ...config.listConfig.body,
          RepoViewId: config.listConfig.repoViewId,
          // [additionalFieldKey ? additionalFieldKey : exactFieldKey]:
          //   additionalId ? additionalId : id,
          RepoId: selectedGoodId,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
          },
        }
      : {
          RepoViewId: config.listConfig.repoViewId,
          RepoId: selectedGoodId,
          // [additionalFieldKey ?? exactFieldKey]: additionalId
          //   ? additionalId
          //   : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
          },
        },
    // skip: !match || selectedGoodId,
  });

  const { data: tableTotal, refetch: reload } = useGetData<
    IWebHookItem[],
    null
  >({
    url: config.listConfig.selectUrl,
    body: config.listConfig.body
      ? {
          ...config.listConfig.body,
          RepoViewId: config.listConfig.repoViewId,
          RepoId: selectedGoodId,
          // [additionalFieldKey ? additionalFieldKey : exactFieldKey]:
          //   additionalId ? additionalId : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
            OnlyTotalCount: true,
          },
        }
      : {
          RepoViewId: config.listConfig.repoViewId,
          RepoId: selectedGoodId,
          // [additionalFieldKey ?? exactFieldKey]: additionalId
          //   ? additionalId
          //   : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
            OnlyTotalCount: true,
          },
        },
    skip: selectedGoodId || systemId === undefined,
  });

  const {
    data: cardData,
    isFetching: cardIsFetching,
    refetch,
  } = useGetInfinite<unknown[], null>({
    url: config.listConfig.selectUrl,
    body: config.listConfig.body
      ? {
          ...config.listConfig.body,
          RepoViewId: config.listConfig.repoViewId,
          RepoId: selectedGoodId,
          // [additionalFieldKey ? additionalFieldKey : exactFieldKey]:
          // additionalId ? additionalId : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
          },
        }
      : {
          RepoViewId: config.listConfig.repoViewId,
          RepoId: selectedGoodId,
          // [additionalFieldKey ? additionalFieldKey : exactFieldKey]:
          //   additionalId ? additionalId : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
          },
        },
    skip: !match || selectedGoodId || systemId === undefined,
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
    if (!systemId || !selectedGoodId) {
      setPageNumber(1);
    }
  }, [systemId, selectedGoodId]);

  useEffect(() => {
    if (pageNumber > 1 && tableData?.Data?.length === 0) {
      setPageNumber((prevState) => prevState - 1);
    }
  }, [tableData?.Data]);

  const [triggerItem, { isLoading: triggerIsLoading }] = useCUDDataMutation();

  const handleActionClick = async (
    action: IToolbarMenu,
    id: number,
    PendingStatusId: number | null
  ) => {
    setSelectedId(id);
    try {
      switch (action.MenuDesc) {
        case ActionLabelsEnum.Edit as string:
          // console.log( tableData.Data.find((i) => i.WebHookId === id),id);
          const selectedItem = tableData?.Data?.find((i) => i.WebHookId === id);

          if (selectedItem) {
            setEditingItem({
              ...selectedItem,
              SendType: mapSendType[selectedItem.SendType],
              ParamType: mapParamType[selectedItem.ParamType],
              OpMode: mapOpMode[selectedItem.OpMode],
            });
            form.setFieldsValue({
              Name: selectedItem.Name,
              EndPoint: selectedItem.EndPoint?.replace(/^https?:\/\//, ""),
              SendType: selectedItem.SendType, // یا مقدار مناسب که با CustomSelect سازگار است
              ParamType: selectedItem.ParamType, // مشابه
              OpMode: selectedItem.OpMode, // مشابه
              WebHookId: selectedItem.WebHookId,
            });
          }
          break;
          // form.setFieldValue("Name", "abbas");
          // form.setFieldsValue({
          //   EndPoint: "http://yahoo.com",
          //   Name: "gdfg",
          //   OpMode: 2,
          //   OpModeDesc: "Delete",
          //   ParamType: 1,
          //   RepoId: 2010,
          //   SendType: 2,
          //   WebHookId: 0,
          // });
          // form.setFieldValue("Name", "gdfg");
          break;

        case ActionLabelsEnum.Delete as string:
          setConfirmMode("Delete");
          match ? setIsConfirmModalOpen(true) : setIsConfirmDrawerOpen(true);
          break;

        case ActionLabelsEnum.Confirm1 as string:
        case ActionLabelsEnum.Confirm2 as string:
          setConfirmMode("Confirm");
          match ? setIsConfirmModalOpen(true) : setIsConfirmDrawerOpen(true);
          break;

        default:
          null;
          break;
      }
    } catch (error) {
      null;
    }
  };

  const handleConfirmation = async () => {
    try {
      const confirmResult = await triggerItem({
        url: confirmMode === "Delete" ? config.deleteUrl : config.confirmUrl,
        body: { Id: selectedId },
      }).unwrap();

      if (confirmMode === "Delete") {
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
                  RepoId: selectedGoodId,
                  // [sourceKey]: id,
                },
                id: "All",
              },
              (draft) => {
                if (draft?.Data) draft.Data = [];
              },
              false
            )
          );

          setPageNumber(1);
          await refetch();
        }
        setIsConfirmModalOpen(false);
        setIsConfirmDrawerOpen(false);
      } else {
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
                  RepoId: selectedGoodId,
                  // [sourceKey]: id,
                },
                id: "All",
              },
              (draft) => {
                if (draft?.Data) draft.Data = [];
              },
              false
            )
          );

          setPageNumber(1);
          await refetch();
        }
        setIsConfirmModalOpen(false);
        setIsConfirmDrawerOpen(false);
      }
    } catch (error) {
      null;
    }
  };

  const tableDataWithDesc = tableData?.Data?.map((item) => ({
    ...item,
    SendType: mapSendType[item.SendType],
    ParamType: mapParamType[item.ParamType],
    OpMode: mapOpMode[item.OpMode],
  }));

  return (
    <>
      <div className="flex flex-col gap-2 m-2">
        <div className="flex gap-2 mb-3 item-center">
          <Play />
          <p className="-mt-[6px] font-bold text-gray-gray135 text-sm">
            {t("general.newItem")}
          </p>
        </div>
        <CustomFormWebHook
          systemId={systemId}
          form={form}
          selectedGoodId={selectedGoodId}
          setEditingItem={setEditingItem}
          editingItem={editingItem || null}
          // onSubmit={() => refetch()}
        />
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

        {tableData &&
          tableData?.Data?.length > 0 &&
          tableTotal?.TotalCount > perPageCount && (
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
              mode={confirmMode}
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
            mode={confirmMode}
            onCancel={() => setIsConfirmDrawerOpen(false)}
            onConfirm={handleConfirmation}
            onLoading={triggerIsLoading}
          />
        }
      />
    </>
  );
}
