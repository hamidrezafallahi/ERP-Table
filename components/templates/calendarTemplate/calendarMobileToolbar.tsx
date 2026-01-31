import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { MenuArrowBack } from '@components/atoms/iconComponents';
import { useNavigatePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';

const CalendarMobileToolbar = () => {
  const { lang } = useAppSelector((state) => {
    const lang = state.withPersist.config.lang;
    return { lang };
  }, shallowEqual);

  const { navigateBack } = useNavigatePage();
  const t = useTranslations();

  return (
    <div
      className={`justify-between gap-2 top-0 right-0 left-0 flex items-center w-full z-10 border-b-gray-gray6 border-b sticky bg-white h-14`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`${
            lang !== "fa" ? "rotate-180" : ""
          } z-10 flex bg-white dark:bg-gray-gray11 pt-1 rounded h-full`}
          onClick={navigateBack}
        >
          <MenuArrowBack
            config={{
              width: 24,
              height: 24,
            }}
          />
        </div>

        <div>{t("title.calendar")}</div>
      </div>
    </div>
  );
};

export default CalendarMobileToolbar;
