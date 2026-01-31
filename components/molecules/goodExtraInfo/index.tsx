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
import { ActionLabelsEnum } from '@components/organisms/list/enum';
import { useAppSelector } from '@redux/index';
import {
  useCUDDataMutation,
  useGetData,
  useGetInfinite,
} from '@services/base';
import type {
  IGoodExtraInfo,
  IRequest,
} from '@services/com/goodExtraInfo/type';
import type { IToolbarMenu } from '@type/toolbar';
import { showSuccessToast } from '@utils/core';

import {
  CardDynamicModal,
  TableDynamicModal,
} from '../dynamicModal';
import { config } from './config';
import { FormGoodExtraInfo } from './form';
import type { IProps } from './type';

export default function GoodExtraInfo({ id, sourceKey }: IProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);
  const perPageCount = 5;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const getUrl = "api/com/select/goodsExtraInfoGoods";
  const createUrl = "api/com/insert/goodsExtraInfoGoods";
  const updateUrl = "api/com/update/goodsExtraInfoGoods";
  const deleteUrl = "api/com/delete/goodsExtraInfoGoods";
  const repoViewId = 30031;
  const fieldKey = "GoodsExtraInfoGoodsId";
  const staticKey = "GoodsExtraInfo.GoodsExtraInfoDesc";

  const { data: tableData, isLoading: tableIsLoading } = useGetData<
    IGoodExtraInfo[],
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
    IGoodExtraInfo[],
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
        <FormGoodExtraInfo
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
    </>
  );
}
