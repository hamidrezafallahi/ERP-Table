"use client";
import React, {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  Dots,
  MenuArrowBack,
  Undo,
} from '@components/atoms/iconComponents';
import Title from '@components/atoms/Title';
import CloseButton from '@components/molecules/closeButton';
import ExpandedButton from '@components/molecules/expandedButton';
import {
  useFormHandlers,
  useNavigatePage,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

import CustomDropdownButton from '../customDropdownButton';
import AccountTransfer from './accountTransfer';
import ChangePackage from './changePackage';
import CompanyTransfer from './companyTransfer';
import UserList from './userList';

export default function AccountSettingTemplate() {
  const [selectedSidebar, setSelectedSidebar] = useState("changePackage");
  const t = useTranslations();
  const { initPage, match, lang, pages } = useAppSelector((state) => {
    const initPage = state.withPersist.init;
    const match = state.withPersist.config.initMatch;
    const lang = state.withPersist.config.lang;
    const pages = state.withPersist.pages;
    return { initPage, match, lang, pages };
  }, shallowEqual);

  const dispatch = useDispatch();
  const SIDEBAR_ITEMS = [
    { id: "changePackage", label: t("general.changePackage") },
    { id: "changeUser", label: t("general.changeUser") },
    { id: "transferAccount", label: t("general.transferAccount") },
    { id: "transferCompany", label: t("general.transferCompany") },
  ];

  const { handleReset } = useFormHandlers({
    activePage: pages.find((item) => item.isActive),
    pages,
  });

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: `title.accountSetting`,
        icon: "AccountSettingIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
      })
    );
  }, []);

  return (
    <div className="relative w-full">
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
          title={t("general.fullScreenMode")}
          id="fullScreenMode"
        >
          <ExpandedButton />
        </CustomTooltip>
        <CustomDropdownButton
          // placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
          className="flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded h-full"
          // items={moreItems}
        >
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

      <Title caption="title.accountSetting" />

      {!match && <Toolbar />}

      <div
        className={`flex ${
          selectedSidebar === "changePackage" && !match
            ? " h-[calc(100dvh-180px)]"
            : " h-[calc(100dvh-140px)]"
        }   ${
          match
            ? "flex-row gap-4 h-[calc(100dvh-166px)]  "
            : "flex-col py-3 gap-3 "
        }  overflow-auto`}
      >
        {/* Sidebar */}
        <aside
          className={`bg-gray-gray05  dark:!bg-black-black5 ${
            match
              ? "border border-gray-gray5 dark:!border-black-black5 rounded-lg w-[180px] px-2 py-3"
              : "w-full"
          }  `}
        >
          <nav
            className="block w-full overflow-auto scrollbar-hide"
            aria-label="تنظیمات"
          >
            <div
              className={`flex text-nowrap ${
                match ? "flex-col w-full" : "flex-row w-fit h-10"
              } gap-4`}
            >
              {SIDEBAR_ITEMS.map((item) => (
                <SidebarButton
                  key={item.id}
                  match={match}
                  active={selectedSidebar === item.id}
                  onClick={() => {
                    setSelectedSidebar(item.id);
                  }}
                >
                  {item.label}
                </SidebarButton>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`${
            match ? "px-4 py-3" : "p-2  h-[100dvh-280px]"
          } flex-1 border-dashed border-2 overflow-auto ![&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
          role="main"
          aria-labelledby="account-settings-heading"
        >
          {selectedSidebar === "changePackage" && <ChangePackage />}
          {selectedSidebar === "changeUser" && <UserList />}
          {selectedSidebar === "transferAccount" && <AccountTransfer />}
          {selectedSidebar === "transferCompany" && <CompanyTransfer />}
        </main>
      </div>
    </div>
  );
}

function SidebarButton({
  active,
  onClick,
  children,
  match,
}: {
  match: boolean;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      style={{ boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.04)" }}
      onClick={onClick}
      className={`w-full  py-2 px-4  flex items-center rounded justify-start  disabled:opacity-50 transition-colors duration-150 ${
        active
          ? "bg-gray-gray9 !text-gray-gray1 dark:bg-gray-gray11  dark:text-gray-gray4"
          : "text-gray-gray9 bg-gray-gray3 dark:bg-gray-gray13 dark:text-gray-gray1"
      }
      ${match ? "text-sm font-medium h-10" : "text-xs h-9"}
      `}
    >
      {children}
    </button>
  );
}
const Toolbar = () => {
  const { lang } = useAppSelector((state) => {
    const lang = state.withPersist.config.lang;
    return { lang };
  }, shallowEqual);
  const { navigateBack } = useNavigatePage();
  const t = useTranslations();
  return (
    <div
      className={` ${"justify-between gap-2"} flex items-center  w-full z-10 border-b-gray-gray6 border-b  h-14`}
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
        <div>{t("title.accountSetting")}</div>
      </div>
    </div>
  );
};
