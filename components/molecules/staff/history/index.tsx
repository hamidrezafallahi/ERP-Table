import { useEffect, useRef, useState } from "react";

import { Pagination } from "antd";
import { shallowEqual } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { LeftChevron, RightChevron } from "@components/atoms/iconComponents";
import {
  CardDynamicModal,
  TableDynamicModal,
} from "@components/molecules/dynamicModal";
import { ActionLabelsEnum } from "@components/organisms/list/enum";
import { useAppSelector } from "@redux/index";
import { useGetData, useGetInfinite } from "@services/base";
import type { IToolbarMenu } from "@type/toolbar";

import type { IProps } from "./type";
import { useListConfig } from "./config";
import { useInitializePage } from "@hooks/custom";
import { findingPageState } from "@utils/core";
import { IStaffHistory, IRequest } from "@services/prd/staffHistory/type";

export const History = ({ id }: IProps) => {
  const [selectedItem, setSelectedItem] = useState<number>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  const perPageCount = 5;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const initializePage = useInitializePage();
  const getUrl = "api/prd/select/yearPlan/history";
  const repoViewId = 150015;
  const fieldKey = "YearPlanId";
  const staticKey = "YearPlanId";
  const config = useListConfig();

  const { data: tableData, isLoading: tableIsLoading } = useGetData<
    IStaffHistory[],
    IRequest
  >({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      YearPlanId: id,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
      },
    },
    // skip: !match,
  });
  const { data: tableTotalCount } = useGetData<null, null>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      YearPlanId: id,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
        OnlyTotalCount: true,
      },
    },
    // skip: !match,
  });
  const { activePage, initPage } = useAppSelector((state) => {
    const activePage = state.withPersist.pages.find(
      (item) => item.isActive === true
    );
    const initPage = state.withPersist.init;
    return { activePage, initPage };
  }, shallowEqual);

  const repoId = initPage?.RepoId;
  const systemId = initPage?.SystemId;

  const { data: cardData, isFetching: cardIsFetching } = useGetInfinite<
    IStaffHistory[],
    IRequest
  >({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      YearPlanId: id,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: perPageCount,
      },
    },
    // skip: match,
  });

  useEffect(() => {
    if (
      // !match &&
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

  const locale = useAppSelector((state) => state.withPersist.config.lang);

  const formUrl = "prd/yearPlan";
  const handleActionClick = async (
    action: IToolbarMenu,
    item: number,
    PendingStatusId: number | null
  ) => {
    setSelectedItem(item);
    try {
      switch (action.MenuDesc) {
        case ActionLabelsEnum.Show as string:
          initializePage({
            config: {
              RepoId: repoId,
              SystemId: systemId,
              url: `${formUrl}?id=${item}&mode=showHistory`,
              pageState: findingPageState(PendingStatusId),
              originalPageState: findingPageState(PendingStatusId),
              listPageId: activePage.pageId,
              data: activePage.data,
            },
          });

          break;
        default:
          null;
          break;
      }
    } catch (error) {
      null;
    }
  };


  return (
    <>
      <div className="flex flex-col gap-2 m-2">
        {!match ? (
          <CardDynamicModal
            actions={config.actions}
            columnsList={config.listConfig}
            data={tableData?.Data}
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
    </>
  );
};
