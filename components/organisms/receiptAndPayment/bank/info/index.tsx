"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";
import Title from "@components/atoms/Title";
import { useAppSelector } from "@redux/index";
import { addNewPage } from "@slice/pages";
import { PageTypeEnum } from "@type/enum";
import { useGetData } from "@services/base";
import { GenericSidebar } from "@components/molecules/receiptAndPayment/sidebarInfo";
import DataGrid from "@components/molecules/dataGrid";
import { BankStatementRow } from "@components/molecules/receiptAndPayment/headerInfo/type";
import { HeaderInfo } from "@components/molecules/receiptAndPayment/headerInfo";

import { filterTypeDateEnum } from "@services/base/type";
import ListToolbar from "@components/organisms/listToolbar";
import { IRepoViewConfig } from "@services/generalType/type";
import { getColumnsList } from "./config";

export default function Info() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const [accountId, setAccountId] = useState<number | null>(null);
  const [fromValue, setFromValue] = useState<string>(null);
  const [toValue, setToValue] = useState<string>(null);
  const [tableData, setTableData] = useState<BankStatementRow[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const { fullScreen, minimizePanel, match, locale, initPage, lang, pages } =
    useAppSelector(
      (state) => ({
        activePage: state.withPersist.pages.find(
          (item) => item.isActive === true,
        ),
        pages: state.withPersist.pages,
        lang: state.withPersist.config.lang,
        initPage: state.withPersist.init,
        locale: state.withPersist.config.lang,
        fullScreen: state.withPersist.config.fullScreen,
        minimizePanel: state.withoutPersist.container.minimize,
        match: state.withPersist.config.initMatch,
      }),
      shallowEqual,
    );

  useEffect(() => {
    if (initPage.repoId) {
      dispatch(
        addNewPage({
          pageId: initPage.pageId,
          caption: "title.transaction",
          icon: "BankStatementInfoIcon",
          pageState: initPage.pageState,
          originalPageState: initPage.originalPageState,
          type: PageTypeEnum.Custom,
          RepoId: initPage.RepoId,
          SystemId: initPage.systemId,
          url: initPage.url,
        }),
      );
    }
  }, []);

  const dateFilter = {
    FilterInfo: [
      fromValue
        ? {
            ColName: "VoucherDate",
            FilterType: filterTypeDateEnum.GreaterThanOrEqual,
            Value: fromValue ?? null,
          }
        : {},
      toValue
        ? {
            ColName: "VoucherDate",
            FilterType: filterTypeDateEnum.LessThanOrEqual,
            Value: toValue ?? null,
          }
        : {},
    ],
  };

  const { data, refetch, isLoading } = useGetData<BankStatementRow[], null>({
    url: "/api/trh/Select/BankStatementInfo",
    body: {
      BankAccountId: accountId,
      Filters: dateFilter,
    },
    skip: !accountId || !isSearched,
  });

  const columnsList: IRepoViewConfig = getColumnsList(locale);

  const handleDateChange = async (from: string, to: string) => {
    //   if (!from || !to) return;
    // setFromValue(from);
    // setToValue(to);
    setIsSearched(true);
  };

  useEffect(() => {
    if (!accountId && !handleDateChange) return;
    setTableData(data?.Data ?? []);
  }, [data]);

  useEffect(() => {
    setIsSearched(false);
    // setFromValue(null);
    // setToValue(null);
    // setTableData([]);
  }, [accountId]);

  return (
    <div className="relative flex md:flex-row flex-col gap-4 h-[calc(100dvh-165px)]">
      <Title caption={"title.transaction"} />
      <div
        className={`-top-16 absolute flex gap-4 ${
          lang == "fa" ? "-left-3" : "-right-3"
        }`}
      >
        <ListToolbar
          gridData={data}
          addCaption={null}
          confirmUrl={null}
          deleteUrl={null}
          formUrl={null}
          toolbarData={[]}
          isSelectMode={false}
          renderCustomActions={null}
          repoId={initPage.repoId}
          rowFieldKey={"BankStatementId"}
          staticKey={"VoucherDate"}
          staticKeyII={"TafsiliDesc"}
          systemId={initPage.systemId}
          url={initPage.url}
          refetchGridData={refetch}
        />
      </div>
      <GenericSidebar
        fetchUrl="/api/trh/select/bankAccount4SelectOption"
        title={t("bankStatementInfo.accounts")}
        onSelect={(item) => setAccountId(item.id)}
      />

      <div
        className={` p-4 border-2 border-dashed rounded w-full h-[calc(100dvh-165px)] overflow-auto`}
      >
        {accountId ? (
          <>
            <HeaderInfo onChange={handleDateChange} isLoading={isLoading} />

            {isSearched ? (
              <div
                className={`${
                  fullScreen
                    ? "w-full"
                    : !match
                      ? "w-full"
                      : `${
                          minimizePanel
                            ? "w-full max-w-[calc(100dvw-300px)]"
                            : "w-full max-w-[calc(100dvw-620px)] h-[calc(100dvh-290px)] "
                        }`
                } hidden-show-scrollBar
             `}
              >
                <DataGrid<BankStatementRow>
                  data={tableData}
                  loading={isLoading}
                  totalIsLoading={false}
                  actions={null}
                  onActionClick={null}
                  recordPerPage={10}
                  columnsList={columnsList}
                  viewData={{
                    PagingInfo: {
                      PageNumber: 1,
                      PageRecordCount: tableData.length,
                    },
                  }}
                  totalCount={tableData.length}
                  rowFieldKey="BankStatementId"
                  conditionalActions={null}
                  renderSimple
                />
              </div>
            ) : (
              <div className="flex justify-center items-center w-full h-[calc(100dvh-290px)] text-gray-400">
                {t("bankStatementInfo.pickADateRangeAndHitSearch")}
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center w-full h-[calc(100dvh-290px)] text-gray-400">
            {t("bankStatementInfo.bankStatementTxt")}{" "}
          </div>
        )}
      </div>
    </div>
  );
}
