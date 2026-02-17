"use client";
import { useEffect, useRef, useState } from "react";

import { Collapse } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton, CustomModal } from "@components/atoms/defaultElements";
import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import { Close, DownChevron } from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";
import { PageStateEnum } from "@slice/pages/enum";
import { resetData } from "@utils/core";

import OpenedPages from "./openPages";

export default function SideHeader() {
  const router = useRouter();
  const t = useTranslations();
  const dispatch = useDispatch();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const openedPagesRef = useRef<HTMLDivElement | null>(null);
  const { pages, local, match } = useAppSelector(
    (state) => ({
      pages: state.withPersist.pages,
      local: state.withPersist.config.lang,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );

  const [confirmCloseModalIsOpen, setConfirmCloseModalIsOpen] = useState(false);
  const [confirmCloseDrawerIsOpen, setConfirmCloseDrawerIsOpen] =
    useState(false);

  const closeAll = () => {
    const isPageChanging = pages.find(
      (page) => page.pageState === PageStateEnum.Changed
    );
    if (isPageChanging) {
      match
        ? setConfirmCloseModalIsOpen(true)
        : setConfirmCloseDrawerIsOpen(true);
    } else {
      resetData(dispatch);
      router.replace(`/${local}/dashboard`);
    }
  };

  const handleConfirm = () => {
    resetData(dispatch);
    router.replace(`/${local}/dashboard`);

    match
      ? setConfirmCloseModalIsOpen(false)
      : setConfirmCloseDrawerIsOpen(false);
  };
  const handleCancel = () => {
    setConfirmCloseModalIsOpen(false);
  };

  useEffect(() => {
    if (openedPagesRef.current) {
      openedPagesRef.current.scrollTop = openedPagesRef.current.scrollHeight;
    }
  }, [pages]);
  return (
    <div ref={headerRef}>
      <Collapse
        collapsible="icon"
        defaultActiveKey={pages.length > 0 ? ["1"] : undefined}
        className={` [&>.ant-collapse-item>.ant-collapse-header]:!p-0 border-none !w-full`}
        expandIconPosition="end"
        expandIcon={(panelProps) => (
          <span
            className={panelProps.isActive ? "-rotate-180" : ""}
            style={{ transition: "transform 0.3s" }}
          >
            <DownChevron />
          </span>
        )}
        items={[
          {
            key: "1",
            label: (
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-[16px] text-black-black3 dark:!text-white">{`${t(
                  "sidebar.openPages"
                )}(${pages.length > 0 ? pages.length : 0})`}</span>

                <CustomButton
                  type="text"
                  onClick={closeAll}
                  className="gap-1 bg-gray-gray5 dark:!bg-gray-gray9 !m-0 !p-1 !rounded-sm h-4 text-3xs text-black-black6 dark:text-[#f8f8f8] cursor-pointer"
                >
                  <Close
                    config={{
                      width: 8,
                      height: 8,
                    }}
                  />
                  {t("general.closeAll")}
                </CustomButton>
              </div>
            ),
            className:
              "whitespace-nowrap [&>.ant-collapse-content]:!border-t-0",
            children: (
              <div
                ref={openedPagesRef}
                className={`dark:bg-gray-gray13  max-h-36 overflow-x-hidden overflow-y-auto font-normal text-gray-gray85  `}
              >
                <OpenedPages />
              </div>
            ),
          },
        ]}
      />
      {confirmCloseModalIsOpen && (
        <CustomModal
          width={300}
          centered
          disableTitle
          closeModal={() => {
            setConfirmCloseModalIsOpen(false);
          }}
          isModalOpen={confirmCloseModalIsOpen}
          content={
            <div
              className={`${
                match ? "p-4" : ""
              } flex flex-col justify-center items-center gap-2 px-4 rounded custom-confirm-modal`}
            >
              <span className="mx-4 text-center">
                {t("general.confirmText")}
              </span>

              <div className="flex justify-between gap-4 mt-4 w-full">
                <CustomButton
                  type="text"
                  onClick={handleCancel}
                  className="bg-white px-10 py-2 border-2 border-black-black8 hover:border-black-black8 rounded w-full text-[12px] text-main-black"
                >
                  {t("general.no")}
                </CustomButton>
                <CustomButton
                  type="text"
                  onClick={() => handleConfirm()}
                  className="bg-black-black8 hover:bg-white px-10 py-2 border hover:border-black-black8 rounded ring-0 w-full text-[12px] text-white"
                >
                  {t("general.yes")}
                </CustomButton>
              </div>
            </div>
          }
        />
      )}

      <CustomDrawer
        isOpen={confirmCloseDrawerIsOpen}
        onClose={() => {
          setConfirmCloseDrawerIsOpen(false);
        }}
        content={
          <div
            className={`${
              match ? "p-4" : ""
            } flex flex-col justify-center items-center gap-2 px-4 rounded custom-confirm-modal`}
          >
            <span className="mx-4 text-center">{t("general.confirmText")}</span>

            <div className="flex flex-wrap justify-between gap-4 mt-4 w-full">
              <CustomButton
                type="text"
                onClick={handleCancel}
                className="bg-white px-10 py-2 border-2 border-black-black8 hover:border-black-black8 rounded w-full text-[12px] text-main-black"
              >
                {t("general.no")}
              </CustomButton>
              <CustomButton
                type="text"
                onClick={() => handleConfirm()}
                className="bg-black-black8 hover:bg-white px-10 py-2 border hover:border-black-black8 rounded ring-0 w-full text-[12px] text-white"
              >
                {t("general.yes")}
              </CustomButton>
            </div>
          </div>
        }
      />
    </div>
  );
}
