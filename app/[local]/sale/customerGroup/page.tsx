"use client";

import ViewList from "@components/templates/viewList";
import type {
  ICustomerGroup,
  IRequest,
} from "@services/sale/customerGroup/type";

export default function CustomerGroup() {
  // const settingItems = [
  //   {
  //     key: "0",
  //     icon: <SalesAssociateIcon config={{ width: 18, height: 18 }} />,
  //     label: t("title.salesPartner"),
  //   },
  //   {
  //     key: "1",
  //     icon: <CustomerCreditIcon />,
  //     label: t("title.customerCredit"),
  //   },
  //   {
  //     key: "2",
  //     icon: <GoodsGroupIcon />,
  //     label: t("title.goodsGroup"),
  //   },
  //   {
  //     key: "3",
  //     icon: <CustomerGoodsIcon />,
  //     label: t("title.goodsAllocation"),
  //   },
  //   {
  //     key: "4",
  //     icon: <CustomerTaxIcon />,
  //     label: t("title.tax"),
  //   },
  //   {
  //     key: "5",
  //     icon: <PriceListIcon />,
  //     label: t("title.priceList"),
  //   },
  //   {
  //     key: "6",
  //     icon: <SaleTeamIcon config={{ width: 18, height: 18 }} />,
  //     label: t("title.saleTeam"),
  //   },
  //   {
  //     key: "7",
  //     icon: <MarketingTeamIcon config={{ width: 18, height: 18 }} />,
  //     label: t("title.marketingTeam"),
  //   },
  //   {
  //     key: "8",
  //     icon: <CustomerCurrencyIcon config={{ width: 18, height: 18 }} />,
  //     label: t("sidebar.currency"),
  //   },
  //   {
  //     key: "9",
  //     icon: <PaymentMethodIcon config={{ width: 18, height: 18 }} />,
  //     label: t("sidebar.paymentMethod"),
  //   },
  // ];

  // const renderSettingAction = (item: ICustomerGroup) => {
  //   const settingMenuItems: ItemType[] = settingItems.map((menuItem) => ({
  //     key: menuItem.key,
  //     label: (
  //       <span
  //         className="flex items-center gap-3 text-sm"
  //         onClick={() => {
  //           setId(item.CustomerGroupId);
  //           setDynamicAction({ icon: menuItem.icon, label: menuItem.label });
  //           setIsDynamicModalOpen(true);
  //         }}
  //       >
  //         {menuItem.icon}
  //         {menuItem.label}
  //       </span>
  //     ),
  //   }));
  //   return (
  //     <CustomTooltip title={t("general.setting")}>
  //       <CustomDropdownButton placement="bottom" items={settingMenuItems}>
  //         <div className="cursor-pointer">
  //           <Settings />
  //         </div>
  //       </CustomDropdownButton>
  //     </CustomTooltip>
  //   );
  // };

  // const CustomerGroupConfig: INestedListConfig = {
  //   pageIcon: "CustomerGroupIcon",
  //   getUrl: "api/sale/select/customerGroup",
  //   createUrl: "api/sale/insert/customerGroup",
  //   updateUrl: "api/sale/update/customerGroup",
  //   deleteUrl: "api/sale/delete/customerGroup",
  //   repoViewId: 1018,
  //   uniqueKey: "CustomerGroupId",
  //   descriptionKey: "CustomerGroupDesc",
  //   nestedKey: "SubUnits",
  //   fatherKey: "FatherId",
  //   levelKey: null,
  //   tooltips: null,
  //   formConfig: [
  //     {
  //       caption: t("general.customerGroupName"),
  //       name: "CustomerGroupDesc",
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
    <ViewList<ICustomerGroup, IRequest>
      caption="title.customerGroup"
      url="api/sale/select/customerGroup"
      isNested
      rowFieldKey="CustomerGroupId"
    />
  );
}
