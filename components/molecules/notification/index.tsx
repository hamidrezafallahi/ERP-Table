import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import {
  CustomBadge,
  CustomDropdownButton,
  CustomModal,
} from "@components/atoms/defaultElements";
import {
  Bell,
  NotExistNotificationIcon,
  SpinIcon,
} from "@components/atoms/iconComponents";
import { RootState, useAppSelector } from "@redux/index";
import { setDeActiveAllPage } from "@slice/pages";
import { RenderNotification } from "./renderNotification";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { setNotifications } from "@slice/notification";
import { useNotificationsData } from "./useNotificationsData ";

export default function Notification() {
  const t = useTranslations();
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dispatch = useDispatch();
  const { locale, match } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  const notifications = useAppSelector(
    (state: RootState) => state.withoutPersist.notification.list,
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
          <div className="flex flex-col gap-2 bg-white dark:bg-gray-gray85 shadow-2xl pt-4 pb-6 ps-4 pe-2 rounded w-[400px] h-[70dvh] max-h-[70dvh] overflow-hidden">
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
                  <span className="text-lg font-bold text-main-black">
                    {t("general.notifications")}
                  </span>
                </div>
                <div>
                  <span
                    className="cursor-pointer text-gray-gray12 font-medium text-sm"
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
                <div className="flex justify-center min-h-[60dvh] gap-1 h-full items-center">
                  <Spin size="large" indicator={<SpinIcon />} />
                  <span className="text-gray-gray7 text-sm">
                    درحال بارگذاری....
                  </span>
                </div>
              )}
              {!isListFetching ? (
                notifications?.length > 0 ? (
                  <div className="max-h-[70dvh] overflow-y-auto pe-3">
                    <RenderNotification
                      isDropdown={true}
                      data={notifications}
                      refetchCount={refetchCount}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col justify-center min-h-[60dvh] h-full items-center gap-3 pb-9 pt-8">
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
            className="absolute bottom-2 z-10 rtl:left-3 right-3 [&>sup]:!shadow-none [&>sup]:!bg-redBadge"
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
