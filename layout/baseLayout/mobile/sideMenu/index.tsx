import { ReactElement, useEffect } from "react";

import dynamic from "next/dynamic";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { MenuArrowBack } from "@components/atoms/iconComponents";
import BaseMenu from "@layout/baseLayout/desktop/menuBar/baseMenu";
import UserAccount from "@layout/baseLayout/desktop/topHead/userAccount";
import { useAppSelector } from "@redux/index";
import { setMenuBar } from "@slice/config";
import { IDefaultConfigs } from "@slice/config/type";

import SideMenuModal from "./SideMenuModal";

const New = dynamic(() => import("./new"));
const OpenPages = dynamic(() => import("./OpenForms"));

export const SideMenu = () => {
  const dispatch = useDispatch();
  const { menuBar, lang, CashierId, CurrencyId, LanguageId, PlaceId, YearId } =
    useAppSelector(
      (state) => ({
        CashierId: state.withPersist.config.defaultConfigs?.CashierId,
        CurrencyId: state.withPersist.config.defaultConfigs?.CurrencyId,
        LanguageId: state.withPersist.config.defaultConfigs?.LanguageId,
        PlaceId: state.withPersist.config.defaultConfigs?.PlaceId,
        YearId: state.withPersist.config.defaultConfigs?.YearId,
        menuBar: state.withPersist.config.menuBar,
        lang: state.withPersist.config.lang,
      }),
      shallowEqual
    );
  const removeMenuSide = () => {
    dispatch(setMenuBar({ menuBar: { value: 0, label: "" } }));
  };
  const menuComponents: { [key: number]: ReactElement } = {
    1: (
      <div className="h-[calc(100dvh-125px)]">
        <BaseMenu />
      </div>
    ),
    2: <New />,
    3: <OpenPages />,
    4: <SideMenuModal removeMenuSide={removeMenuSide} />,
    5: <UserAccount list />,
  };

  const MenuComponent = (menuComponents[
    menuBar.value as keyof typeof menuComponents
  ] as ReactElement) || <></>;
  if (!MenuComponent) {
    throw new Error(`Invalid menuBar value: ${menuBar.value}`);
  }

  const globals: IDefaultConfigs = {
    CurrencyId,
    CashierId,
    PlaceId,
    YearId,
    LanguageId,
  };
  const undefinedList = Object.values(globals).filter((item) => !item).length;
  useEffect(() => {
    if (undefinedList !== 0) {
      dispatch(setMenuBar({ menuBar: { value: 4, label: "پیش فرض ها" } }));
    }
  }, [CurrencyId, CashierId, PlaceId, YearId, LanguageId]);

  return (
    <div
      className={`absolute inset-0 p-4 bg-white dark:bg-gray-gray12 dark:text-gray-gray05  ${
        menuBar.value > 0 ? "opacity-100 z-10 " : "opacity-0 -z-10"
      }`}
    >
      <span>
        <CustomButton
          className="flex items-center px-2 py-1 h-fit"
          type="text"
          onClick={removeMenuSide}
        >
          <div className={`${lang !== "fa" ? "rotate-180" : ""}`}>
            <MenuArrowBack config={{ width: 14, height: 9 }} />
          </div>
          <span className="flex items-center max-h-[22px] text-base dark:text-gray-gray05">
            {menuBar.label}
          </span>
        </CustomButton>
      </span>
      {menuBar.value > 0 && (
        <div className="hidden-show-scrollBar mt-2 h-[calc(100dvh-90px)]">
          {MenuComponent}
        </div>
      )}
    </div>
  );
};
