import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  ClosePageIcon,
  MenuArrowBack,
  Reload,
} from '@components/atoms/iconComponents';
import { useNavigatePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';

import ExpandedButton from '../expandedButton';

export const NotificationToolbar = ({
  setPageNumber,
  setQuickSearch,
  refetch,
}) => {
  const t = useTranslations();
  const router = useRouter();


  const { locale,match } = useAppSelector(
    (state) => ({
      match:state.withPersist.config.initMatch,
      locale: state.withPersist.config.lang,
    }),
    shallowEqual
  );
  const { navigateBack } = useNavigatePage();
  const handleRefreshData = () => {
    setPageNumber(1);
    setQuickSearch("");
    refetch();
  };
  const handleClosePage = () => {
    router.replace(`/${locale}/dashboard`);
  };
  return (
    <>
      <div
        className={`${
          match ? "justify-end" : "justify-between"
        } flex items-center gap-2  w-full h-full`}
      >
        {match ? (
          <div className="flex gap-2">
            <CustomTooltip title={t("formToolbar.closePage")}>
              <CustomButton
                type="text"
                className="!bg-gray-gray3 dark:!bg-gray-gray11 !p-0 border-none rounded w-9 h-9"
                onClick={handleClosePage}
              >
                <ClosePageIcon />
              </CustomButton>
            </CustomTooltip>
            <CustomTooltip title={t("general.fullScreenMode")}>
              <ExpandedButton />
            </CustomTooltip>
            <CustomTooltip title={t("general.reload")}>
              <div
                className="flex bg-gray-gray3 dark:bg-gray-gray10 p-[6px] rounded h-full"
                onClick={handleRefreshData}
              >
                <Reload
                  config={{
                    width: 24,
                    height: 24,
                  }}
                />
              </div>
            </CustomTooltip>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mt-2">
              <div
                className={`${
                  locale !== "fa" ? "rotate-180" : ""
                } flex bg-white dark:bg-gray-gray12 p-[6px] rounded h-full `}
                onClick={navigateBack}
              >
                <MenuArrowBack
                  config={{
                    width: 24,
                    height: 24,
                  }}
                />
              </div>
              <span className="text-xs">{t(`title.notification`)}</span>
            </div>
            <div className="flex gap-2"></div>
          </>
        )}
      </div>
    </>
  );
};
