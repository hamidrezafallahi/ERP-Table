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
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

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
import { ActionLabelsEnum } from '@components/organisms/list/enum';
import { useAppSelector } from '@redux/index';
import {
  apiService,
  useCUDDataMutation,
  useGetData,
  useGetInfinite,
} from '@services/base';
import { IContactInfo } from '@services/com/contactInfo/type';
import type { IRequest } from '@services/com/goodExtraInfo/type';
import type { IToolbarMenu } from '@type/toolbar';
import { showSuccessToast } from '@utils/core';

import { config } from '../contactInfo/config';
import { FormContactInfo } from '../contactInfo/form';
import {
  CardDynamicModal,
  TableDynamicModal,
} from '../dynamicModal';
import type { IProps } from './type';

export default function ContactInfo({ id, sourceKey }: IProps) {
  const dispatch = useDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);
  const perPageCount = 5;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const getUrl = "/api/com/select/personContact";
  const createUrl = "/api/com/insert/personContact";
  const updateUrl = "/api/com/update/personContact";
  const deleteUrl = "/api/com/delete/personContact";
  const repoViewId = 30045;
  const fieldKey = "PersonContactId";
  const staticKey = "ContactType.CommonDesc";

  const { data: tableData, isLoading: tableIsLoading } = useGetData<
    IContactInfo[],
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

  const {
    data: cardData,
    isFetching: cardIsFetching,
    refetch,
  } = useGetInfinite<IContactInfo[], IRequest>({
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

  const handleActionClick = async (action: IToolbarMenu, item: number) => {
    setSelectedItem(item);
    try {
      switch (action.MenuDesc) {
        case ActionLabelsEnum.Edit as string:
          break;

        case ActionLabelsEnum.Delete as string:
          match ? setIsDeleteModalOpen(true) : setIsDeleteDrawerOpen(true);
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

        (dispatch as any)(
          apiService.util.updateQueryData(
            "getInfinite",
            {
              url: getUrl,
              body: { RepoViewId: repoViewId, [sourceKey]: id },
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
    } catch (error) {
      null;
    }
    setIsDeleteModalOpen(false);
    setIsDeleteDrawerOpen(false);
  };
  return (
    <>
      <div className="flex flex-col gap-2 m-2">
        <FormContactInfo
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
                  {locale == "fa" ? <RightChevron /> : <LeftChevron />}
                </CustomButton>
              }
              nextIcon={
                <CustomButton className="m-0 p-0 w-fit">
                  {locale == "fa" ? <LeftChevron /> : <RightChevron />}
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
      <CustomDrawer
        isOpen={isDeleteDrawerOpen}
        onClose={() => setIsDeleteDrawerOpen(false)}
        content={
          <Confirmation
            itemsToConfirm={selectedItem}
            onCancel={() => setIsDeleteDrawerOpen(false)}
            onConfirm={handleDeleteConfirm}
            onLoading={triggerIsLoading}
          />
        }
      />
    </>
  );
}
