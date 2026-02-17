"use client";
import { createElement, memo, ReactNode } from "react";

import { shallowEqual } from "react-redux";

import { useAppSelector } from "@redux/index";
import { PageTypeEnum } from "@type/enum";

import ActionBar from "./actionBar";
import BaseMenu from "./menuBar/baseMenu";
import SideHeader from "./menuBar/sideHeader";
import Navbar from "./nav";
import TopHead from "./topHead";

const MemoizedTopHead = memo(TopHead);
const MemoizedNavbar = memo(Navbar);

function DesktopLayout({ children }: { children: ReactNode }) {
  const { direction, pages, fullScreen } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
      direction: state.withPersist.config.direction,
      pages: state.withPersist.pages,
      fullScreen: state.withPersist.config.fullScreen,
    }),
    shallowEqual
  );
  const activePage = pages?.find((item) => item.isActive === true);
  const height = Math.min(pages.length * 70, 180);
  return (
    <div className="px-3 h-[100dvh]">
      <div
        className={`w-full ${
          fullScreen ? "!h-0" : "h-[65px]"
        }  overflow-hidden  transition-all duration-500`}
      >
        {createElement(MemoizedTopHead)}
      </div>
      <div
        className={`w-full  ${
          fullScreen ? "h-[100dvh]" : "h-[calc(100dvh-65px)]"
        } flex  `}
      >
        {/* right sidebar */}
        <div
          className={`flex flex-col gap-2 overflow-x-clip  pb-4 transition-all duration-500 ${
            fullScreen ? " w-0 px-0 " : " w-72 xxl:w-96 px-2 overflow-hidden"
          } `}
        >
          {pages && pages.length !== 0 && (
            <div
              className={`w-full  transition-all  duration-500
              overflow-y-auto  hidden-show-scrollBar relative ${
                fullScreen ? ` -start-52 lg:-start-72 -z-10 ` : `start-0`
              } `}
            >
              <SideHeader />{" "}
            </div>
          )}
          <div
            className={`w-full  transition-all  duration-500
              overflow-y-auto  hidden-show-scrollBar relative ${
                fullScreen ? ` -start-52 lg:-start-72 -z-10 ` : `start-0`
              } `}
            style={{
              height: `calc(100dvh - ${130 + height}px)`,
            }}
          >
            <BaseMenu />
          </div>
        </div>
        {/* main content */}
        <div className={`h-full transition-all duration-500 w-full`}>
          <div className="justify-center items-center h-16">
            {createElement(MemoizedNavbar)}
          </div>
          <div
            className={`border rounded-2xl p-4 ${
              fullScreen ? " h-[calc(100dvh-76px)]" : "h-[calc(100dvh-140px)]"
            }`}
          >
            {children}
          </div>
        </div>
        {/* left sidebar */}
        {(activePage?.type == PageTypeEnum.Form ||
          activePage?.type == PageTypeEnum.List) && <ActionBar />}
      </div>
    </div>
  );
}

export default memo(DesktopLayout);
