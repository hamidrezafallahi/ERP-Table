import {
  ReactNode,
  useEffect,
} from 'react';

import {
  usePathname,
  useRouter,
} from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import ConnectionLost from '@components/molecules/connectionLost';
import ChatWidget from '@components/organisms/chat';
import {
  useMediaQuery,
  useMessage,
} from '@hooks/custom';
import FirebaseNotification from '@hooks/firebaseForeground';
import { useAppSelector } from '@redux/index';
import { TLang } from '@slice/config/type';
import { setDeActiveAllPage } from '@slice/pages';
import { checkAndRedirectIfNeeded } from '@utils/core';

import { allowedEndPaths } from '../../constants/allowedEndPaths';
import { setInitMatch } from '../../slice/config';
import DesktopLayout from '../baseLayout/desktop';
import MobileLayout from '../baseLayout/mobile';

export const Container = ({
  children,
  direction,
  local,
}: {
  children: ReactNode;
  local: TLang;
  direction: "rtl" | "ltr";
}) => {
  const { contextHolder } = useMessage();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { match } = useMediaQuery("XLUP");
  const router = useRouter();

  const { initPage, locale, userId } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      locale: state.withPersist.config.lang,
      userId: state.withPersist.config.userSession.UserInfo.UserId,
    }),

    shallowEqual
  );

  useEffect(() => {
    const { isAdd } = checkAndRedirectIfNeeded(initPage, pathname);
    const endsWithAllowedPath = allowedEndPaths.some((p) =>
      pathname.endsWith(`/${p}`)
    );

    if (endsWithAllowedPath) {
      return;
    } else {
      if (!isAdd) {
        dispatch(setDeActiveAllPage({}));
        router.replace(`/${locale}/dashboard`);
      }
    }
  }, [pathname]);

  useEffect(() => {
    dispatch(setInitMatch({ match }));
  }, [match]);

  return (
    <div dir={direction} lang={local}>
      <FirebaseNotification />
      {contextHolder}
      {pathname.endsWith(`/${local}`) || pathname.endsWith(`/register`) ? (
        children
      ) : match ? (
        <DesktopLayout>{children}</DesktopLayout>
      ) : (
        <MobileLayout>{children}</MobileLayout>
      )}
      {!!userId && match && <ChatWidget />}
      <ConnectionLost />
    </div>
  );
};
