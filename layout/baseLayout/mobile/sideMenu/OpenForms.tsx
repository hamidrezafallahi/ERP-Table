import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { Close } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import OpenPages from '@layout/baseLayout/desktop/menuBar/sideHeader/openPages';
import { setMenuBar } from '@slice/config';
import { resetData } from '@utils/core';

export default function OpenForms() {
  const router = useRouter();
  const t = useTranslations();
  const dispatch = useDispatch();

  const { pages, locale } = useAppSelector(
    (state) => ({
      pages: state.withPersist.pages,
      locale: state.withPersist.config.lang,
    }),
    shallowEqual
  );

  const closeAll = () => {
    resetData(dispatch);
    router.replace(`/${locale}/dashboard`);
    dispatch(
      setMenuBar({
        menuBar: { label: null, value: null },
      })
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {pages && pages.length > 1 && (
        <CustomButton
          type="text"
          onClick={closeAll}
          className="gap-2 bg-gray-gray5 !m-0 !p-1 !rounded-sm text-black-black6 text-xs"
        >
          <Close config={{ width: 12, height: 12 }} />
          {t("general.closeAll")}
        </CustomButton>
      )}
      <OpenPages />
    </div>
  );
}
