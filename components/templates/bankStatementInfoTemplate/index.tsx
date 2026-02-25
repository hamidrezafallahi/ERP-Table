"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";
import Title from "@components/atoms/Title";
import { useAppSelector } from "@redux/index";
import { addNewPage } from "@slice/pages";
import { PageTypeEnum } from "@type/enum";
import BankStatementInfoSidebar from "./sideBar";
import BankStatementInfoToolbar from "./toolbar";
import { useGetData } from "@services/base";
import BankStatementInfoContext from "./BankStatementInfoContext";

export default function BankStatementInfoTemplate() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const [accountId, setAccountId] = useState<number | null>(null);
  const { initPage } = useAppSelector((state) => {
    const initPage = state.withPersist.init;
    return { initPage };
  }, shallowEqual);

  const { activePage, fullScreen, minimizePanel, match } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find(
        (item) => item.isActive === true,
      ),

      fullScreen: state.withPersist.config.fullScreen,
      minimizePanel: state.withoutPersist.container.minimize,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

  const { pageId, RepoId, SystemId, url, pageState, originalPageState } =
    initPage;

  useEffect(() => {
    if (RepoId) {
      dispatch(
        addNewPage({
          pageId: pageId,
          caption: "title.transaction",
          icon: "BankStatementInfoIcon",
          pageState,
          originalPageState,
          type: PageTypeEnum.Custom,
          RepoId,
          SystemId,
          url,
        }),
      );
    }
  }, []);

  const { data, refetch, isLoading } = useGetData({
    url: "/api/trh/Select/BankStatementInfo",
    body: {
      BankAccountId: accountId,
    },
    skip: !accountId,
  });

  return (
    <div className="relative flex md:flex-row flex-col gap-4 h-[calc(100dvh-165px)] ">
      <Title caption={"title.transaction"} />
      <BankStatementInfoToolbar refetch={refetch} />
      <BankStatementInfoSidebar
        onSelectBankAccount={(id) => setAccountId(id)}
      />

      <div
        className={`hidden-show-scrollBar p-4 border-2 border-dashed rounded w-full h-full `}
      >
        {accountId ? (
          <div
            className={`${
              fullScreen
                ? "w-full"
                : !match
                  ? "w-full"
                  : `${
                      minimizePanel
                        ? "w-fit max-w-[calc(100dvw-300px)]"
                        : "w-fit max-w-[calc(100dvw-550px)]"
                    }`
            } ${
              !match ? "h-full" : "h-[calc(100dvh-425px)]"
            }   flex hidden-show-scrollBar transition-all duration-200 flex-col justify-between gap-2`}
          >
            <BankStatementInfoContext
              accountId={accountId}
              data={data?.Data}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center w-full h-full text-gray-400">
            {t("bankStatementInfo.bankStatementTxt")}{" "}
          </div>
        )}
      </div>
    </div>
  );
}
