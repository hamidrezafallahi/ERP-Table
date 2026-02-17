"use client";

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Pagination,
  Skeleton,
} from 'antd';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomSpin,
} from '@components/atoms/defaultElements';
import {
  LeftChevron,
  RightChevron,
} from '@components/atoms/iconComponents';
import {
  NotificationToolbar,
} from '@components/molecules/notification/notificationToolbar';
import {
  RenderNotification,
} from '@components/molecules/notification/renderNotification';
import { useAppSelector } from '@redux/index';
import {
  useGetData,
  useGetInfinite,
} from '@services/base';
import type {
  INotification,
  IRequest,
} from '@services/notification/type';

export default function NotificationPage() {
  const getUrl = "api/notification/select/messageUser";
  const repoViewId = 110005;
  const recordHeight = 100;
  const deviceHeight = window.innerHeight;
  const initialRecordPerPage = Math.floor((deviceHeight - 200) / recordHeight);
  const { locale, isFullScreen } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      isFullScreen: state.withPersist.config.fullScreen,
    }),
    shallowEqual
  );
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  const [quickSearch, setQuickSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [recordPerPage, setRecordPerPage] = useState(initialRecordPerPage);

  const { data, isFetching, refetch } = useGetData<INotification[], IRequest>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordPerPage,
      },
      FullSearchPhrase: quickSearch,
      ShowAll: false,
    },
  });

  const {
    data: cardData,
    isFetching: cardIsFetching,
    isLoading: cardIsLoading,
  } = useGetInfinite<INotification[], any>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: 10,
      },
      FullSearchPhrase: quickSearch,
      ShowAll: true,
    },

    skip: match,
    id: "all",
  });

  const { data: totalCount, isFetching: totalIsLoading } = useGetData<
    null,
    null
  >({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordPerPage,
        OnlyTotalCount: true,
      },
      FullSearchPhrase: quickSearch,
      ShowAll: true,
    },
    skip: !match,
  });

  const handlePaginationChange = (page: number) => {
    setPageNumber(page);
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      !match &&
      cardData?.Data?.length > 0 &&
      cardData?.ReturnCount === Number(recordPerPage)
    ) {
      const pageNumberCount = pageNumber;

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && !cardIsFetching) {
          pageNumberCount
            ? setPageNumber(pageNumberCount + 1)
            : setPageNumber(1);
        }
      };

      observer.current = new IntersectionObserver(observerCallback);
      const currentLastItem = lastItemRef.current;

      if (currentLastItem) observer.current.observe(currentLastItem);

      return () => {
        if (observer.current && currentLastItem && cardData?.Data?.length < 10)
          observer.current.unobserve(currentLastItem);
      };
    }
  }, [cardIsFetching, pageNumber, match, cardData?.Data?.length]);

  useEffect(() => {
    const deviceHeight = window.innerHeight;
    if (isFullScreen) {
      const recordsPerPage = Math.floor((deviceHeight - 140) / recordHeight);
      setRecordPerPage(recordsPerPage);
    } else {
      const recordsPerPage = Math.floor((deviceHeight - 200) / recordHeight);
      setRecordPerPage(recordsPerPage);
    }
  }, [isFullScreen]);

  return (
    <div className="relative">
      <div
        className={
          match ? `absolute -top-[60px] rtl:-left-[10px] -right-[10px] ` : ""
        }
      >
        <NotificationToolbar
          setPageNumber={setPageNumber}
          setQuickSearch={setQuickSearch}
          refetch={refetch}
        />
      </div>
      {/* <LocalQuickSearch
        quickSearch={quickSearch}
        setPageNumber={setPageNumber}
        setQuickSearch={setQuickSearch}
 
      /> */}
      <div className="px-2 h-[calc(100dvh-200px)]">
        <RenderNotification
          lastItemRef={lastItemRef}
          desktop={true}
          data={data?.Data}
        />
      </div>
      {!cardIsLoading && cardIsFetching && (
        <CustomSpin className="w-full" size="large" />
      )}
      {totalIsLoading && (
        <div className="flex justify-end items-center gap-2">
          <Skeleton.Button active={true} style={{ width: 80 }} />
          <Skeleton.Button active={true} style={{ width: 70 }} />
          <Skeleton.Button active={true} style={{ width: 350 }} />
        </div>
      )}
      {match && totalCount?.TotalCount > recordPerPage && (
        <div className="flex justify-end items-center gap-2 text-xs">
          {totalCount?.TotalCount && (
            <span className="p-2 rounded">
              {locale === "fa"
                ? totalCount?.TotalCount?.toLocaleString("fa-IR")
                : totalCount?.TotalCount?.toLocaleString("en-US")}
            </span>
          )}
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
            pageSize={recordPerPage}
            total={totalCount.TotalCount}
            showSizeChanger={false}
            onChange={handlePaginationChange}
            showTitle={false}
          />
        </div>
      )}
    </div>
  );
}
