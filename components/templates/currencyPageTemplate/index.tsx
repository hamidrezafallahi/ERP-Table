"use client";
import React, { useEffect } from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomDropdownButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  Dots,
  MenuArrowBack,
  Play,
  Undo,
} from '@components/atoms/iconComponents';
import Title from '@components/atoms/Title';
import CloseButton from '@components/molecules/closeButton';
import ExpandedButton from '@components/molecules/expandedButton';
import CurrencyTable
  from '@components/templates/currencyPageTemplate/currencyList';
import {
  useFormHandlers,
  useNavigatePage,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

export default function BaseCurrencyTemplate() {
  const t = useTranslations();
  const { initPage, match, lang, pages } = useAppSelector((state) => {
    const initPage = state.withPersist.init;
    const match = state.withPersist.config.initMatch;
    const lang = state.withPersist.config.lang;
    const pages = state.withPersist.pages;
    return { initPage, match, lang, pages };
  }, shallowEqual);

  const dispatch = useDispatch();

  const { RepoId } = useAppSelector((state) => {
    const RepoId = state.withPersist.init;

    return { RepoId };
  }, shallowEqual);

  const { navigateBack } = useNavigatePage();
  const { handleReset } = useFormHandlers({
    activePage: pages.find((item) => item.isActive),
    pages,
  });

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: `title.baseCurrency`,
        icon: "baseCurrencyIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
      })
    );
  }, [RepoId]);

  return (
    <div className="relative">
      {!match ? (
        <div className="relative flex items-center mb-4 border-b h-14">
          <div
            className={`${
              lang !== "fa" ? "rotate-180" : ""
            } cursor-pointer flex bg-white p-[6px] rounded gap-2`}
            onClick={navigateBack}
          >
            <MenuArrowBack config={{ width: 24, height: 24 }} />
            {t("title.baseCurrency")}
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
      )}

      <div
        className={`${
          match ? "px-4 py-3 h-full" : "p-2  h-[calc(100dvh-160px)]"
        } flex-1 border-dashed border-2  `}
      >
        <Title caption="title.selectBaseCurrency" />
        <h4 className="flex items-center gap-2 font-bold text-gray-gray135 text-sm">
          <Play />
          {t("general.listOfCurrencies")}
        </h4>
        <p className="mt-2 text-blue-blue5 text-sm">
          {t(
            "general.pleaseSelectTheCurrencyYouWantToUseAsThePrimaryCurrencyForYourAccount"
          )}
        </p>

        <CurrencyTable />
      </div>
    </div>
  );
}
