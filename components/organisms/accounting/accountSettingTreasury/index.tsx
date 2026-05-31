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
import {
  AccountSettingCard,
  AccountSettingForm,
  AccountSettingTable,
  AccountSettingTreasuryQuickSearch,
} from '@components/molecules/accounting';
import Confirmation from '@components/molecules/confirmation';
import { ActionLabelsEnum } from '@components/organisms/list/enum';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import type {
  IAccountSetting,
  IRequest,
} from '@services/acc/accountSetting/type';
import {
  useCUDDataMutation,
  useGetData,
  useGetInfinite,
} from '@services/base';
import type { IToolbarMenu } from '@type/toolbar';
import { showSuccessToast } from '@utils/toast';

import { listConfig } from './listConfig';
import type { IProps } from './type';

export const AccountSettingTreasury = ({ selectedSubtotal }: IProps) => {
  const { locale, match } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number>(null);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const recordHeight = 35;
  const deviceHeight = window.innerHeight;
  const recordsPerPage = Math.floor((deviceHeight - 460) / recordHeight);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  let filters = null;
  if (selectedSubtotal.length > 0) {
    filters = {
      AccountIds: selectedSubtotal,
    };
  }

  const { data: totalTable } = useGetData<IAccountSetting[], IRequest>({
    url: "/api/trh/select/rpWay",
    body: {
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordsPerPage,
        OnlyTotalCount: true,
      },
      FullSearchPhrase: searchPhrase,
      ...filters,
    },
    skip: match,
  });
  const { data: tableData, isLoading: tableIsLoading } = useGetData<
    IAccountSetting[],
    IRequest
  >({
    url: "/api/trh/select/rpWay",
    body: {
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordsPerPage,
      },
      FullSearchPhrase: searchPhrase,
      ...filters,
    },
    skip: !match,
  });

  const { data: cardData, isFetching: cardIsFetching } = useGetInfinite<
    IAccountSetting[],
    IRequest
  >({
    url: "/api/trh/select/rpWay",
    body: {
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordsPerPage,
      },
      FullSearchPhrase: searchPhrase,
      ...filters,
    },
    skip: match,
  });

  useEffect(() => {
    setPageNumber(1);
  }, [selectedSubtotal]);

  useEffect(() => {
    if (
      !match &&
      cardData?.Data?.length > 0 &&
      cardData?.ReturnCount === recordsPerPage
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
        url: "/api/trh/delete/rpWay",
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
      <AccountSettingForm
        id={selectedItem}
        clearId={() => setSelectedItem(null)}
        selectedSubtotal={selectedSubtotal}
      />
      <Divider className="m-2" />
      <AccountSettingTreasuryQuickSearch
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
      />

      {!match ? (
        <AccountSettingCard
          actions={listConfig.actions}
          columnsConfig={listConfig.columnsConfig}
          data={cardData?.Data}
          onActionClick={handleActionClick}
          ref={lastItemRef}
          rowIdField="RPWayId"
          staticData="RPWayDesc"
        />
      ) : (
        <AccountSettingTable
          isLoading={tableIsLoading}
          actions={listConfig.actions}
          columnsConfig={listConfig.columnsConfig}
          data={tableData?.Data}
          handleAction={handleActionClick}
          locale={locale}
          rowIdField="RPWayId"
        />
      )}

      {tableData &&
        tableData?.Data?.length > 0 &&
        totalTable?.TotalCount > recordsPerPage && (
          <Pagination
            className="flex justify-end"
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
            pageSize={recordsPerPage}
            total={totalTable?.TotalCount}
            showSizeChanger={false}
            onChange={(page) => setPageNumber(page)}
            showTitle={false}
          />
        )}

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
};
