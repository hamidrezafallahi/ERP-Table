"use client";
import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";

import Title from "@components/atoms/Title";

import { useAppSelector } from "@redux/index";
import { addNewPage } from "@slice/pages";
import { PageStateEnum } from "@slice/pages/enum";
import { PageTypeEnum, SystemEnum } from "@type/enum";
import { AccountSettingTreasury } from "@components/organisms/accounting";
import { IActiveTab } from "@components/molecules/accounting/accountSetting/tab/type";
import {
  AccountSettingTab,
  SubtotalSelection,
} from "@components/molecules/accounting";

export default function AccountSetting() {
  const t = useTranslations();
  const dispatch = useDispatch();

  const [selectedSubtotal, setSelectedSubtotal] = useState<number[]>([]);
  const [active, setActive] = useState<IActiveTab>({ key: "1-1", value: 1 });

  const renderTab = {
    "1-1": <AccountSettingTreasury selectedSubtotal={selectedSubtotal} />,
    "1-2": <span className="m-10 text-4xl text-center">شابلون خزانه داری</span>,
    "2": <span className="m-10 text-4xl text-center">فروش</span>,
    "3": <span className="m-10 text-4xl text-center">خرید</span>,
    "4": <span className="m-10 text-4xl text-center">حقوق و دستمزد</span>,
    "5": <span className="m-10 text-4xl text-center">انبارداری</span>,
  };
  const initPage = useAppSelector((state) => state.withPersist.init);
  const pageType = PageTypeEnum.Custom;

  // const repoId = initPage?.RepoId;
  const pageId = initPage?.pageId;
  // const systemId = initPage?.SystemId;
  const baseUrl = initPage?.url;
  // const id = initPage?.Id;

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: pageId,
        caption: "title.accountSetting",
        pageState: PageStateEnum.Opened,
        type: pageType,
        RepoId: 5001,
        SystemId: SystemEnum.acc,
        pageData: [],
        url: baseUrl,
      })
    );
  }, []);

  return (
    <>
      <Title caption={"title.accountSetting"} />
      <div className="gap-x-2 grid grid-cols-4">
        <SubtotalSelection
          selectedSubtotal={selectedSubtotal}
          setSelectedSubtotal={setSelectedSubtotal}
        />
        <div className="flex flex-col gap-1 col-span-3 mt-1">
          <span>{t("general.systems")}</span>
          <AccountSettingTab active={active} setActive={setActive} />
          {/* <AccountSettingTreasury selectedSubtotal={selectedSubtotal} /> */}
          {renderTab[active.key]}
        </div>
      </div>
    </>
  );
}
