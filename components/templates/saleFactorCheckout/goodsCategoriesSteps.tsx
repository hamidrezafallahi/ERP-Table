import {
  useEffect,
  useRef,
} from 'react';

import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { LeftChevron } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setPageData } from '@slice/pages';
import { IGoodsCategory } from '@slice/pages/factors/type';

export default function GoodsCategoriesSteps({ ...props }) {
  const { setShowNoData } = props;
  const dispatch = useDispatch();
  const stepsContainer = useRef(null);
  const { goods, invoiceCategories } = useAppSelector((state) => {
    const goods = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((i) => i.name === "goods")?.value;
    const invoiceCategories = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((i) => i.name === "invoiceCategories")?.value;
    return { goods, invoiceCategories };
  }, shallowEqual);

  const invoiceCategoryHandler = (item: IGoodsCategory) => {
    setShowNoData(false);
    const newSelectedCategories = [];
    let parentId = item.FatherId;
    while (parentId) {
      const parentCategory = invoiceCategories.find(
        (cat) => cat.GoodsCategoryId === parentId
      );
      if (parentCategory) {
        newSelectedCategories.push(parentCategory);
        parentId = parentCategory.FatherId;
      } else {
        console.log(item);
      }
    }
    dispatch(setPageData({ name: "goodCategories", value: newSelectedCategories}));
    dispatch(setPageData({ name: "products", value:  []}));
  };

  const t = useTranslations();

  const levels = [
    t("general.ProductGroup"),
    t("general.SubLevel1"),
    t("general.SubLevel2"),
    t("general.SubLevel3"),
    t("general.SubLevel4"),
    t("general.SubLevel5"),
    t("general.SubLevel6"),
    t("general.SubLevel7"),
    t("general.SubLevel8"),
    t("general.SubLevel9"),
    t("general.SubLevel10"),
  ];

  const handleWheel = (event) => {
    if (stepsContainer.current) {
      event.preventDefault();
      stepsContainer.current.scrollLeft += event.deltaY * 2;
    }
  };
  const handleResetToCategories = () => {
    setShowNoData(false);
    dispatch(setPageData({ name: "product", value: [] }));
  };

  useEffect(() => {
    dispatch(setPageData({ name: "goodCategories", value: [] }));
  }, [goods]);

  return (
    <div
      className="hidden-show-scrollBar flex lg:flex-wrap items-center h-full overflow-x-auto"
      ref={stepsContainer}
      onWheel={handleWheel}
    >
      {invoiceCategories && invoiceCategories.length > 0 ? (
        <>
          {invoiceCategories?.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <LeftChevron />}
              <CustomButton
                onClick={() => invoiceCategoryHandler(item)}
                className="mx-2 px-5 py-6 border-gray-gray6 hover:!border-main-black rounded-lg text-gray-gray10 hover:!text-main-black dark:text-white text-xs"
              >
                {levels[index]} : {item.GoodsCategoryDesc}
              </CustomButton>
            </div>
          ))}
        </>
      ) : (
        <CustomButton
          onClick={handleResetToCategories}
          className={`px-5 py-6 border-gray-gray6 hover:!border-main-black rounded-lg text-gray-gray10 dark:text-white dark:hover:!text-white hover:!text-main-black text-xs lg:h-9  lg:min-w-[171px]`}
        >
          {levels[0]}
        </CustomButton>
      )}
    </div>
  );
}
