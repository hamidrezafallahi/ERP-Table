import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Divider,
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
  RightChevron,
} from '@components/atoms/iconComponents';
import Confirmation from '@components/molecules/confirmation';
import {
  CardDynamicModal,
  FormDynamicModal,
  TableDynamicModal,
} from '@components/molecules/dynamicModal';
import { ActionLabelsEnum } from '@components/organisms/list/enum';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  apiService,
  useCUDDataMutation,
  useGetData,
  useGetInfinite,
} from '@services/base';
import type { IToolbarMenu } from '@type/toolbar';
import { showSuccessToast } from '@utils/toast';

import type { IProps } from './type';

export default function DynamicModal({
  id,
  additionalId,
  sourceKey,
  additionalFieldKey,
  config,
  pageCount,
}: IProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<
    "Delete" | "Confirm" | "createNewEdit"
  >("Delete");

  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = useState<number>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { match, locale } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const locale = state.withPersist.config.lang;
    return { match, locale };
  });
  const perPageCount = pageCount || 5;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const exactFieldKey = config.sourceFieldKey
    ? config.sourceFieldKey
    : sourceKey;
  const { data: tableData, isLoading: tableIsLoading } = useGetData<
    unknown[],
    null
  >({
    url: config?.listConfig?.selectUrl,
    body: config?.listConfig?.body
      ? {
          ...config.listConfig.body,
          RepoViewId: config?.listConfig?.repoViewId,
          [additionalFieldKey ? additionalFieldKey : exactFieldKey]:
            additionalId ? additionalId : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
          },
        }
      : {
          RepoViewId: config?.listConfig?.repoViewId,
          [additionalFieldKey ?? exactFieldKey]: additionalId
            ? additionalId
            : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
          },
        },
    skip: !match,
  });
  const { data: tableTotal } = useGetData<null, null>({
    url: config.listConfig.selectUrl,
    body: config.listConfig.body
      ? {
          ...config.listConfig.body,
          RepoViewId: config.listConfig.repoViewId,
          [additionalFieldKey ? additionalFieldKey : exactFieldKey]:
            additionalId ? additionalId : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
            OnlyTotalCount: true,
          },
        }
      : {
          RepoViewId: config.listConfig.repoViewId,
          [additionalFieldKey ?? exactFieldKey]: additionalId
            ? additionalId
            : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
            OnlyTotalCount: true,
          },
        },
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
          [additionalFieldKey ? additionalFieldKey : exactFieldKey]:
            additionalId ? additionalId : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
          },
        }
      : {
          RepoViewId: config.listConfig.repoViewId,
          [additionalFieldKey ? additionalFieldKey : exactFieldKey]:
            additionalId ? additionalId : id,
          PagingInfo: {
            PageNumber: pageNumber,
            PageRecordCount: perPageCount,
          },
        },
    skip: match,
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
    if (pageNumber > 1 && tableData?.Data?.length === 0) {
      setPageNumber((prevState) => prevState - 1);
    }
  }, [tableData?.Data]);

  const [triggerItem, { isLoading: triggerIsLoading }] = useCUDDataMutation();

  const t = useTranslations();

  const handleActionClick = async (
    action: IToolbarMenu,
    id: number,
    PendingStatusId: number | null,
  ) => {
    setSelectedId(id);
    try {
      switch (action.MenuDesc) {
        case ActionLabelsEnum.Edit as string:
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
        url:
          confirmMode === "Delete"
            ? config.deleteUrl
            : confirmMode === "createNewEdit"
              ? "api/prd/insert/yearPlan/updateVersion"
              : config.confirmUrl,
        body: { Id: selectedId },
      }).unwrap();

      if (confirmMode === "Delete") {
        if (
          confirmResult.Result === "Success" ||
          confirmResult.Result === "Pending"
        ) {
          showSuccessToast(t("toast.successTitle"));
          setSelectedId(null);

          (dispatch as any)(
            apiService.util.updateQueryData(
              "getInfinite",
              {
                url: config.listConfig.selectUrl,
                body: {
                  RepoViewId: config.listConfig.repoViewId,
                  [sourceKey]: id,
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
          setIsConfirmModalOpen(false);
          setIsConfirmDrawerOpen(false);
          await refetch();
        }
      } else {
        if (
          confirmResult.Result === "Success" ||
          confirmResult.Result === "Pending"
        ) {
          showSuccessToast(t("toast.successTitle"));
          setSelectedId(null);

          (dispatch as any)(
            apiService.util.updateQueryData(
              "getInfinite",
              {
                url: config.listConfig.selectUrl,
                body: {
                  RepoViewId: config.listConfig.repoViewId,
                  [sourceKey]: id,
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
          setIsConfirmModalOpen(false);
          setIsConfirmDrawerOpen(false);
          await refetch();
        }
      }
    } catch (error) {
      null;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 m-4">
        {config?.formConfig !== null && (
          <>
            <FormDynamicModal
              setPageNumber={setPageNumber}
              formData={config.formConfig.fields}
              createUrl={config.createUrl}
              updateUrl={config.updateUrl}
              id={selectedId}
              clearId={() => setSelectedId(null)}
              sourceId={additionalId ? additionalId : id}
              sourceKey={
                additionalFieldKey ? additionalFieldKey : exactFieldKey
              }
              config={config}
            />
            <Divider className="m-2" />
          </>
        )}

        {!match ? (
          <CardDynamicModal
            actions={config.actions}
            columnsList={config.listConfig}
            data={cardData?.Data}
            onActionClick={handleActionClick}
            fieldKey={config.fieldKey}
            staticKey={config.staticKey}
            ref={lastItemRef}
            activation={config.activation}
          />
        ) : (
          <TableDynamicModal
            isLoading={tableIsLoading}
            actions={config.actions}
            columnsList={config.listConfig}
            data={tableData?.Data}
            handleAction={handleActionClick}
            locale={locale}
            fieldKey={config.fieldKey}
            activation={config.activation}
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
