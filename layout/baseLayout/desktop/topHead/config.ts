// function flattenMenu(menuItems) {
//   const result = [];

import { SystemEnum } from '@type/enum';

//   function recursiveFlatten(items) {
//     for (const item of items) {
//       result.push(item);
//       if (item.SubMenus && item.SubMenus.length > 0) {
//         recursiveFlatten(item.SubMenus);
//       }
//     }
//   }

//   recursiveFlatten(menuItems);

//   return result;
// }

// const flatMenus = flattenMenu(data?.Data);
// const menuItems = flatMenus?.map((item) => ({
//   name: item.MenuDesc,
//   url: item.WebLink,
//   repoId: item.RepoId,
//   systemId: item.SystemId,
// }));

// console.log("menuItems", menuItems);

// function normalizeMenuStructure(menuItems) {
//   return menuItems.map((item) => ({
//     name: item.MenuDesc,
//     url: item.WebLink,
//     repoId: item.RepoId,
//     systemId: item.SystemId,
//     children:
//       item.SubMenus && item.SubMenus.length > 0
//         ? normalizeMenuStructure(item.SubMenus)
//         : [],
//   }));
// }

// const normalizedMenu = normalizeMenuStructure(data?.Data);
// console.log(normalizedMenu);

export const addButtonItems = [
  {
    name: "اطلاعات پایه",
    repoId: 0,
    children: [
      {
        name: "عمومی",
        repoId: 0,
        children: [
          {
            name: "اشخاص و شرکت ها",
            url: "com/person",
            repoId: 106045,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "سال مالی",
            url: "com/year",
            repoId: 106066,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "مرکز هزینه",
            url: "com/costCenter",
            repoId: 106015,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "ارز",
            url: "com/currency",
            repoId: 106016,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "حسابهای بانکی",
            url: "/com/bankAccount",
            repoId: 106067,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "پروژه",
            url: "com/project",
            repoId: 106051,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "بانک",
            url: "com/bank",
            repoId: 106004,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "نرخ ارز",
            url: "com/currencyRate",
            repoId: 106070,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "شرکت ها",
            url: "com/setting/places",
            repoId: 207003,
            systemId: SystemEnum.mng,
            children: [],
          },
        ],
      },
      {
        name: "کالا",
        repoId: 0,
        children: [
          {
            name: "گروه کالا",
            url: "com/goodsCategory",
            repoId: 106027,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "واحدهای اندازه‌گیری",
            url: "com/unitOfMeasurement",
            repoId: 106043,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "کالا",
            url: "com/good",
            repoId: 106023,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "مشخصات اضافی کالا",
            url: "com/goodProperties",
            repoId: 106030,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "ویژگی کالا",
            url: "com/goodVariant",
            repoId: 106062,
            systemId: SystemEnum.com,
            children: [],
          },
        ],
      },
    ],
  },
  {
    name: "حسابداری",
    repoId: 0,
    children: [
      {
        name: "اطلاعات پایه",
        repoId: 0,
        children: [
          {
            name: "حساب های تفصیلی",
            url: "acc/tafsili",
            repoId: 5003,
            systemId: SystemEnum.acc,
            children: [],
          },
          {
            name: "سرفصل حسابها",
            url: "acc/account",
            repoId: 5001,
            systemId: SystemEnum.acc,
            children: [],
          },
          {
            name: "گروه تفصیلی",
            url: "acc/tafsiliType",
            repoId: 5004,
            systemId: SystemEnum.acc,
            children: [],
          },
          {
            name: "تنظیمات حساب",
            url: "acc/accountSetting",
            repoId: 30010,
            systemId: SystemEnum.acc,
            children: [],
          },
          {
            name: "مالیات",
            url: "com/tax",
            repoId: 106059,
            systemId: SystemEnum.com,
            children: [],
          },
        ],
      },
      {
        name: "گزارشات",
        repoId: 5007,
        children: [
          {
            name: "مرور حساب ها",
            url: "acc/report/accounting",
            repoId: 5007,
            systemId: SystemEnum.acc,
            children: [],
          },
        ],
      },
      {
        name: "عملیات",
        repoId: 0,
        children: [
          {
            name: "سند حسابداری",
            url: "acc/voucher",
            repoId: 5010,
            systemId: SystemEnum.acc,
            children: [],
          },
        ],
      },
    ],
  },
  {
    name: "خزانه داری",
    repoId: 0,
    systemId: SystemEnum.trh,
    children: [
      {
        name: "صندوق",
        url: "trh/cash",
        repoId: 3001,
        systemId: SystemEnum.trh,
        children: [],
      },
      {
        name: "تنخواه",
        url: "trh/cashFund",
        repoId: 3009,
        systemId: SystemEnum.trh,
        children: [],
      },
      {
        name: "دسته چک",
        url: "trh/cheque",
        repoId: 30010,
        systemId: SystemEnum.trh,
        children: [],
      },
      {
        name: "دریافت و پرداخت",
        url: "trh/receiptAndPayment",
        repoId: 0,
        systemId: SystemEnum.trh,
        children: [],
      },
    ],
  },
  {
    name: "فروش",
    repoId: 0,
    systemId: SystemEnum.sale,
    children: [
      {
        name: "اطلاعات پایه",
        repoId: 0,
        children: [
          {
            name: "نوع فروش",
            url: "sale/saleType",
            repoId: 1006,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "عوامل کاهنده و افزاینده",
            url: "sale/increasingAndDecreasingFactors",
            repoId: 1009,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "روش تسویه",
            url: "sale/paymentMethod",
            repoId: 1007,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "مشتری",
            url: "sale/customer",
            repoId: 1012,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "همکار فروش",
            url: "sale/salesPartner",
            repoId: 1017,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "گروه مشتریان",
            url: "sale/customerGroup",
            repoId: 1018,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "تیم مارکتینگ",
            url: "sale/marketingTeam",
            repoId: 1019,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "تیم فروش",
            url: "sale/saleTeam",
            repoId: 1020,
            systemId: SystemEnum.sale,
            children: [],
          },
        ],
      },
      {
        name: "عملیات",
        repoId: 0,
        children: [
          {
            name: "لیست قیمت",
            url: "sale/price",
            repoId: 1011,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "فاکتور فروش ",
            url: "sale/checkoutInvoice",
            repoId: 204008,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "فاکتور فروش استاندارد",
            url: "sale/standardSalesInvoice",
            repoId: 1014,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "بازگشت فروش",
            url: "sale/returnSalesInvoice",
            repoId: 1015,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "تخفیفات",
            url: "sale/discount",
            repoId: 1046,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "قوانین قیمت گذاری",
            url: "sale/pricingCircular",
            repoId: 1062,
            systemId: SystemEnum.sale,
            children: [],
          },
          {
            name: "قوانین فروش",
            url: "sale/salesCircular",
            repoId: 1064,
            systemId: SystemEnum.sale,
            children: [],
          },
        ],
      },
    ],
  },
  {
    name: "مدیریت سیستم",
    repoId: 0,
    children: [
      {
        name: "کاربر",
        url: "auth/user",
        repoId: 204008,
        systemId: SystemEnum.inv,
        children: [],
      },
      {
        name: "نقش ها",
        url: "auth/role",
        repoId: 204005,
        systemId: SystemEnum.inv,
        children: [],
      },
      {
        name: "زبان",
        url: "mng/language",
        repoId: 207012,
        systemId: SystemEnum.inv,
        children: [],
      },
      {
        name: "گزارشات",
        url: "report/reportForm",
        repoId: 10001,
        systemId: SystemEnum.com,
        children: [],
      },
      {
        name: "لیست اکانت ها",
        url: "mng/accountList",
        baseRepoId: 207001,
        children: [],
      },
    ],
  },
  {
    name: "انبار",
    repoId: 0,
    systemId: SystemEnum.inv,
    children: [
      {
        name: "اطلاعات پایه",
        repoId: 0,
        systemId: SystemEnum.inv,
        children: [
          {
            name: "اسناد انبار",
            url: "inv/inventoryVoucherType",
            repoId: 106065,
            systemId: SystemEnum.com,
            children: [],
          },
          {
            name: "انبار",
            url: "inv/stock",
            repoId: 2001,
            systemId: SystemEnum.inv,
            children: [],
          },
        ],
      },
      {
        name: "صدور اسناد انبار",
        url: "inv/inventoryVoucher",
        repoId: 2002,
        systemId: SystemEnum.inv,
        children: [],
      },
    ],
  },
  {
    name: "منابع انسانی",
    repoId: 0,
    systemId: SystemEnum.hr,
    children: [
      {
        name: "پرسنل",
        url: "hr/staff",
        repoId: 9001,
        systemId: SystemEnum.hr,
        children: [],
      },
      {
        name: "چارت سازمانی",
        url: "hr/chart",
        repoId: 9002,
        systemId: SystemEnum.hr,
        children: [],
      },
      {
        name: "دوره آموزشی",
        url: "hr/trainingCourse",
        repoId: 9007,
        systemId: SystemEnum.hr,
        children: [],
      },
    ],
  },
];

export const flatItems = [
  {
    name: "اشخاص و شرکت ها",
    url: "com/person",
    repoId: 106045,
    systemId: SystemEnum.com,
  },
  {
    name: "سال مالی",
    url: "com/year",
    repoId: 106066,
    systemId: SystemEnum.com,
  },
  {
    name: "مرکز هزینه",
    url: "com/costCenter",
    repoId: 106015,
    systemId: SystemEnum.com,
  },
  {
    name: "ارز",
    url: "com/currency",
    repoId: 106016,
    systemId: SystemEnum.com,
  },
  {
    name: "حسابهای بانکی",
    url: "/com/bankAccount",
    repoId: 106067,
    systemId: SystemEnum.com,
  },
  {
    name: "پروژه",
    url: "com/project",
    repoId: 106051,
    systemId: SystemEnum.com,
  },
  {
    name: "بانک",
    url: "com/bank",
    repoId: 106004,
    systemId: SystemEnum.com,
  },
  {
    name: "نرخ ارز",
    url: "com/currencyRate",
    repoId: 106070,
    systemId: SystemEnum.com,
  },

  {
    name: "گروه کالا",
    url: "com/goodsCategory",
    repoId: 106027,
    systemId: SystemEnum.com,
  },
  {
    name: "واحدهای اندازه‌گیری",
    url: "com/unitOfMeasurement",
    repoId: 106043,
    systemId: SystemEnum.com,
  },
  {
    name: "کالا",
    url: "com/good",
    repoId: 106023,
    systemId: SystemEnum.com,
  },
  {
    name: "مشخصات اضافی کالا",
    url: "com/goodProperties",
    repoId: 106030,
    systemId: SystemEnum.com,
  },
  {
    name: "ویژگی کالا",
    url: "com/goodVariant",
    repoId: 106062,
    systemId: SystemEnum.com,
  },

  {
    name: "حساب های تفصیلی",
    url: "acc/tafsili",
    repoId: 5003,
    systemId: SystemEnum.acc,
  },
  {
    name: "سرفصل حسابها",
    url: "acc/account",
    repoId: 5001,
    systemId: SystemEnum.acc,
  },
  {
    name: "گروه تفصیلی",
    url: "acc/tafsiliType",
    repoId: 5004,
    systemId: SystemEnum.acc,
  },
  {
    name: "تنظیمات حساب",
    url: "acc/accountSetting",
    repoId: 30010,
    systemId: SystemEnum.acc,
  },
  {
    name: "مالیات",
    url: "com/tax",
    repoId: 106059,
    systemId: SystemEnum.com,
  },

  {
    name: "مرور حساب ها",
    url: "acc/report/accounting",
    repoId: 5007,
    systemId: SystemEnum.acc,
  },

  {
    name: "سند حسابداری",
    url: "acc/voucher",
    repoId: 5010,
    systemId: SystemEnum.acc,
  },

  {
    name: "صندوق",
    url: "trh/cash",
    repoId: 3001,
    systemId: SystemEnum.trh,
  },
  {
    name: "تنخواه",
    url: "trh/cashFund",
    repoId: 3009,
    systemId: SystemEnum.trh,
  },
  {
    name: "دسته چک",
    url: "trh/cheque",
    repoId: 30010,
    systemId: SystemEnum.trh,
  },
  {
    name: "دریافت و پرداخت",
    url: "trh/receiptAndPayment",
    repoId: 0,
    systemId: SystemEnum.trh,
  },

  {
    name: "نوع فروش",
    url: "sale/saleType",
    repoId: 1006,
    systemId: SystemEnum.sale,
  },
  {
    name: "عوامل کاهنده و افزاینده",
    url: "sale/increasingAndDecreasingFactors",
    repoId: 1009,
    systemId: SystemEnum.sale,
  },
  {
    name: "روش تسویه",
    url: "sale/paymentMethod",
    repoId: 1007,
    systemId: SystemEnum.sale,
  },
  {
    name: "مشتری",
    url: "sale/customer",
    repoId: 1012,
    systemId: SystemEnum.sale,
  },
  {
    name: "همکار فروش",
    url: "sale/salesPartner",
    repoId: 1017,
    systemId: SystemEnum.sale,
  },
  {
    name: "گروه مشتریان",
    url: "sale/customerGroup",
    repoId: 1018,
    systemId: SystemEnum.sale,
  },
  {
    name: "تیم مارکتینگ",
    url: "sale/marketingTeam",
    repoId: 1019,
    systemId: SystemEnum.sale,
  },
  {
    name: "تیم فروش",
    url: "sale/saleTeam",
    repoId: 1020,
    systemId: SystemEnum.sale,
  },

  {
    name: "لیست قیمت",
    url: "sale/price",
    repoId: 1011,
    systemId: SystemEnum.sale,
  },
  {
    name: "فاکتور فروش ",
    url: "sale/checkoutInvoice",
    repoId: 204008,
    systemId: SystemEnum.sale,
  },
  {
    name: "فاکتور فروش استاندارد",
    url: "sale/standardSalesInvoice",
    repoId: 1014,
    systemId: SystemEnum.sale,
  },
  {
    name: "بازگشت فروش",
    url: "sale/returnSalesInvoice",
    repoId: 1015,
    systemId: SystemEnum.sale,
  },
  {
    name: "تخفیفات",
    url: "sale/discount",
    repoId: 1046,
    systemId: SystemEnum.sale,
  },
  {
    name: "قوانین قیمت گذاری",
    url: "sale/pricingCircular",
    repoId: 1062,
    systemId: SystemEnum.sale,
  },
  {
    name: "قوانین فروش",
    url: "sale/salesCircular",
    repoId: 1064,
    systemId: SystemEnum.sale,
  },

  {
    name: "کاربر",
    url: "auth/user",
    repoId: 204008,
    systemId: SystemEnum.inv,
  },
  {
    name: "نقش ها",
    url: "auth/role",
    repoId: 204005,
    systemId: SystemEnum.inv,
  },
  {
    name: "زبان",
    url: "mng/language",
    repoId: 207012,
    systemId: SystemEnum.inv,
  },
  {
    name: "گزارشات",
    url: "report/reportForm",
    repoId: 10001,
    systemId: SystemEnum.report,
  },

  {
    name: "اسناد انبار",
    url: "inv/inventoryVoucherType",
    repoId: 106065,
    systemId: SystemEnum.com,
  },
  {
    name: "انبار",
    url: "inv/stock",
    repoId: 2001,
    systemId: SystemEnum.inv,
  },
  {
    name: "صدور اسناد انبار",
    url: "inv/inventoryVoucher",
    repoId: 2002,
    systemId: SystemEnum.inv,
  },

  {
    name: "پرسنل",
    url: "hr/staff",
    repoId: 9001,
    systemId: SystemEnum.hr,
  },
  {
    name: "چارت سازمانی",
    url: "hr/chart",
    repoId: 9002,
    systemId: SystemEnum.hr,
  },
  {
    name: "دوره آموزشی",
    url: "hr/trainingCourse",
    repoId: 9007,
    systemId: SystemEnum.hr,
  },
];
