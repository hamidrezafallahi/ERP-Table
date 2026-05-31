"use client";
import { ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { PageTypeEnum } from '@type/enum';

import HeaderRenderer from './HeaderRenderer';
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
      <div className="hidden-show-scrollBar relative bg-white dark:bg-gray-gray12 px-4 h-[calc(100dvh-74px)] overflow-y-hidden">
        <HeaderRenderer />
        {children}
        <SideMenu />
      </div>
      {menuBarIsActive && <Menubar />}
    </>
  );
}
