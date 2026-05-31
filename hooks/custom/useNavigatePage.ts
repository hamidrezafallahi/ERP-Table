import { useRouter } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setMenuBar } from '@slice/config';
import { setInitialPageData } from '@slice/init';
import { removeNavigateListLastItem } from '@slice/navigateList';
import { PageStateEnum } from '@slice/pages/enum';

export const useNavigatePage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { locale, navigate } = useAppSelector((state) => {
    const locale = state.withPersist.config.lang;
    const navigate = state.withPersist.navigateList;
    return { locale, navigate };
  }, shallowEqual);
  const previousPageData = navigate.at(-2);
  const navigateBack = () => {
    if (!previousPageData) {
      router.replace(`/${locale}/dashboard`);
    } else {
      dispatch(
        setInitialPageData({
          Key: previousPageData.Key,
          RepoId: previousPageData.RepoId,
          SystemId: previousPageData.SystemId,
          url: previousPageData.url,
          pageId: previousPageData.pageId,
          originalPageState:
            previousPageData.originalPageState || PageStateEnum.Opened,
          pageState: previousPageData.pageState || PageStateEnum.Opened,
          selectedView: previousPageData.selectedView,
          listPageId: previousPageData.listPageId,
          data: previousPageData?.data,
          Id: previousPageData.Id,
        })
      );
      router.replace(`/${locale}/${previousPageData.url}`);
    }
    dispatch(removeNavigateListLastItem());

    dispatch(
      setMenuBar({
        menuBar: { label: null, value: null },
      })
    );
  };

  const lastPageData = navigate.at(-1);
  const navigateLast = () => {
    if (!lastPageData) {
      router.replace(`/${locale}/dashboard`);
      return;
    }
    dispatch(
      setInitialPageData({
        Key: lastPageData.Key,
        RepoId: lastPageData.RepoId,
        SystemId: lastPageData.SystemId,
        url: lastPageData.url,
        pageId: lastPageData.pageId,
        originalPageState:
          lastPageData.originalPageState || PageStateEnum.Opened,
        pageState: lastPageData.pageState || PageStateEnum.Opened,
        selectedView: lastPageData.selectedView,
        data: previousPageData?.data,
        listPageId: lastPageData.listPageId,
        Id: lastPageData.Id,
      })
    );
    dispatch(
      setMenuBar({
        menuBar: { label: null, value: null },
      })
    );

    router.replace(`/${locale}/${lastPageData.url}`);
  };
  const previousPage = previousPageData?.url?.split("/")[1] ?? "dashboard";
  return { navigateBack, navigateLast, previousPage };
};

// const navigateRef = useRef(navigate);
// useEffect(() => {
//   console.log(window.location.href);
//   window.history.pushState(null, "", window.location.href);
// }, [window.location.href]);

// useEffect(() => {
//   navigateRef.current = navigate;
// }, [navigate]);

// const navigateBack = () => {
//   const previousPageData =
//     navigateRef.current[navigateRef.current.length - 2];
//   if (!previousPageData) {
//     return;
//   }
