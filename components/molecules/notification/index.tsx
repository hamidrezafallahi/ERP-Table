import {
  useEffect,
  useState,
} from 'react';

import { Spin } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomBadge,
  CustomDropdownButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import {
  Bell,
  NotExistNotificationIcon,
  SpinIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setNotifications } from '@slice/notification';
import { setDeActiveAllPage } from '@slice/pages';

import { RenderNotification } from './renderNotification';
import { useNotificationsData } from './useNotificationsData ';

export default function Notification() {
  const t = useTranslations();
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dispatch = useDispatch();
  const { locale, match, notifications } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      match: state.withPersist.config.initMatch,
      notifications: state.withoutPersist.notification.list,
    }),
    shallowEqual,
  );

  const [refetchStop, setRefetchStop] = useState(notifications.length === 0);

  const {
    data: listData,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useNotificationsData(false, !refetchStop);

  const { data: countData, refetch: refetchCount } = useNotificationsData(
    true,
    false,
  );

  useEffect(() => {
    if (listData?.Data?.length) {
      const notif = listData.Data.slice(0, 20);
      dispatch(setNotifications(notif));
    }
  }, [listData]);

  useEffect(() => {
    if (isNotificationOpen && refetchStop) {
      refetchList?.();
    }
  }, [isNotificationOpen, refetchStop]);

  useEffect(() => {
    if (isNotificationOpen) {
      refetchCount();
    }
  }, [isNotificationOpen]);

  return (
    <>
      <CustomDropdownButton
        dropdownClassName="shadow-none"
        popupRender={() => (
          <div className="flex flex-col gap-2 bg-white dark:bg-gray-gray85 shadow-2xl ps-4 pe-2 pt-4 pb-6 rounded w-[400px] h-[70dvh] max-h-[70dvh] overflow-hidden">
            <div className="flex flex-col gap-2 h-[calc(70dvh-2.5rem)]">
              <div className="flex justify-between items-center gap-2 rounded font-bold text-sm">
                <div className="flex items-center gap-1">
                  <Bell
                    config={{
                      stroke:
                        countData?.ReturnCount && !isNotificationOpen
                          ? "#0E0E0E"
                          : "#585858",
                    }}
                  />
                  <span className="font-bold text-main-black text-lg">
                    {t("general.notifications")}
                  </span>
                </div>
                <div>
                  <span
                    className="font-medium text-gray-gray12 text-sm cursor-pointer"
                    onClick={() => {
                      dispatch(setDeActiveAllPage({}));
                      router.replace(`/${locale}/notification`);
                    }}
                  >
                    {t("general.showAll")}
                  </span>
                </div>
              </div>
              {isListFetching && (
                <div className="flex justify-center items-center gap-1 h-full min-h-[60dvh]">
                  <Spin size="large" indicator={<SpinIcon />} />
                  <span className="text-gray-gray7 text-sm">
                    درحال بارگذاری....
                  </span>
                </div>
              )}
              {!isListFetching ? (
                notifications?.length > 0 ? (
                  <div className="pe-3 max-h-[70dvh] overflow-y-auto">
                    <RenderNotification
                      isDropdown={true}
                      data={notifications}
                      refetchCount={refetchCount}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center gap-3 pt-8 pb-9 h-full min-h-[60dvh]">
                    <NotExistNotificationIcon config={{ stroke: "#767676" }} />
                    <span className="text-gray-gray7 text-base">
                      {t("general.notExistNotifications")}
                    </span>
                  </div>
                )
              ) : null}
            </div>
          </div>
        )}
        placement={locale === "fa" ? "bottomRight" : "bottomLeft"}
        className="relative"
        isOpen={match ? isNotificationOpen : false}
        setIsOpen={setIsNotificationOpen}
      >
        <div className="cursor-pointer">
          <CustomBadge
            count={
              countData?.ReturnCount !== 0 && !isNotificationOpen
                ? countData?.ReturnCount
                : undefined
            }
            size="default"
            className="right-3 bottom-2 rtl:left-3 z-10 absolute [&>sup]:!bg-redBadge [&>sup]:!shadow-none"
            style={{ padding: 0 }}
          />
          <Bell
            config={{
              stroke:
                countData?.ReturnCount && !isNotificationOpen
                  ? "#0E0E0E"
                  : "#585858",
            }}
          />
        </div>
      </CustomDropdownButton>
      <CustomModal
        contentClassName={`lg:min-w-[520px] lg:h-full px-3`}
        headerName={t("general.notifications")}
        closeModal={() => setIsNotificationOpen(false)}
        destroyOnHidden
        isModalOpen={match ? false : isNotificationOpen}
        content={<RenderNotification isDropdown={true} data={notifications} />}
      />
    </>
  );
}
