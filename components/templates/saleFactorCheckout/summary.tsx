import { useState } from 'react';

import { Drawer } from 'antd';
import { DrawerProps } from 'antd/lib';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { MenuDrawerIcon } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useInitializePage } from '@hooks/custom/useInitializePage';
import { useCUDDataMutation } from '@services/base';
import { PageStateEnum } from '@slice/pages/enum';
import { SystemEnum } from '@type/enum';
import { formatCurrency } from '@utils/core';

export default function Summary() {
  const { activePageId, totalPrice, sum, tax, factor,match } = useAppSelector(
    (state) => {
      const activePageId = state.withPersist.pages?.find(
        (item) => item.isActive
      )?.pageId;
      const sum = 20//state.withPersist.pages.find(
      //   (item) => item.isActive
      // )?.pageData?.find(i=>i.name==="invoice")invoice?.factor?.sum;
      const tax = 12//state.withPersist.factors[activePageId]?.invoice?.factor?.tax;
      const totalPrice =40
       // state.withPersist.factors[activePageId]?.invoice?.factor?.totalPrice;
      const factor = {}//state.withPersist.factors[activePageId]?.invoice?.factor;
      const match = state.withPersist.config.initMatch;
      return { activePageId, totalPrice, sum, tax, factor ,match};
    },
    shallowEqual
  );

  const initializePage = useInitializePage();
  const [placement] = useState<DrawerProps["placement"]>("bottom");
  const [height, setHeight] = useState<number>(120); // Default height
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const [submitOrder] = useCUDDataMutation();
  const toggleHeight = () => {
    setIsExpanded((prev) => !prev);
    setHeight((prevHeight) => (prevHeight === 120 ? 235 : 120));
  };
  const t = useTranslations();

  const handleSubmitOrder = async () => {
    // const description = `${t(
    //   "checkoutFactor.in"
    // )}  ${new Date().toISOString()} ${t(
    //   "checkoutFactor.number"
    // )} ${factor.items.reduce((acc, Item) => acc + Item.GoodsCount, 0)}
    // ${t("checkoutFactor.product")}
    // ${t("checkoutFactor.with")}
    // ${t("checkoutFactor.totalPrice")}
    // {" "}:
    // ${factor.sum}`;
    // const myProducts = factor.items.map((item, index) => ({
    //   RowNum: Number(index + 1), //index
    //   GoodsId: item.GoodsId,
    //   Quantity1: item.GoodsCount, //تعداد
    //   Unit1Id: item.unitId,
    //   Fee: item.GoodsPrice, //قیمت یک دانه بدون تخفیف و مالیات
    //   DetailDesc: item.GoodsCategoryDesc, //
    // }));

    try {
      const response = await submitOrder({
        url: "/api/sale/insert/invoice",
        body: {
          VoucherDate: new Date().toISOString(),
          ReferDate: new Date().toISOString(),
          VoucherNumber: 1,
          ReferNumber: 1,
          CustomerId: 12,//factor.customer.CustomerId,
          VoucherStatId: 1,
          SaleTypeId: 1,
          VoucherDesc:2,// description,
          VoucherTypeId: 5006,
          Details:2,// myProducts,
        },
      }).unwrap();

      if (response?.Result == "Success") {
        initializePage({
          config: {
            RepoId: 1014,
            SystemId: SystemEnum.sale,
            originalPageState: PageStateEnum.Opened,
            // pageId: "784",
            pageState: PageStateEnum.Opened,
            selectedView: null,
            url: "sale/salesInvoiceList",
          },
        });
      }
    } catch (err) {
      null;
    }
  };

  const Tax = () => {
    if (!tax || isNaN(tax) || formatCurrency(tax) === "ناعدد") {
      return 0;
    }
    return formatCurrency(tax);
  };

  const Sum = () => {
    if (!sum || isNaN(sum) || formatCurrency(sum) === "ناعدد") {
      return 0;
    }
    return formatCurrency(sum);
  };

  const disable =true// totalPrice === 0 || !factor?.customer?.CustomerId;
  return (
    <div className="flex flex-col gap-2 px-2 w-full">
      {!match ? (
        <Drawer
          placement={placement}
          closable={false}
          open
          mask={false}
          height={height}
          zIndex={22}
        >
          <div className="relative flex flex-col justify-center gap-4 !h-full overflow-hidden">
            <div
              className="flex flex-col justify-start items-center gap-1 w-full h-full"
              onClick={toggleHeight}
            >
              <MenuDrawerIcon />
              <MenuDrawerIcon />
            </div>
            <div
              className={`top-6 w-full justify-between absolute flex flex-col gap-3  transition-all duration-200 ${
                !isExpanded && " opacity-0"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-bold text-gray-gray10 text-md">
                  {t("general.FactorAddition")}
                </p>
                <p className="font-bold text-gray-gray10 text-md">{Sum()}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-bold text-gray-gray10 text-md">
                  {t("general.discount")}
                </p>
                <p className="font-bold text-gray-gray10 text-md">260,000</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-bold text-gray-gray10 text-md">
                  {t("general.tax")}
                </p>
                <p className="font-bold text-gray-gray10 text-md">{Tax()}</p>
              </div>
            </div>
          </div>
          <CustomButton
            disabled={disable}
            type="text"
            className={` bg-main-black font-medium text-md text-main-white hover:bg-main-white hover:text-main-black h-11 absolute bottom-4 right-4 left-4 ${
              disable
                ? "!bg-gray-gray6 text-main-black hover:!text-gray-500"
                : ""
            }`}
            aria-label={t("general.customerOrder")}
            onClick={handleSubmitOrder}
          >
            {t("general.customerOrder")}{" "}
            {totalPrice > 0 && `(${formatCurrency(totalPrice)})`}{" "}
          </CustomButton>
        </Drawer>
      ) : (
        <>
          {/* {factor?.customer && ( */}
          {true && (
            <>
              <div className="flex justify-between pt-2 w-full">
                <div className="font-medium text-gray-gray10 text-lg">
                  {t("general.FactorAddition")}
                </div>
                <div className="font-medium text-gray-gray10 text-lg">
                  {Sum()}
                </div>
              </div>
              <div className="flex justify-between w-full">
                <div className="font-medium text-gray-gray10 text-lg">
                  {t("general.tax")}
                </div>
                <div className="font-medium text-gray-gray10 text-lg">
                  {Tax()}
                </div>
              </div>
            </>
          )}
          <CustomButton
            disabled={disable}
            type="text"
            className={`w-full bg-main-black font-medium text-md text-main-white hover:bg-main-white hover:text-main-black h-11 ${
              disable ? "!bg-gray-gray6 text-main-black" : ""
            }`}
            onClick={handleSubmitOrder}
          >
            {t("general.customerOrder")}{" "}
            {totalPrice > 0 && `(${formatCurrency(totalPrice)})`}{" "}
          </CustomButton>
        </>
      )}
    </div>
  );
}
