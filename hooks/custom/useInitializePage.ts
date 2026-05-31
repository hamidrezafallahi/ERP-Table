import {
  usePathname,
  useRouter,
} from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import type { IMenu } from '@services/auth/base/type';
import { setMenuBar } from '@slice/config';
import { setInitialPageData } from '@slice/init';
import type { IInitialPage } from '@slice/init/type';
import { setNavigateList } from '@slice/navigateList';
import { setActivePage } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';

export const useInitializePage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const path = usePathname();
  const { locale, match } = useAppSelector((state) => {
    const locale = state.withPersist.config.lang;
    const match = state.withPersist.config.initMatch;
    return { locale, match };
  }, shallowEqual);

  const initializePage = ({
    subMenu,
    config,
  }: {
    subMenu?: IMenu;
    config?: IInitialPage;
  }) => {
    const newPageId = Math.floor(Math.random() * 1000).toString();
    const init: IInitialPage = {
      RepoId: config?.RepoId ?? subMenu.RepoId,
      SystemId: config?.SystemId ?? subMenu?.SystemId,
      // MenuId:config?.MenuId ?? subMenu.MenuId,
      url: config?.url ?? subMenu?.WebLink,
      pageId: config?.pageId ?? newPageId,
      Id: config?.Id ?? null,
      originalPageState: config?.originalPageState ?? PageStateEnum.Opened,
      pageState: config?.pageState ?? PageStateEnum.Opened,
      selectedView: config?.selectedView ?? null,
      listPageId: config?.listPageId ?? null,
      returnPageId: config?.returnPageId ?? null,
      Key: config?.Key ? config?.Key : config?.Id ? config?.Id : null,
      data: config?.data,
      caption: config?.caption ?? null,
      captionII: config?.captionII ?? null,
    };
    if (!match) {
      dispatch(
        setMenuBar({
          menuBar: { label: null, value: null },
        }),
      );
    }
    router.replace(`/${locale}/${init.url}`);
    if (`/${locale}/${init.url}` === path) {
      dispatch(setActivePage(init.pageId));
    }
    dispatch(setInitialPageData(init));
    dispatch(setNavigateList({ init }));
  };
  return initializePage;
};
