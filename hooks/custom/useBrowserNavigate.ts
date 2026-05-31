import {
  useEffect,
  useRef,
  useState,
} from 'react';

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

export const useBrowserNavigate = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [action, setAction] = useState(true);

  const { locale, navigate } = useAppSelector((state) => {
    const locale = state.withPersist.config.lang;
    const navigate = state.withPersist.navigateList;
    return { locale, navigate };
  }, shallowEqual);

  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  useEffect(() => {
    const handlePopState = (event) => {
      // event.preventDefault();

      browserNavigateBack();
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function browserNavigateBack() {
    const previousPageData =
      navigateRef.current[navigateRef.current.length - 2];
    if (!previousPageData) {
      return;
    }
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
        Id: previousPageData.Id,
      })
    );

    window.history.replaceState(null, "", `/${locale}/${previousPageData.url}`);
    router.replace(`/${locale}/${previousPageData.url}`);
    setAction(false);

    dispatch(
      setMenuBar({
        menuBar: { label: null, value: null },
      })
    );
    dispatch(removeNavigateListLastItem());
  }

  useEffect(() => {
    if (action) {
      window.history.pushState(null, "", window.location.href);
    }
    setAction(true);
  }, [window.location.href]);

  return { browserNavigateBack };
};
