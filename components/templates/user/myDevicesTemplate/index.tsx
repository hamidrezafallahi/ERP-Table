"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Spin } from 'antd';
import moment from 'moment-jalaali';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomModal,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  CloseModalIcon,
  DetailIcon,
  DisableIcon,
  Dots,
  EmptyDeviceListIcon,
  MenuArrowBack,
  MobileIcon,
  MonitorIcon,
  Play,
  SpinIcon,
  TabletIcon,
  Undo,
} from '@components/atoms/iconComponents';
import Title from '@components/atoms/Title';
import CloseButton from '@components/molecules/closeButton';
import ExpandedButton from '@components/molecules/expandedButton';
import {
  useFormHandlers,
  useNavigatePage,
} from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type { IRequest } from '@services/mng/report/type';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';
import { getTokens } from '@utils/cookie';
import {
  showErrorToast,
  showSuccessToast,
} from '@utils/toast';

import CustomDropdownButton from '../customDropdownButton';
import type {
  IUserAgentDevice,
  IUserAgentResponse,
} from './type';

export default function MyDevicesTemplate() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const { initPage, match, lang, pages } = useAppSelector((state) => {
    const initPage = state.withPersist.init;
    const match = state.withPersist.config.initMatch;
    const lang = state.withPersist.config.lang;
    const pages = state.withPersist.pages;
    return { initPage, match, lang, pages };
  }, shallowEqual);

  const [devices, setDevices] = useState<IUserAgentDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IUserAgentDevice | null>(
    null,
  );
  const [currentDevice, setCurrentDevice] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAllConfirm, setShowAllConfirm] = useState(false);

  const [triggerItem, { isLoading: triggerItemIsLoading }] =
    useCUDDataMutation();
  const { navigateBack } = useNavigatePage();
  const deviceToken = localStorage.getItem("fcm_token");
  const accessToken = getTokens("_auth");
  const { data, isLoading, refetch } = useGetData<
    IUserAgentResponse | any,
    IRequest
  >({
    url: "/api/auth/select/user/useragent",
    body: {
      DeviceToken: deviceToken,
      Token: accessToken.val,
    },
  });

  useEffect(() => {
    if (!data?.Data) return;
    setDevices(data.Data);

    const activeDevice = data.Data.find((d) => d.IsActiveToken);
    setCurrentDevice(activeDevice || null);
  }, [data]);

  const handleRevokeAllAccess = async () => {
    try {
      const res: any = await triggerItem({
        url: "/api/auth/delete/user/truncateAllUserDevices",
        body: { DeviceToken: deviceToken },
      }).unwrap();

      if (res.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        refetch();
      }
    } catch (error) {
      showErrorToast(t("toast.failedTitle"));
    } finally {
      setShowAllConfirm(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!selectedDevice) return;
    try {
      const handleRevokeAccessRes: any = await triggerItem({
        url: "/api/auth/delete/user/truncateUserDevice",
        body: {
          CacheKey: selectedDevice.CacheKey,
        },
      }).unwrap();

      if (handleRevokeAccessRes.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        refetch();
      }
    } catch (error) {
      showErrorToast(t("toast.failedTitle"));
    } finally {
      setShowConfirm(false);
      setSelectedDevice(null);
    }
  };
  const inactiveDevices = useMemo(
    () => devices.filter((d) => !d.IsActiveToken),
    [devices],
  );

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: `title.myDevices`,
        icon: "MyDevicesIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
      }),
    );
  }, []);

  const { handleReset } = useFormHandlers({
    activePage: pages?.find((item) => item.isActive),
    pages,
  });

  const renderDeviceIcon = (device?: IUserAgentDevice) => {
    const deviceName = device?.Device;
    if (deviceName == "Mobile" || deviceName == "Phone")
      return <MobileIcon config={{ width: 22, height: 22 }} />;
    if (
      deviceName == "Tablet" ||
      deviceName == "Ipad" ||
      deviceName == "Laptop"
    )
      return <TabletIcon config={{ width: 22, height: 22 }} />;
    return <MonitorIcon config={{ width: 22, height: 22 }} />;
  };
  const formatTime = (value) => {
    const date = new Date(value);

    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");

    return `${h}:${m}:${s}`;
  };
  const times = devices.map((i) => i.LastLoginDate);
  const utc = times.map((i) =>
    moment(1761978900000).utc().format("HH:mm:ss.SSSZ"),
  );
  const tehran = times.map((i) =>
    moment(1761978900000).locale("fa").format("HH:mm:ss.SSSZ"),
  );

  console.log(tehran);

  return (
    <>
      {!match ? (
        <div className="relative flex items-center mb-4 border-b h-14">
          <div
            className={`${
              lang !== "fa" ? "rotate-180" : ""
            } cursor-pointer flex bg-white p-[6px] rounded gap-2`}
            onClick={navigateBack}
          >
            <MenuArrowBack config={{ width: 24, height: 24 }} />
            {t("title.myDevices")}
          </div>
        </div>
      ) : (
        <div
          className={`-top-16 absolute flex gap-4 ${
            lang == "fa" ? "left-0" : "right-0"
          }`}
        >
          <CustomTooltip title={t("formToolbar.closePage")}>
            <CloseButton />
          </CustomTooltip>

          <CustomTooltip
            className="bg-gray-gray3 dark:bg-gray-gray11 rounded h-full"
            id="fullScreenMode"
          >
            <ExpandedButton />
          </CustomTooltip>
          <CustomDropdownButton className="flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded h-full">
            <span className="cursor-pointer">
              <Dots />
            </span>
          </CustomDropdownButton>
          <CustomTooltip
            title={t("formToolbar.revalidate")}
            className="hidden xxl:block"
          >
            <CustomButton
              type="text"
              className="flex justify-center items-center bg-gray-gray3 !hover:bg-white hover:bg-gray-gray8 dark:bg-gray-gray11 px-[6px] border rounded h-9 text-gray dark:text-white"
              onClick={handleReset}
              id="reload"
            >
              <Undo
                config={{
                  width: 24,
                  height: 24,
                }}
              />
            </CustomButton>
          </CustomTooltip>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center w-full h-full">
          <Spin
            size="small"
            indicator={<SpinIcon config={{ width: 20, height: 20 }} />}
          />
        </div>
      )}

      <div
        className={`relative h-[calc(100dvh-170px)] ${
          match ? "px-4 py-3" : "p-2 overflow-auto"
        } border-dashed border-2 `}
      >
        <Title caption="title.myDevices" />

        <h5 className="flex items-center gap-2 font-bold text-gray-gray135 dark:text-gray-gray1 text-sm">
          <Play />
          {t("general.listOfDevices")}
        </h5>

        <div className="flex flex-col justify-start gap-1 px-2 pt-2 pb-5">
          <p className="text-gray-gray9 dark:text-gray-gray1 text-xs leading-5">
            {t("myDevices.text1")}
          </p>
          <div className="flex justify-start items-start gap-2 pr-3">
            <span className="bg-blue-blue5 mt-3 rounded-full w-1 h-1" />
            <p className="text-blue-blue5 text-xs leading-6">
              {t("myDevices.text2")}
            </p>
          </div>
        </div>

        <h5 className="mb-2 font-medium text-main-black lg:text-md dark:text-gray-gray1 text-xs">
          {t("general.currentDevice")}
        </h5>
        {currentDevice ? (
          <div className="items-center grid lg:grid-cols-[300px_150px_1fr] bg-gray-gray1 my-2 px-4 border-[3px] border-gray-gray6 rounded-2xl h-[77px] lg:h-20">
            <span className="flex items-center gap-2 font-medium text-main-black lg:text-[22px] dark:text-gray-gray1 text-sm text-right">
              {renderDeviceIcon()}
              <p>
                {`${currentDevice.OS} (${currentDevice.OSVersion}) — ${currentDevice.Browser}`}

                <br />
                <span className="font-medium text-main-black dark:text-gray-gray1 text-xs">
                  {currentDevice.Ip}
                </span>
              </p>
            </span>
            <span className="inline font-medium text-gray-gray10 lg:text-md dark:text-gray-gray1 text-sm lg:text-center text-right">
              <p>{`${currentDevice.BrowserVersion}`}</p>
            </span>
          </div>
        ) : (
          " "
        )}

        <div className="my-6 border-b-2 border-dashed" />

        {inactiveDevices.length === 0 ? (
          <div className="flex flex-col justify-center items-center rounded-lg w-full h-[calc(100dvh-450px)]">
            <EmptyDeviceListIcon />
            <p className="mt-3 font-medium text-gray-gray8 dark:text-gray-gray1 text-sm">
              {t("myDevices.thereAreCurrentlyNoActiveDevices")}
            </p>
          </div>
        ) : (
          <section className="flex flex-col justify-between h-[calc(100dvh-450px)]">
            <div>
              <h5 className="hidden lg:block mb-2 font-medium text-md text-state-success1">
                {t("myDevices.activeDevices")}
              </h5>

              <div className="h-[calc(100dvh-550px)] overflow-auto">
                {inactiveDevices?.map((device) => {
                  return (
                    <div
                      key={device.CacheKey}
                      className="items-center gap-3 sm:gap-[] grid lg:grid-cols-[300px_150px_150px_1fr] bg-gray-gray1 dark:bg-gray-gray11 my-2 p-3 px-4 border-[3px] border-gray-gray6 rounded-2xl lg:h-20"
                    >
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          {renderDeviceIcon()}
                          <p className="font-medium text-main-black dark:text-gray-gray1 text-sm lg:text-xl text-right !leading-5">
                            {`${device.OS} (${device.OSVersion}) — ${device.Browser}`}{" "}
                            <br />
                            <span className="text-main-black dark:text-gray-gray1 text-xs">
                              {device.Ip}
                            </span>
                          </p>
                        </span>

                        <button
                          className="lg:hidden -ml-2"
                          onClick={() => {
                            setSelectedDevice(device);
                            setShowConfirm(true);
                          }}
                        >
                          <DetailIcon />
                        </button>
                      </div>

                      <span className="inline font-medium text-gray-gray10 lg:text-md dark:text-gray-gray1 text-sm lg:text-center text-right">
                        <p>{`${currentDevice?.BrowserVersion}`}</p>
                      </span>

                      <span className="inline font-medium text-gray-gray10 lg:text-md dark:text-gray-gray1 text-sm lg:text-center text-right">
                        {moment(device.LastLoginDate)
                          .locale("fa")
                          .format("jYYYY/jMM/jDD - HH:mm:ss")}
                      </span>

                      <div className="flex justify-center sm:justify-end">
                        <CustomButton
                          className="hidden lg:flex justify-center items-center p-3 border border-gray-gray10 hover:!border-gray-gray10 h-10 text-gray-gray10 hover:!text-gray-gray10 dark:text-gray-gray1 text-sm"
                          onClick={() => {
                            setSelectedDevice(device);
                            setShowConfirm(true);
                          }}
                        >
                          <div className="flex gap-1">
                            <DisableIcon />
                            {t("general.accessCutOff")}
                          </div>
                        </CustomButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <CustomButton
              className="items-center mx-auto p-3 border-2 border-state-error1 hover:!border-state-error1 w-60 h-10"
              onClick={() => {
                setShowAllConfirm(true);
              }}
            >
              <div className="flex justify-center items-center gap-1">
                <DisableIcon config={{ stroke: "#dc3545" }} />
                <p className="text-state-error1 hover:!text-state-error1 text-sm">
                  {t("general.disableAccessToAllDevices")}
                </p>
              </div>
            </CustomButton>
          </section>
        )}

        {/* Remove only this  Devices  modal */}
        <CustomModal
          isModalOpen={showConfirm}
          headerIcon={null}
          footer={null}
          centered
          closeModal={null}
          disableTitle
          closable={false}
          content={
            <div className="flex flex-col justify-center items-center lg:p-16 lg:w-[627px] h-full lg:h-80 text-center">
              <div
                className="top-5 left-5 fixed justify-center items-center"
                onClick={() => {
                  setShowConfirm(false);
                }}
              >
                <CloseModalIcon />
              </div>

              <p className="font-medium text-[18px] text-gray-gray9">
                {t("general.areYouDisabledTheDevice")}
                <span className="px-2 text-main-black">
                  {selectedDevice?.Browser}
                </span>
                {t("general.areYouSureText")}
              </p>
              <p className="font-medium text-[18px] text-gray-gray9">
                {t("myDevices.text3")}
              </p>
              <div className="flex justify-center gap-7 mt-10">
                <CustomButton
                  className="flex justify-center items-center !bg-main-black rounded w-28 lg:w-44 h-10 !text-white text-sm"
                  onClick={handleRevokeAccess}
                >
                  {triggerItemIsLoading ? (
                    <Spin size="large" indicator={<SpinIcon />} />
                  ) : (
                    t("general.accept")
                  )}
                </CustomButton>
                <CustomButton
                  className="flex justify-center items-center border border-main-black rounded w-28 lg:w-44 h-10 text-main-black text-sm"
                  onClick={() => {
                    setShowConfirm(false);
                  }}
                >
                  {t("general.cancel")}
                </CustomButton>
              </div>
            </div>
          }
        />

        {/* Remove All  Devices  modal */}
        <CustomModal
          isModalOpen={showAllConfirm}
          headerIcon={null}
          footer={null}
          centered
          closeModal={null}
          disableTitle
          closable={false}
          content={
            <div className="flex flex-col justify-center items-center lg:p-16 lg:w-[627px] h-full lg:h-80 text-center">
              <div
                className="top-5 left-5 fixed justify-center items-center"
                onClick={() => {
                  setShowAllConfirm(false);
                }}
              >
                <CloseModalIcon />
              </div>

              <p className="font-medium text-[18px] text-gray-gray9">
                {t("myDevices.modalConfirm")}
                <span className="mx-2 px-2 text-main-black">
                  {t("general.exceptForTheCurrentDevice")}
                </span>
                {t(
                  "general.youWillBeLoggedOutOfYourAccountAndWillNeedToAuthenticateToLogBackIn",
                )}
              </p>

              <div className="flex justify-center gap-7 mt-10">
                <CustomButton
                  className="flex justify-center items-center !bg-main-black rounded w-28 lg:w-44 h-10 !text-white text-sm"
                  onClick={handleRevokeAllAccess}
                >
                  {triggerItemIsLoading ? (
                    <Spin size="large" indicator={<SpinIcon />} />
                  ) : (
                    t("general.accept")
                  )}
                </CustomButton>
                <CustomButton
                  className="flex justify-center items-center border border-main-black rounded w-28 lg:w-44 h-10 text-main-black text-sm"
                  onClick={() => {
                    setShowAllConfirm(false);
                  }}
                >
                  {t("general.cancel")}
                </CustomButton>
              </div>
            </div>
          }
        />
      </div>
    </>
  );
}
