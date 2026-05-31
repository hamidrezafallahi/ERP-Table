import {
  Image,
  message,
} from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { NoData } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetConditionallyMutation } from '@services/base';
import type { IBaseQueryResponse } from '@services/base/type';
import { IGood } from '@services/com/good/type';
import { setPageData } from '@slice/pages';
import {
  IFactorItem,
  IGoodsCategory,
} from '@slice/pages/factors/type';

export default function Categories({ ...props }) {
  const { setDisplayContext, closeModalHandler, showNoData, setShowNoData } =
    props;
  const { goods, invoiceCategories, goodCategories } = useAppSelector((state) => {
    const goodCategories = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((i) => i.name === "goodCategories")?.value;
    const goods = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((i) => i.name === "goods")?.value;
    const invoiceCategories = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((i) => i.name === "invoiceCategories")?.value;
    return { goods, invoiceCategories, goodCategories };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [getGoodList] = useGetConditionallyMutation();
  const t = useTranslations();
  const handleClick = async (good: IGoodsCategory) => {
    if (good.SubCategories.length > 0) {
      dispatch(setPageData({ name: "goodCategories", value: good }));
    } else {
      try {
        const response: IBaseQueryResponse<IGood[]> = await getGoodList({
          url: "/api/com/select/goods/byCategoryId",
          body: {
            CategoryId: good.GoodsCategoryId,
            RepoViewId: 30023,
          },
        }).unwrap();

        if (response?.Result === "Success") {
          const products: IFactorItem[] = response.Data.map((item) => ({
            type: "product",
            GoodsCategoryDesc: item.GoodsDesc,
            GoodsImage: "https://picsum.photos/200/300",
            GoodsPrice: item.Price,
            GoodsCount: 1,
            GoodsId: item.GoodsId,
            unitDesc: item.MeasureUnit.MeasureUnitDesc,
            unitId: item.MeasureUnit.MeasureUnitId,
          }));
          dispatch(setPageData({ name: "goodCategories", value: good }));
          dispatch(setPageData({ name: "products", value: products }));
        } else {
          setShowNoData(true);
          return message.error("Failed to fetch goodList.");
        }
      } catch (error) {
        message.error("An error occurred while fetching the good list.");
      }
      if (setDisplayContext) {
        setDisplayContext(false);
      }
    }
  };

  const handleAddProduct = (product: IFactorItem) => {
    const selectedProduct: IFactorItem = {
      type: "product",
      GoodsCategoryDesc: product.GoodsCategoryDesc,
      GoodsImage: "https://picsum.photos/200/300",
      GoodsPrice: product.GoodsPrice,
      GoodsCount: 1,
      GoodsId: product.GoodsId,
      unitDesc: product.unitDesc,
      unitId: product.unitId,
    };
    dispatch(setPageData({ item: selectedProduct, type: "Increment" }));

    if (closeModalHandler) {
      closeModalHandler();
    }
  };
  const temp =
    invoiceCategories && invoiceCategories.length > 0
      ? invoiceCategories[invoiceCategories?.length - 1]?.SubCategories
      : goods;

  return (
    <div
      className={`${
        !showNoData &&
        "lg:grid-cols-3 p-2 gap-2 grid grid-cols-1 sm:grid-cols-4 "
      } w-full `}
    >
      {showNoData ? (
        <div className="flex flex-col justify-center items-center gap-4 mt-16 !w-full">
          <NoData config={{ width: 134, height: 134 }} />
          <p className="text-gray-gray9 dark:text-white text-lg text-center">
            {" "}
            {t("general.noData")}
          </p>
        </div>
      ) : goodCategories?.length > 0 ? (
        <>
          {goodCategories?.map((item, index) => {
            return (
              <CustomButton
                onClick={() => {
                  handleAddProduct(item);
                }}
                type="text"
                className="flex-row-reverse lg:flex-col-reverse justify-evenly col-span-1 h-16 lg:h-40 text-wrap"
                key={index}
              >
                <div className="flex flex-col items-start lg:items-center w-full">
                  <div>{item.GoodsCategoryDesc}</div>
                  <div>{item.GoodsCategoryId}</div>
                </div>
                {/* {item.GoodsImage && ( */}
                {true && (
                  <Image
                    width={50}
                    height={50}
                    src="https://picsum.photos/200/300"
                    alt={item.GoodsImage}
                    preview={false}
                    onError={() => {
                      console.log("error");
                    }}
                  />
                )}
              </CustomButton>
            );
          })}
        </>
      ) : (
        <>
          {temp?.map((item, index) => (
            <CustomButton
              onClick={() => handleClick(item)}
              type="text"
              className="flex-row-reverse lg:flex-col-reverse justify-evenly col-span-1 h-16 lg:h-40 text-wrap"
              key={index}
            >
              <div className="flex flex-col items-start lg:items-center w-full">
                <div>{item.GoodsCategoryDesc}</div>
                <div>{item.GoodsCategoryId}</div>
              </div>
              {/* {item.GoodsImage && ( */}
              {true && (
                <Image
                  width={50}
                  height={50}
                  src="https://picsum.photos/200/300"
                  alt={item.GoodsImage}
                  preview={false}
                  onError={() => {
                    console.log("error");
                  }}
                />
              )}
            </CustomButton>
          ))}
        </>
      )}
    </div>
  );
}
