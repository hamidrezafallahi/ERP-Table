"use client";
import {
  useRef,
  useState,
} from 'react';

import { Pagination } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  DownChevron,
  LeftChevron,
  RightChevron,
} from '@components/atoms/iconComponents';
import { DetailDataGrid } from '@components/molecules/detailDataGrid';
import { IChildHandle } from '@components/molecules/detailDataGrid/mobile/type';
import { PriceForm } from '@components/molecules/price';
import { useAppSelector } from '@redux/index';
import { IPriceDetail } from '@services/sale/priceDetails/type';
import { setViewData } from '@slice/pages';

import type { IProps } from './type';

export default function PriceComponent({
  isEdit,
  detailInitialData,
  totalCount,
  columnsConfig,
  detailCaption,
  isLoading,
  form,
}: IProps) {
  const dispatch = useDispatch();
  const t = useTranslations();

  const { fullScreen, activePage, viewData, minimizePanel, match } =
    useAppSelector(
      (state) => ({
        activePage: state?.withPersist?.pages?.find(
          (item) => item.isActive === true
        ),
        viewData: state?.withPersist?.pages?.find(
          (item) => item.isActive === true
        )?.viewData,
        fullScreen: state.withPersist.config.fullScreen,
        minimizePanel: state.withoutPersist.container.minimize,
        match: state.withPersist.config.initMatch,
      }),
      shallowEqual
    );

  const [isShowForm, setShowForm] = useState(true);

  const handlePaginationChange = (page: number) => {
    dispatch(
      setViewData({
        ...viewData,
        PagingInfo: {
          PageNumber: page,
          PageRecordCount: viewData.PagingInfo.PageRecordCount,
        },
      })
    );
  };
  const childRef = useRef<IChildHandle>(null);

  const handleAddNew = () => {
    const index = 0;
    if (childRef.current) {
      childRef.current.mobileHandleAdd(index);
    }
  };

  return (
    <div className="hidden-show-scrollBar flex flex-col gap-2">
      <div
        className={`${
          isShowForm
            ? "opacity-100 transform translate-y-1"
            : "opacity-0 transform translate-y-0 pointer-events-none"
        }  transition-all duration-500 ease-in-out pb-2 `}
      >
        {isShowForm && <PriceForm form={form} match={match} />}
      </div>

      <div className="flex items-center gap-2 pt-8">
        <div
          className={`${isShowForm ? "rotate-180" : ""} `}
          onClick={() => !match && setShowForm(!isShowForm)}
        >
          <DownChevron />
        </div>

        <div className="flex justify-between items-center w-full">
          <div className="text-sm">
            <span>{detailCaption} </span>
            {!match && totalCount && (
              <span>
                ( {totalCount} {t("general.item")} )
              </span>
            )}
          </div>
          {!match && (
            <>
              <CustomButton
                type="text"
                className="!bg-black-black8 hover:bg-black-black8 focus-within:bg-black-black8 focus:bg-black-black8 active:bg-black-black8 my-2 px-3 py-1 border rounded !text-white text-xs"
                onClick={handleAddNew}
              >
                {t("general.add")}
              </CustomButton>
            </>
          )}
        </div>
      </div>

      <div
        className={`${
          fullScreen
            ? "w-full"
            : `${
                minimizePanel
                  ? "w-fit max-w-[calc(100dvw-300px)]"
                  : "w-fit max-w-[calc(100dvw-550px)]"
              }`
        } ${
          !match ? "h-full" : "h-[calc(100dvh-330px)]"
        } flex hidden-show-scrollBar transition-all duration-200 overflow-y-auto flex-col justify-between gap-2`}
      >
        {match ? (
          <DetailDataGrid.Desktop<IPriceDetail>
            isEdit={isEdit}
            fieldKey="PriceListDetailId"
            alternateKey="PriceListDetailId"
            detailKey="Details"
            detailCaption={detailCaption}
            dragUrl=""
            detailInitialData={detailInitialData ?? []}
            columnsConfig={columnsConfig}
            currentPage={viewData?.PagingInfo?.PageNumber}
            contentHeight={330}
          />
        ) : (
          <DetailDataGrid.Mobile<IPriceDetail>
            isEdit={isEdit}
            fieldKey="PriceListDetailId"
            alternateKey="PriceListDetailId"
            detailKey="Details"
            detailCaption={detailCaption}
            detailInitialData={detailInitialData ?? []}
            columnsConfig={columnsConfig}
            currentPage={viewData?.PagingInfo?.PageNumber}
            contentHeight={190}
            isLoading={isLoading}
            ref={childRef}
            setPage={handlePaginationChange}
            setShowForm={setShowForm}
            totalCount={totalCount}
          />
        )}
      </div>
      <div className="flex justify-end h-[32px]">
        {match &&
          totalCount > viewData?.PagingInfo?.PageRecordCount &&
          activePage?.pageData?.length > 0 && (
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
              current={viewData?.PagingInfo?.PageNumber}
              jumpNextIcon={<span>...</span>}
              jumpPrevIcon={<span>...</span>}
              pageSize={viewData?.PagingInfo?.PageRecordCount}
              total={totalCount}
              showSizeChanger={false}
              onChange={handlePaginationChange}
              showTitle={false}
            />
          )}
      </div>

      {/* {id && activePage.RepoId && ( */}
      {/* <Comments referId={Number(id)} repoId={activePage.RepoId} /> */}
      {/* )} */}
    </div>
  );
}
