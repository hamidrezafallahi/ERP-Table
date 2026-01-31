"use client";
import React, {
  useEffect,
  useState,
} from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@redux/index';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

import AccountTransfer from './accountTransfer';
import ChangePackage from './changePackage';
import CompanyTransfer from './companyTransfer';
import UserList from './userList';

export default function BuyAccount() {
  const [selectedSidebar, setSelectedSidebar] = useState("changePackage");

  const { initPage, match } = useAppSelector((state) => {
    const initPage = state.withPersist.init;
    const match = state.withPersist.config.initMatch;

    return { initPage, match };
  }, shallowEqual);

  const dispatch = useDispatch();

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
  }, [match]);

  return (
    <div className="relative w-full">
      <main
        className={`${
          match ? "px-4 py-3" : "p-2  h-[100dvh-280px]"
        } flex-1  overflow-auto ![&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
        role="main"
      >
        {selectedSidebar === "changePackage" && <ChangePackage />}
        {selectedSidebar === "changeUser" && <UserList />}
        {selectedSidebar === "transferAccount" && <AccountTransfer />}
        {selectedSidebar === "transferCompany" && <CompanyTransfer />}
      </main>
    </div>
  );
}
