import {
  useEffect,
  useState,
} from 'react';

import { useGetData } from '@services/base';
import { PageStateEnum } from '@slice/pages/enum';
import type { IPage } from '@slice/pages/type';

import { useInitializePage } from './useInitializePage';

export const useNavigateRecordsForm = ({
  listPageId,
  getUrl,
  pages,
  fieldKey,
  id,
  formUrl,
  pageId,
}: {
  listPageId: string;
  getUrl: string;
  pages: IPage[];
  fieldKey: string | number;
  id: number;
  formUrl: string;
  pageId: string;
}) => {
  const initializePage = useInitializePage();
  const baseFormUrl = formUrl?.split("?")[0];
  const listPageConfig = pages?.find((page) => page.pageId === listPageId);

  const [newPageNumber, setNewPageNumber] = useState(
    listPageConfig?.viewData?.PagingInfo?.PageNumber
  );
  const [disabledNextButton, setDisabledNextButton] = useState(false);
  const [disabledPrevButton, setDisabledPrevButton] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<
    "next" | "prev" | null
  >(null);

  const { data: listData } = useGetData<unknown[], unknown>({
    url: getUrl,
    body: {
      Filters: listPageConfig?.viewData?.Filters,
      OrderInfo: listPageConfig?.viewData?.OrderInfo,
      RepoViewId: listPageConfig?.viewData?.RepoViewId,
      ShowMode: 10,
      ShowTags: listPageConfig?.viewData?.ShowTags,
      ShowBookmarked: listPageConfig?.viewData?.ShowBookmarked,
      PagingInfo: {
        PageNumber: newPageNumber,
        PageRecordCount: listPageConfig?.viewData?.PagingInfo?.PageRecordCount,
      },
      FullSearchPhrase: listPageConfig?.viewData?.FullSearchPhrase,
    },
    skip: !listPageConfig,
  });

  useEffect(() => {
    if (!listData || !pendingDirection) return;

    const currentIndex = listData?.Data?.findIndex(
      (item) => item?.[fieldKey] === id
    );

    const nextId = listData?.Data?.[currentIndex + 1]?.[fieldKey];
    const prevId = listData?.Data?.[currentIndex - 1]?.[fieldKey];

    if (pendingDirection === "next") {
      if (nextId) {
        initializePage({
          config: {
            Key: Number(nextId),
            RepoId: listPageConfig?.RepoId,
            SystemId: listPageConfig?.SystemId,
            url: `${baseFormUrl}?id=${nextId}`,
            pageState: PageStateEnum.Opened,
            originalPageState: PageStateEnum.Opened,
            Id: Number(nextId),
            listPageId,
            pageId,
          },
        });
        setPendingDirection(null);
      } else if ((listData?.Data?.length ?? 0) > 0) {
        setNewPageNumber((prev) => (prev ?? 1) + 1);
      } else {
        setDisabledNextButton(true);
        setPendingDirection(null);
      }
    }

    if (pendingDirection === "prev") {
      if (prevId) {
        initializePage({
          config: {
            Key: Number(prevId),
            RepoId: listPageConfig?.RepoId,
            SystemId: listPageConfig?.SystemId,
            url: `${baseFormUrl}?id=${prevId}`,
            pageState: PageStateEnum.Opened,
            originalPageState: PageStateEnum.Opened,
            Id: Number(prevId),
            listPageId,
            pageId,
          },
        });
        setPendingDirection(null);
      } else if (newPageNumber > 1) {
        setNewPageNumber((prev) => prev - 1);
      } else {
        setDisabledPrevButton(true);
        setPendingDirection(null);
      }
    }
  }, [listData, pendingDirection]);

  const handleNextItem = () => {
    setDisabledNextButton(false);
    setPendingDirection("next");
  };

  const handlePrevItem = () => {
    setDisabledPrevButton(false);
    setPendingDirection("prev");
  };

  return {
    handleNextItem,
    handlePrevItem,
    disabledNextButton,
    disabledPrevButton,
  };
};
