"use client";
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Collapse,
  Drawer,
  Pagination,
} from 'antd';
import moment from 'moment-jalaali';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  DownChevron,
  LeftChevron,
  MenuArrowBack,
  MinusIcon,
  PlusIcon,
  RightChevron,
} from '@components/atoms/iconComponents';
import Title from '@components/atoms/Title';
import { useNavigatePage } from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';
import {
  formatCurrency,
  toman,
} from '@utils/core';

import CurrencyInput from './currencyInput';
import Status from './status';
import type {
  IRequest,
  IWalletResponse,
} from './type';
import UserWalletToolbar from './userWalletToolbar';

const WalletCard: React.FC = () => {
  const [balance, setBalance] = useState(300_000_000);
  const [amount, setAmount] = useState(0);

  const [totalCount, setTotalCount] = useState(85);

  const [pageNumber, setPageNumber] = useState(1);
  const recordPerPage = 5;

  const t = useTranslations();
  const [submit] = useCUDDataMutation();

  const { initPage, match, userInfo, locale } = useAppSelector((state) => {
    const initPage = state.withPersist.init;
    const match = state.withPersist.config.initMatch;
    const userInfo = state.withPersist.config.userSession.UserInfo;
    const locale = state.withPersist.config.lang;

    return { initPage, match, locale, userInfo };
  }, shallowEqual);

  const { data } = useGetData<IWalletResponse[], IRequest>({
    url: "/api/mng/select/wallet",
    body: {
      RepoViewId: 207018,
      UserId: userInfo.UserId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordPerPage,
      },
    },
  });

  const handleChargeWallet = async () => {
    if (!amount) return;
    const res: any = await submit({
      url: "/api/mng/insert/wallet",
      body: { UserId: userInfo.UserId },
    });
    if (res?.Success) {
      setBalance((b) => b + amount);
      setAmount(0);
    } else {
      console.error("خطا در شارژ کیف پول", res?.Message);
    }
  };
  const dispatch = useDispatch();

  const { Panel } = Collapse;

  const presets = !match
    ? [100_000_000, 200_000_000]
    : [100_000_000, 200_000_000, 500_000_000];

  const handlePaginationChange = (page: number) => {
    setPageNumber(page);
  };

  const activePreset = useMemo(
    () => presets.find((p) => p === amount) ?? null,
    [amount]
  );

  const inc = () => setAmount((v) => Math.min(v + 10_000_000, 1_000_000_000));
  const dec = () => setAmount((v) => Math.max(v - 10_000_000, 0));

  const ALL_TXS: IWalletResponse[] = useMemo(() => {
    if (data?.Result === "Success") {
      return data.Data;
    }
    return [];
  }, [data]);

  useEffect(() => {
    if (data?.TotalCount !== undefined && data?.TotalCount !== null) {
      setTotalCount(data.TotalCount);
    }
    if (data?.TotalCount == 0) {
      setTotalCount(totalCount);
    }
  }, [data?.TotalCount]);

  const pagedTxs = useMemo(() => {
    const start = (pageNumber - 1) * recordPerPage;
    const end = start + recordPerPage;
    return ALL_TXS.slice(start, end);
  }, [ALL_TXS, pageNumber, recordPerPage]);

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: `title.walletRecharge`,
        icon: "",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
      })
    );
  }, [match]);

  const Toolbar = () => {
    const { lang } = useAppSelector((state) => {
      const lang = state.withPersist.config.lang;
      return { lang };
    }, shallowEqual);
    const { navigateBack } = useNavigatePage();
    const t = useTranslations();
    return (
      <div
        className={` ${"justify-between gap-2"} top-0 right-0 left-0 flex items-center  w-full z-10 border-b-gray-gray6 border-b sticky  bg-white  h-14`}
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
          <div>{t("title.wallet")}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Title caption="title.wallet" />

      <div className="relative">
        <UserWalletToolbar />
        {!match && <Toolbar />}
        <div className="p-3 border-2 border-dashed rounded-md w-full h-full overflow-hidden">
          <div
            className={`flex items-center bg-gray-gray3 mx-auto p-3 rounded-md w-fit dark:bg-[#414141] ${
              !match ? "w-full justify-between" : ""
            }`}
          >
            <div className="font-medium text-sm">{t("general.inventory")}</div>
            <div className="pr-16 pl-5 font-medium text-sm">
              {formatCurrency(balance)} {t("general.toman")}
            </div>
          </div>

          <div className="text-center">
            <div className="mx-auto pt-8 font-bold text-base">
              {t("general.walletRecharge")}
            </div>
            <div className="flex justify-between items-center sm:gap-3 mx-auto w-full max-w-sm">
              <div className="flex justify-center items-center border border-gray-gray7 rounded-md">
                <button onClick={inc}>
                  <PlusIcon
                    config={{ width: 59, height: 58, stroke: "#585858" }}
                  />
                </button>
              </div>
              <CurrencyInput value={amount} onChange={setAmount} />
              <div className="justify-center border border-gray-gray55 rounded-md">
                <button onClick={dec} className="flex items-center">
                  <MinusIcon
                    config={{ width: 59, height: 58, stroke: "#CECECE" }}
                  />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-6 mt-5">
              {presets.map((p) => (
                <CustomButton
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`${
                    activePreset === p
                      ? "bg-main-black text-main-white py-5 dark:bg-main-white dark:text-main-black "
                      : "py-5 border border-main-black"
                  }`}
                >
                  {formatCurrency(toman(p))} {t("general.toman")}
                </CustomButton>
              ))}
            </div>
            {match && (
              <div className="mt-6">
                <button
                  onClick={handleChargeWallet}
                  className="bg-main-black px-[124px] py-3 rounded-md text-main-white"
                >
                  {t("general.payment")}
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="pt-14 pb-4 font-bold text-gray-gray12 dark:text-white text-base text-center">
              {t("general.transactionRecords")}
            </div>

            {!match ? (
              <Collapse
                accordion
                className="border-none"
                expandIconPosition="end"
                expandIcon={({ isActive }) => (
                  <DownChevron
                    config={{ stroke: "#A9A9A9", width: 23, height: 23 }}
                    rotate={isActive ? 180 : 0}
                  />
                )}
              >
                {pagedTxs.map((tx, idx) => (
                  <Panel
                    key={tx.WalletId}
                    style={{
                      backgroundColor: "#FBFBFB",
                      border: "1px solid #ECECEC",
                      borderRadius: "4px",
                      marginBottom: "10px",
                    }}
                    className="dark:!bg-[#414141] dark:!border-none"
                    header={
                      <div className="flex justify-between items-center w-full text-gray-gray10 dark:!text-white">
                        <span className="font-medium text-sm">
                          {idx + 1 + (pageNumber - 1) * recordPerPage} {tx.Desc}
                        </span>
                        <span className="text-gray-700 text-xs">
                          {tx.Price}
                        </span>
                      </div>
                    }
                  >
                    <div className="flex flex-col gap-2 dark:!bg-[#414141] my-2 dark:my-0 dark:p-2">
                      <div className="flex flex-nowrap gap-2 mx-6 whitespace-nowrap">
                        <span className="text-gray-gray8 dark:text-white text-xs">
                          شماره پیگیری:
                        </span>
                        <span className="font-bold text-gray-gray10 dark:text-white text-xs">
                          {tx.PayCode || "—"}
                        </span>
                      </div>
                      <div className="flex flex-nowrap gap-2 mx-6 whitespace-nowrap">
                        <span className="text-gray-gray8 dark:text-white text-xs">
                          تاریخ:
                        </span>
                        <span className="font-bold text-gray-gray10 dark:text-white text-xs">
                          {tx.CreateDate &&
                            (locale === "fa"
                              ? moment(
                                  tx.CreateDate,
                                  "YYYY-MM-DDTHH:mm:ss"
                                ).format("jYYYY/jMM/jDD")
                              : moment(tx.CreateDate).format("YYYY/MM/DD"))}
                        </span>
                      </div>
                      <div className="flex flex-nowrap gap-2 mx-6 whitespace-nowrap">
                        <span className="text-gray-gray8 dark:text-white text-xs">
                          زمان:
                        </span>
                        <span className="font-bold text-gray-gray10 dark:text-white text-xs">
                          {tx.CreateDate &&
                            moment(tx.CreateDate, "YYYY-MM-DDTHH:mm:ss").format(
                              "HH:mm"
                            )}
                        </span>
                      </div>
                      <div className="flex flex-nowrap gap-2 mx-6 whitespace-nowrap">
                        <span className="text-gray-gray8 dark:text-white text-xs">
                          وضعیت:
                        </span>
                        <span className="font-bold text-xs">
                          <Status status={tx.Status} />
                        </span>
                      </div>
                    </div>
                  </Panel>
                ))}
              </Collapse>
            ) : (
              <div className="rounded-lg w-full overflow-y-auto">
                <table className="w-full text-sm text-right border-collapse rtl">
                  <thead className="top-0 sticky bg-main-white dark:bg-gray-gray9">
                    <tr className="border border-gray-gray3 dark:border-gray-gray85">
                      <th className="p-4 font-medium text-gray-gray54 dark:text-gray-gray1 text-xs text-center">
                        ردیف
                      </th>
                      <th className="p-4 font-medium text-gray-gray54 dark:text-gray-gray1 text-xs text-center">
                        شماره پیگیری
                      </th>
                      <th className="p-4 font-medium text-gray-gray54 dark:text-gray-gray1 text-xs text-center">
                        مبلغ
                      </th>
                      <th className="p-4 font-medium text-gray-gray54 dark:text-gray-gray1 text-xs text-center">
                        بابت
                      </th>
                      <th className="p-4 font-medium text-gray-gray54 dark:text-gray-gray1 text-xs text-center">
                        تاریخ
                      </th>
                      <th className="p-4 font-medium text-gray-gray54 dark:text-gray-gray1 text-xs text-center">
                        زمان
                      </th>
                      <th className="p-4 font-medium text-gray-gray54 dark:text-gray-gray1 text-xs text-center">
                        وضعیت
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedTxs.map((tx, idx) => (
                      <tr
                        key={tx.WalletId}
                        className={
                          idx % 2
                            ? "bg-white dark:bg-[#414141]"
                            : "bg-gray-gray4 dark:bg-[#262626]"
                        }
                      >
                        <td className="p-2 text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
                          {idx + 1 + (pageNumber - 1) * recordPerPage}
                        </td>
                        <td className="p-2 text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
                          {tx.PayCode || "—"}
                        </td>
                        <td className="p-2 text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
                          {formatCurrency(tx.Price)}
                        </td>
                        <td className="p-2 text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
                          {tx.Desc}
                        </td>
                        <td className="p-2 text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
                          {tx.CreateDate &&
                            (locale === "fa"
                              ? moment(
                                  tx.CreateDate,
                                  "YYYY-MM-DDTHH:mm:ss"
                                ).format("jYYYY/jMM/jDD")
                              : moment(tx.CreateDate).format("YYYY/MM/DD"))}
                        </td>
                        <td className="p-2 text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
                          {tx.CreateDate &&
                            moment(tx.CreateDate, "YYYY-MM-DDTHH:mm:ss").format(
                              "HH:mm"
                            )}
                        </td>
                        <td className="p-2 text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
                          <Status status={tx.Status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {totalCount > recordPerPage && (
            <div className="flex justify-end items-center gap-2 mt-4 text-xs">
              <span className="p-2 rounded">
                {totalCount.toLocaleString("fa-IR")}
              </span>
              <Pagination
                prevIcon={
                  <CustomButton className="m-0 p-0 rounded w-fit">
                    <RightChevron />
                  </CustomButton>
                }
                nextIcon={
                  <CustomButton className="m-0 p-0 w-fit">
                    <LeftChevron />
                  </CustomButton>
                }
                current={pageNumber}
                pageSize={recordPerPage}
                total={totalCount}
                showSizeChanger={false}
                onChange={handlePaginationChange}
                showTitle={false}
              />
            </div>
          )}
        </div>

        {!match && (
          <Drawer
            placement="bottom"
            closable={false}
            open
            mask={false}
            height={88}
            zIndex={22}
            className="!p-0"
          >
            <div className="flex flex-col justify-between h-full">
              <div className="px-4 pb-4">
                <CustomButton
                  onClick={handleChargeWallet}
                  className="bg-main-black w-full h-11 font-medium text-main-white text-base"
                >
                  {t("general.payment")}({formatCurrency(amount)})
                </CustomButton>
              </div>
            </div>
          </Drawer>
        )}
      </div>
    </>
  );
};

export default WalletCard;
