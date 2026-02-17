import { useEffect, useRef, useState } from "react";

import { Divider } from "antd";
import { useTranslations } from "next-intl";
import Image from "next/image";
import DarkLogo from "public/images/ArianTechDark.png";
import LightLogo from "public/images/ArianTechLight.png";
import { shallowEqual } from "react-redux";
import { toast } from "react-toastify";

import { CustomButton, CustomModal } from "@components/atoms/defaultElements";
import { Close, Settings } from "@components/atoms/iconComponents";
import DefaultCompany from "@components/molecules/defaultParameterModal/company";
import DefaultLanguage from "@components/molecules/defaultParameterModal/language";
import DefaultYear from "@components/molecules/defaultParameterModal/year";
import Notification from "@components/molecules/notification";
import { SystemSettings } from "@components/organisms/systemSetting";
import { useAppSelector } from "@redux/index";

import DefaultConfigs from "./defaultConfigs";
import MegaMenu from "./megaFormMenu";
import SwitchMode from "./switchMode";
import UserAccount from "./userAccount";
import DefaultCurrency from "@components/molecules/defaultParameterModal/currency";

export default function TopHead() {
  const t = useTranslations();

  const { mode, role } = useAppSelector((state) => {
    const mode = state.withPersist.config.theme;
    const role = state.withPersist.config.userSession?.RoleDto?.find(
      (item) => item.isActiveRole
    );

    return { mode, role };
  }, shallowEqual);

  const closeBtnRef = useRef<HTMLDivElement | null>(null);
  const toastCounter = useRef(0);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [openSystemSettingModal, setOpenSystemSettingModal] = useState(false);

  const logo = mode == "light" ? DarkLogo : LightLogo;

  const handleCloseToasts = () => {
    toast.dismiss();
  };

  const handleOpenSystemSetting = () => {
    setOpenSystemSettingModal(true);
  };

  useEffect(() => {
    const unsubscribe = toast.onChange((payload) => {
      if (payload.status === "added") {
        toastCounter.current += 1;
      } else if (payload.status === "removed") {
        toastCounter.current = Math.max(0, toastCounter.current - 1);
      }
      if (closeBtnRef.current) {
        if (toastCounter.current >= 3) {
          closeBtnRef.current.style.display = "block";
        } else {
          closeBtnRef.current.style.display = "none";
        }
      }
    });

    return () => unsubscribe();
  }, []);
  return (
    <>
      <div className={` w-full h-full flex justify-between items-center`}>
        <div className="flex justify-center items-center w-[150px] h-full">
          <Image src={logo} alt="header logo" className="object-cover" />
        </div>
        <div className="flex justify-center items-center gap-x-3 me-2">
          <MegaMenu />
          {!(role == undefined || role.IsSupporter === true) && (
            <Divider
              type="vertical"
              className="bg-gray-gray10 opacity-50 !m-0 h-6"
            />
          )}
          <div className="flex gap-0">
            <div className="w-fit">
              <DefaultCurrency setOpenModal={setOpen} setContent={setContent} />
            </div>
            <div className="w-fit">
              <DefaultYear setOpenModal={setOpen} setContent={setContent} />
            </div>
            <div className="w-fit">
              <DefaultCompany setOpenModal={setOpen} setContent={setContent} />
            </div>
            <div className="w-fit">
              {(role == undefined || role.IsSupporter === true) && (
                <DefaultLanguage
                  setOpenModal={setOpen}
                  setContent={setContent}
                  showReverse
                />
              )}
            </div>
          </div>
          <DefaultConfigs setOpenModal={setOpen} setContent={setContent} />
          {!(role == undefined || role.IsSupporter === true) && (
            <Divider
              type="vertical"
              className="bg-gray-gray10 opacity-50 !m-0 h-6"
            />
          )}

          <div className="flex items-center gap-[1.125rem]">
            <SwitchMode />
            <div
              className="flex items-center h-8 cursor-pointer"
              onClick={handleOpenSystemSetting}
            >
              <Settings />
            </div>
            <Notification />
          </div>
          <UserAccount />
        </div>
      </div>
      <div
        ref={closeBtnRef}
        style={{ display: "none" }}
        className="top-10 right-[420px] !z-[1356] fixed"
      >
        <CustomButton
          type="text"
          className="gap-2 bg-main-white hover:!bg-main-white dark:!bg-gray-gray9 !m-0 !p-1 px-2 border-state-error1 hover:border-state-error1 text-state-error1 hover:text-state-error1 dark:text-[#f8f8f8] cursor-pointer"
          onClick={handleCloseToasts}
        >
          <Close
            config={{
              width: 8,
              height: 8,
              stroke: "#dc3545",
            }}
          />
          {t("general.closeAll")}
        </CustomButton>
      </div>
      <CustomModal
        key={content?.key ?? "empty"}
        contentClassName="lg:w-[425px] sm:!w-[570px] !max-h-[600px] rounded-b-lg overflow-hidden "
        className="!top-[50px] sm:!w-[570px] lg:w-[425px]"
        closeModal={() => {
          setOpen(false);
          setContent(null);
        }}
        isModalOpen={open}
        content={content?.content}
        {...(content?.title ? { title: content.title } : {})}
      />
      {openSystemSettingModal && (
        <CustomModal
          contentClassName={`lg:w-[800px] lg:h-[500px]`}
          headerName={t("title.systemSetting")}
          closeModal={() => setOpenSystemSettingModal(false)}
          isModalOpen={openSystemSettingModal}
          content={<SystemSettings />}
        />
      )}
    </>
  );
}
