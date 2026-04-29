import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
} from 'react';

import { Image } from 'antd';
import { SelectProps } from 'antd/lib';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  DiscountSignIcon,
  DollarSignIcon,
  MinusIcon,
  New,
  RedTrashBin,
  TaxIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { ITax } from '@services/com/tax/type';
import {
  IDiscount,
  IRequest,
} from '@services/sale/discount/type';
import { setPageData } from '@slice/pages';
import { IFactorItem } from '@slice/pages/factors/type';
import {
  formatCurrency,
  getCookie,
} from '@utils/core';

import DiscountItem from '../Additions/discountItem';
import TaxItem from '../Additions/taxItem';
import { IContent } from '../Additions/type';

interface IProps {
  product: IFactorItem;
  index: number;
  isEditable: (e: number) => void;
  editable: boolean;
  setModalContent: Dispatch<SetStateAction<any>>;
}

export default function OrderCard({ ...props }: IProps) {
  const { product, index, isEditable, editable, setModalContent } = props;
  const [additionalItems, { isLoading }] = useCUDDataMutation();
  const dispatch = useDispatch();
  const { activePageId, match } = useAppSelector((state) => {
    const activePageId = state.withPersist.pages.find(
      (item) => item.isActive
    )?.pageId;
    const match = state.withPersist.config.initMatch;
    return { activePageId, match };
  }, shallowEqual);

  const t = useTranslations();
  const { data: discountData } = useGetData<IDiscount[], IRequest>({
    url: "/api/sale/select/discount",
    body: {
      RepoViewId: 130059,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 300,
      },
    },
  });
  const { data: taxData } = useGetData<ITax[], IRequest>({
    url: "/api/com/select/tax",
    body: {
      RepoViewId: 30054,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 300,
      },
    },
  });
  const increment = (e) => {
    dispatch(setPageData({ name: "product", value: "Increment" }));

    e.preventDefault();
    e.stopPropagation();
  };
  const decrement = (e) => {
    if (product.GoodsCount > 0) {
      dispatch(setPageData({ name: "product", value: "Decrement" }));
    }
    e.preventDefault();
    e.stopPropagation();
  };
  const handleRemoveItem = (e) => {
    dispatch(setPageData({ name: "product", value: product }));

    e.preventDefault();
    e.stopPropagation();
  };
  const handleEditable = () => {
    if (editable) {
      isEditable(null);
    } else {
      isEditable(index);
    }
  };
  const getTransformOffset = (match, index) => {
    const temp = match ? 1 : 0;
    return index * 74 * temp;
  };

  const DiscountOptions: SelectProps["options"] = useMemo(() => {
    return discountData?.Data?.map((option) => ({
      label: option?.DiscountTitle,
      value: option?.DiscountId,
    }));
  }, [discountData]);
  const TaxOptions: SelectProps["options"] = useMemo(() => {
    return taxData?.Data?.map((option) => ({
      label: option?.TaxDesc,
      value: option?.TaxId,
    }));
  }, [taxData]);
  const detailDiscountModalContent: IContent = {
    icon: <DiscountSignIcon config={{ width: 18, height: 18 }} />,
    label: t("general.discount"),
    element: (
      <DiscountItem
        Options={DiscountOptions}
        // elements={product.discountItems}
        // onChange={(array) => {
        //   console.log(array);

        //   // dispatch(setElementsInFactor({ type: "taxItems", elements: array }));
        // }}
      />
    ),
    fieldKey: "taxItems",
  };
  const detailTaxModalContent: IContent = {
    icon: <TaxIcon />,
    label: t("general.tax"),
    element: (
      <TaxItem
        Options={TaxOptions}
        // elements={product.taxItems}
        // onChange={(array) => {
        //   console.log(array);

        //   // dispatch(setElementsInFactor({ type: "taxItems", elements: array }));
        // }}
      />
    ),
    fieldKey: "taxItems",
  };

  const handleDetailDiscountModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalContent(detailDiscountModalContent);
  };
  const handleDetailTaxModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalContent(detailTaxModalContent);
  };

  const getAdditionalsItem = async () => {
    const addition: any = await additionalItems({
      url: "api/sale/select/invoiceDetail/additionalItems",
      body: {
        GoodsId: product.GoodsId,
        Quantity1: product.GoodsCount,
        RepoViewId: 130007,
        RowNum: index + 1,
        Unit1Id: 1,
      },
    }).unwrap();

    if (addition?.Result == "Success") {
      console.log(
        addition.Data[0]?.FinalQuantity,
        addition.Data[0]?.DiscountItems,
        addition.Data[0]?.TaxItems
      );

      //  "Data": [
      //         {
      //             "FinalQuantity": 9.0,
      //             "TaxItems": [
      //                 {
      //                     "TaxId": 0,
      //                     "TaxDesc": "مالیات بر ارزش افزوده",
      //                     "TaxRate": 10.0
      //                 }
      //             ],
      //             "DiscountItems": [
      //                 {
      //                     "DiscountId": 3,
      //                     "DiscountType": true,
      //                     "DiscountTitle": "تخفیف پروموشن 5 درصدی لوازم رایانه ای",
      //                     "DiscountAmount": 5.0
      //                 }
      //             ]
      //         }
      //     ],
    }
  };
  useEffect(() => {
    getAdditionalsItem();
  }, [product?.GoodsCount]);

  return (
    <div
      className={` border  w-full rounded p-2 dark:bg-gray-gray95 bg-main-white 
        ${
          !match
            ? "h-[102px] z-10   border-gray-gray85 rounded-lg"
            : "h-[74px] absolute"
        } flex flex-col 
      ${editable && match && "!h-[145px] z-10 shadow-md"}
    

      `}
      style={{
        transform: `translateY(${getTransformOffset(match, index)}px)`,
      }}
      onClick={handleEditable}
    >
      <div className="flex justify-between items-center gap-5">
        <div className="flex justify-center h-full">
          <Image
            width={50}
            height={50}
            src={product.GoodsImage}
            alt={product.GoodsCategoryDesc}
          />
        </div>

        <div
          className={`flex ${
            !match && "hidden"
          } flex-col justify-start items-start gap-1 w-full h-full text-center`}
        >
          <div className="font-medium text-md">{product.GoodsCategoryDesc}</div>
          <div
            className={`text-gray-gray95 dark:text-white ${
              !match && "hidden"
            } text-xs`}
          >
            <span className="font-bold text-[26px] text-black-black7 dark:text-white">
              {product.GoodsCount}
            </span>
            {" / "} {product.unitDesc}
          </div>
        </div>
        <div className={` ${!match && "hidden"}`}>
          <div className="flex flex-nowrap items-center">
            <div
              className={` text-gray-gray10 dark:text-white flex gap-2 ${
                !match ? "text-base" : "text-2xl font-medium "
              } `}
            >
              {formatCurrency(product.GoodsPrice * product.GoodsCount)}
              <p
              // className={`${!match ? "text-3xs" : "hidden"}`}
              >
                ریال
              </p>
            </div>{" "}
          </div>
          <div className="flex items-center gap-1">
            <div className="font-normal text-2xs text-state-success1 dark:text-green-200">
              {t("general.discount")}
              {}
            </div>
            <div
              className={`font-medium text-state-success1 dark:text-green-200 ${
                !match ? "text-xs" : "text-lg"
              } `}
            >
              {formatCurrency(product.GoodsDiscount)}
            </div>{" "}
          </div>
        </div>

        <div className={`${!match ? "flex flex-col w-full" : "hidden"}`}>
          <div className="flex flex-col justify-start items-start gap-1 w-full h-full text-center">
            <div className="font-medium text-md">
              {product.GoodsCategoryDesc}
            </div>
            <div
              className={`text-gray-gray95 dark:text-white ${
                !match && "hidden"
              } text-xs`}
            >
              <span className="font-bold text-[26px] text-black-black7">
                {product.GoodsCount}
              </span>
              {" / "} {product.unitDesc}
            </div>
          </div>
          <div className={` ${!match && "flex w-full justify-between"}`}>
            <div className="flex items-center">
              <div
                className={` text-gray-gray10 dark:text-white ${
                  !match ? "text-base gap-1 flex" : "text-2xl font-medium"
                } `}
              >
                {formatCurrency(product.GoodsPrice)}{" "}
                <p className={`${!match ? "text-3xs" : "hidden"}`}>
                  {getCookie("CurrencyId").split("/")[1]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="font-normal text-2xs text-state-success1">
                {t("general.discount")}
              </div>
              <div
                className={`font-medium text-state-success1 ${
                  !match ? "text-xs" : "text-lg"
                } `}
              >
                {formatCurrency(product.GoodsDiscount)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`flex justify-between ${!editable && match && "hidden"}`}>
        <div
          className={`flex justify-between items-center ${
            !match ? "gap-2" : "gap-7"
          } w-fit`}
        >
          <CustomButton
            onClick={handleRemoveItem}
            type="text"
            className="p-0"
            disabled={isLoading}
          >
            <RedTrashBin
              config={{
                width: match ? 40 : 28,
                height: match ? 40 : 28,
              }}
            />
          </CustomButton>
          <CustomButton
            onClick={handleDetailDiscountModal}
            type="text"
            className="p-0"
            disabled={isLoading}
          >
            <DiscountSignIcon
              config={{
                width: match ? 40 : 28,
                height: match ? 40 : 28,
              }}
            />
          </CustomButton>
          <CustomButton
            onClick={handleDetailTaxModal}
            type="text"
            className="p-0"
          >
            <DollarSignIcon
              config={{
                width: match ? 40 : 28,
                height: match ? 40 : 28,
              }}
            />
          </CustomButton>
        </div>
        <div>
          <div
            className={`flex justify-between items-center ${
              !match ? "gap-2" : "gap-6"
            }`}
          >
            <CustomButton
              disabled={isLoading}
              className={`p-0 !border hover:!border-main-black ${
                !match
                  ? "w-7 h-7 bg-gray-100 !border-none"
                  : " w-[60px] h-[60px]"
              }`}
              onClick={increment}
            >
              {!match ? (
                <New
                  config={{
                    width: 20,
                    height: 20,
                    stroke: "#585858",
                    strokeWidth: 3,
                  }}
                />
              ) : (
                <New
                  config={{
                    width: 60,
                    height: 60,
                    stroke: "#585858",
                    strokeWidth: 3,
                  }}
                />
              )}
            </CustomButton>
            <div
              className={`flex justify-center items-center   ${
                !match
                  ? "text-base min-w-7 "
                  : "text-[26px] min-w-10 font-bold "
              } text-gray-gray10 dark:text-white`}
            >
              {product.GoodsCount}
            </div>
            <CustomButton
              className={`p-0  ${
                !match
                  ? "w-7 h-7 bg-gray-100 !border-none"
                  : " w-[58px] h-[58px] !border hover:!border-main-black"
              }`}
              onClick={decrement}
            >
              {product.GoodsCount == 1 ? (
                <>
                  {!match ? (
                    <MinusIcon
                      config={{
                        width: 20,
                        height: 20,
                        stroke: "#585858",
                        strokeWidth: 1.5,
                      }}
                    />
                  ) : (
                    <RedTrashBin config={{ width: 40, height: 40 }} />
                  )}
                </>
              ) : (
                <>
                  {!match ? (
                    <MinusIcon
                      config={{
                        width: 20,
                        height: 20,
                        stroke: "#585858",
                        strokeWidth: 1.5,
                      }}
                    />
                  ) : (
                    <MinusIcon
                      config={{
                        width: 50,
                        height: 50,
                        stroke: "#585858",
                      }}
                    />
                  )}
                </>
              )}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}
