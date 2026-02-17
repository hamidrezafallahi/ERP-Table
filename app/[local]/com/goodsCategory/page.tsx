"use client";
import ViewList from "@components/templates/viewList";
import type {
  IProductCategory,
  IRequest,
} from "@services/com/productCategory/type";

export default function goodsCategory() {
  // const settingItems = [
  //   {
  //     key: "0",
  //     icon: <SalesAssociateIcon config={{ width: 18, height: 18 }} />,
  //     label: `${t("title.productCategory")} - ${t("title.salesPartner")}`,
  //   },

  //   {
  //     key: "6",
  //     icon: <SaleTeamIcon config={{ width: 18, height: 18 }} />,
  //     label: `${t("title.productCategory")} - ${t("title.saleTeam")}`,
  //   },
  //   {
  //     key: "7",
  //     icon: <MarketingTeamIcon config={{ width: 18, height: 18 }} />,
  //     label: `${t("title.productCategory")} - ${t("title.marketingTeam")}`,
  //   },
  //   {
  //     key: "1",
  //     icon: <TaxIcon config={{ width: 18, height: 18 }} />,
  //     label: `${t("title.productCategory")} - ${t("general.goodCategoryTax")}`,
  //   },
  // ];

  // const renderAction = (item: IProductCategory) => {
  //   const settingMenuItems: ItemType[] = settingItems.map((menuItem) => ({
  //     key: menuItem.key,
  //     label: (
  //       <span
  //         className="flex items-center gap-3 text-sm"
  //         onClick={() => {
  //           setId(item.GoodsCategoryId);
  //           setDynamicAction({ icon: menuItem.icon, label: menuItem.label });
  //           setIsDynamicModalOpen(true);
  //         }}
  //       >
  //         {menuItem.icon}
  //         {menuItem.label.split(" - ")[1]}
  //       </span>
  //     ),
  //   }));
  //   return (
  //     <>
  //       <CustomTooltip title={t("general.setting")}>
  //         <CustomDropdownButton placement="bottom" items={settingMenuItems}>
  //           <div className="cursor-pointer">
  //             <Settings />
  //           </div>
  //         </CustomDropdownButton>
  //       </CustomTooltip>
  //     </>
  //   );
  // };

  // const goodsCategoryConfig: INestedListConfig = {
  //   pageIcon: "ProductCategoryIcon",
  //   getUrl: "api/com/select/goodsCategory",
  //   createUrl: "api/com/insert/goodsCategory",
  //   updateUrl: "api/com/update/goodsCategory",
  //   deleteUrl: "api/com/delete/goodsCategory",
  //   repoViewId: null,
  //   uniqueKey: "GoodsCategoryId",
  //   descriptionKey: "GoodsCategoryDesc",
  //   nestedKey: "SubCategories",
  //   fatherKey: "FatherId",
  //   levelKey: null,
  //   tooltips: null,
  //   showUploadAction: true,
  //   formConfig: [
  //     {
  //       caption: t("general.title"),
  //       name: "GoodsCategoryDesc",
  //       type: "text",
  //       rules: [
  //         {
  //           required: true,
  //           message: t("general.enter-", {
  //             field: t("general.title"),
  //           }),
  //         },
  //       ],
  //       order: 1,
  //     },
  //   ],
  // };

  return (
    <ViewList<IProductCategory, IRequest>
      caption="title.goodsCategory"
      url="api/com/select/goodsCategory"
      isNested
      rowFieldKey="GoodsCategoryId"
    />
  );
}
