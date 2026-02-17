"use client";
import { ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@redux/index';
import { PageTypeEnum } from '@type/enum';

import Menubar from './menubar';
import { SideMenu } from './sideMenu';

export default function MobileLayout(props: { children: ReactNode }) {
  const { children } = props;
  const url = usePathname();

  const { activePage } = useAppSelector((state) => {
    const activePage = state?.withPersist?.pages?.find((item) => item.isActive);

    return { activePage };
  }, shallowEqual);

  const type = activePage?.type;
  const menuBarIsActive =
    url?.includes("dashboard") || type !== PageTypeEnum.Form ? true : false;

  return (
    <>
      {/* <MobileHeader /> */}
      <div className="hidden-show-scrollBar relative bg-white dark:bg-gray-gray12 px-4 h-[calc(100dvh-75px)] overflow-y-auto">
        {children}
      <SideMenu />
      </div>
      {menuBarIsActive && <Menubar />}
    </>
  );
}
