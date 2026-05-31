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
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import {
  LeftChevron,
  RightChevron,
} from '@components/atoms/iconComponents';
import Confirmation from '@components/molecules/confirmation';
import DynamicModal from '@components/organisms/dynamicModal';
import { ActionLabelsEnum } from '@components/organisms/list/enum';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useDarkMode } from '@hooks/custom/useDarkMode';
import {
  useCUDDataMutation,
  useGetData,
  useGetInfinite,
} from '@services/base';
import type {
  IRequest,
  IStockWarehouse,
} from '@services/inv/stockWarehouse/type';
import type { IToolbarMenu } from '@type/toolbar';
import { getColoredIcon } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

import {
  CardDynamicModal,
  TableDynamicModal,
} from '../dynamicModal';
import {
  config,
  PermittedGoodsConfig,
} from './config';
import { FormStockWarehouse } from './form';
import type { IProps } from './type';

export const StockWarehouse = ({ id, sourceKey }: IProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermittedGoodsModalOpen, setIsPermittedGoodsModalOpen] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState<number>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { mode = "light" } = useDarkMode();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  const perPageCount = 5;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const getUrl = "api/inv/select/stockLocation";
  const createUrl = "api/inv/insert/stockLocation";
  const updateUrl = "api/inv/update/stockLocation";
  const deleteUrl = "api/inv/delete/stockLocation";
  const repoViewId = 70007;
  const fieldKey = "StockLocationId";
  const staticKey = "StockLocationDesc";

  const { data: tableData, isLoading: tableIsLoading } = useGetData<
    IStockWarehouse[],
    IRequest
  >({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      [sourceKey]: id,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
      },
    },
    skip: !match,
  });
  const { data: tableTotalCount } = useGetData<null, null>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      [sourceKey]: id,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
        OnlyTotalCount: true,
      },
    },
    skip: !match,
  });

  const { data: cardData, isFetching: cardIsFetching } = useGetInfinite<
    IStockWarehouse[],
    IRequest
  >({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      [sourceKey]: id,
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
  }, [cardIsFetching, match, cardData?.Data?.length]);

  const [triggerItem, { isLoading: triggerIsLoading }] = useCUDDataMutation();

  const locale = useAppSelector((state) => state.withPersist.config.lang);
  const t = useTranslations();

  const handleActionClick = async (
    action: IToolbarMenu,
    item: number,
    PendingStatusId: number | null
  ) => {
    setSelectedItem(item);
    try {
      switch (action.MenuDesc) {
        case ActionLabelsEnum.Edit as string:
          break;

        case ActionLabelsEnum.Delete as string:
          setIsDeleteModalOpen(true);
          break;
        case ActionLabelsEnum.PermittedGoods as string:
          setIsPermittedGoodsModalOpen(true);
          break;

        default:
          null;
          break;
      }
    } catch (error) {
      null;
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const deleteResult = await triggerItem({
        url: deleteUrl,
        body: { Id: selectedItem },
      }).unwrap();

      if (deleteResult.DeleteResults[0].IsDelete === true) {
        showSuccessToast(t("toast.successTitle"));
        setSelectedItem(null);
      }
      setIsDeleteModalOpen(false);
    } catch (error) {
      null;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 m-2">
        <FormStockWarehouse
          locale={locale}
          getUrl={getUrl}
          createUrl={createUrl}
          updateUrl={updateUrl}
          repoViewId={repoViewId}
          id={selectedItem}
          clearId={() => setSelectedItem(null)}
          sourceId={id}
          sourceKey={sourceKey}
          fieldKey={fieldKey}
        />
        <Divider className="m-2" />

        {!match ? (
          <CardDynamicModal
            actions={config.actions}
            columnsList={config.listConfig}
            data={cardData?.Data}
            onActionClick={handleActionClick}
            fieldKey={fieldKey}
            staticKey={staticKey}
            ref={lastItemRef}
          />
        ) : (
          <TableDynamicModal
            isLoading={tableIsLoading}
            actions={config.actions}
            columnsList={config.listConfig}
            data={tableData?.Data}
            handleAction={handleActionClick}
            locale={locale}
            fieldKey={fieldKey}
          />
        )}

        {tableData &&
          tableData?.Data?.length > 0 &&
          tableTotalCount?.TotalCount > perPageCount && (
            <Pagination
              className=""
              prevIcon={
                <CustomButton className="m-0 p-0 rounded w-fit">
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
              total={tableTotalCount?.TotalCount}
              showSizeChanger={false}
              onChange={(page) => setPageNumber(page)}
              showTitle={false}
            />
          )}
      </div>
      {isDeleteModalOpen && (
        <CustomModal
          width={300}
          disableTitle
          centered
          closeModal={() => setIsDeleteModalOpen(false)}
          isModalOpen={isDeleteModalOpen}
          content={
            <Confirmation
              itemsToConfirm={selectedItem}
              onCancel={() => setIsDeleteModalOpen(false)}
              onConfirm={handleDeleteConfirm}
              onLoading={triggerIsLoading}
            />
          }
        />
      )}
      {isPermittedGoodsModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[520px] h-[400px]" : ""}`}
          headerName={"کالاهای مجاز"}
          headerIcon={
            match && (
              <div
                dangerouslySetInnerHTML={{
                  __html: getColoredIcon(
                    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.75 5.25V9M2.25 5.25C2.25 7.54839 2.25 12.5806 2.25 12.871C2.25 13.9078 3.70923 14.5243 6.6277 15.7571C7.80014 16.2524 8.38636 16.5 9 16.5L9 8.51613" stroke="#585858" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.25 14.25C11.25 14.25 11.9062 14.25 12.5625 15.75C12.5625 15.75 14.6471 12 16.5 11.25" stroke="#585858" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.24444 7.26854L4.05354 6.20838C2.85118 5.62658 2.25 5.33567 2.25 4.875C2.25 4.41433 2.85118 4.12342 4.05354 3.54162L6.24444 2.48146C7.59663 1.82715 8.27272 1.5 9 1.5C9.72728 1.5 10.4034 1.82715 11.7556 2.48146L13.9465 3.54161C15.1488 4.12342 15.75 4.41433 15.75 4.875C15.75 5.33567 15.1488 5.62658 13.9465 6.20838L11.7556 7.26854C10.4034 7.92285 9.72728 8.25 9 8.25C8.27272 8.25 7.59663 7.92285 6.24444 7.26854Z" stroke="#585858" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.5 9L6 9.75" stroke="#585858" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.75 3L5.25 6.75" stroke="#585858" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                    mode
                  ),
                }}
                style={{ width: "18px", height: "17px" }}
              />
            )
          }
          closeModal={() => setIsPermittedGoodsModalOpen(false)}
          isModalOpen={isPermittedGoodsModalOpen}
          content={
            <DynamicModal
              id={selectedItem}
              sourceKey={"StockLocationId"}
              additionalId={selectedItem}
              additionalFieldKey={"StockLocationId"}
              config={PermittedGoodsConfig}
            />
          }
        />
      )}
    </>
  );
};
