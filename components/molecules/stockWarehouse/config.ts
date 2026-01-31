import type {
  IDynamicModalConfig,
} from '@components/organisms/dynamicModal/type';

export const config = {
  listConfig: {
    column: [
      {
        fieldName: "StockLocationDesc",
        fieldCaption: "عنوان",
        fieldType: "string",
      },
    ],
    IsDefault: true,
    IsDisableAutoRefresh: false,
    IsDisableCommentCount: false,
    IsDisableSidebarStats: false,
    IsDisableCount: false,
  },

  actions: [
    {
      MenuId: null,
      Icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.75 5.25V9M2.25 5.25C2.25 7.54839 2.25 12.5806 2.25 12.871C2.25 13.9078 3.70923 14.5243 6.6277 15.7571C7.80014 16.2524 8.38636 16.5 9 16.5L9 8.51613" stroke="#585858" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.25 14.25C11.25 14.25 11.9062 14.25 12.5625 15.75C12.5625 15.75 14.6471 12 16.5 11.25" stroke="#585858" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.24444 7.26854L4.05354 6.20838C2.85118 5.62658 2.25 5.33567 2.25 4.875C2.25 4.41433 2.85118 4.12342 4.05354 3.54162L6.24444 2.48146C7.59663 1.82715 8.27272 1.5 9 1.5C9.72728 1.5 10.4034 1.82715 11.7556 2.48146L13.9465 3.54161C15.1488 4.12342 15.75 4.41433 15.75 4.875C15.75 5.33567 15.1488 5.62658 13.9465 6.20838L11.7556 7.26854C10.4034 7.92285 9.72728 8.25 9 8.25C8.27272 8.25 7.59663 7.92285 6.24444 7.26854Z" stroke="#585858" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.5 9L6 9.75" stroke="#585858" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.75 3L5.25 6.75" stroke="#585858" strokeLinecap="round" strokeLinejoin="round"/></svg>',
      ActionId: null,
      MenuDesc: "کالاهای مجاز",
      key: "کالاهای مجاز",
      FatherId: null,
      MenuType: null,
      WebLink: "",
      loggedInUserId: null,
    },
    {
      MenuId: null,
      Icon: ' <svg\r\n      xmlns="http://www.w3.org/2000/svg"\r\n      width="18"\r\n      height="18"\r\n      viewBox="0 0 15 15"\r\n      fill="none"\r\n    >\r\n      <path\r\n        d="M5.50015 2H3.40015C2.56007 2 2.13972 2 1.81885 2.16349C1.5366 2.3073 1.3073 2.5366 1.16349 2.81885C1 3.13972 1 3.56007 1 4.40015V11.6001C1 12.4402 1 12.86 1.16349 13.1809C1.3073 13.4632 1.5366 13.6929 1.81885 13.8367C2.1394 14 2.55925 14 3.39768 14H10.6023C11.4408 14 11.86 14 12.1805 13.8367C12.4628 13.6929 12.6929 13.4629 12.8367 13.1807C13 12.8601 13 12.4408 13 11.6023V9.5M10 2.75L5.5 7.25V9.5H7.75L12.25 5M10 2.75L12.25 0.5L14.5 2.75L12.25 5M10 2.75L12.25 5"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n        strokeLinejoin="round"\r\n      />\r\n    </svg>',
      ActionId: null,
      MenuDesc: "ویرایش",
      key: "ویرایش",
      FatherId: null,
      MenuType: null,
      loggedInUserId: null,
    },
    {
      MenuId: null,
      Icon: '<svg\r\n      xmlns="http://www.w3.org/2000/svg"\r\n      width="18"\r\n      height="18"\r\n      viewBox="0 0 18 18"\r\n      fill="none"\r\n    >\r\n      <path\r\n        d="M15.3751 4.5H2.625"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n      />\r\n      <path\r\n        d="M14.125 6.375L13.78 11.5493C13.6473 13.5405 13.5809 14.5361 12.9322 15.1431C12.2834 15.75 11.2856 15.75 9.29001 15.75H8.70999C6.71439 15.75 5.71659 15.75 5.06783 15.1431C4.41907 14.5361 4.3527 13.5405 4.21996 11.5493L3.875 6.375"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n      />\r\n      <path\r\n        opacity="0.5"\r\n        d="M4.875 4.5C4.91691 4.5 4.93786 4.5 4.95686 4.49952C5.57444 4.48387 6.11927 4.09118 6.32941 3.51024C6.33588 3.49237 6.3425 3.47249 6.35576 3.43273L6.42857 3.21429C6.49073 3.02781 6.52181 2.93457 6.56304 2.8554C6.72751 2.53955 7.03181 2.32023 7.38346 2.26407C7.4716 2.25 7.56988 2.25 7.76645 2.25H10.2336C10.4301 2.25 10.5284 2.25 10.6165 2.26407C10.9682 2.32023 11.2725 2.53955 11.437 2.8554C11.4782 2.93457 11.5093 3.02781 11.5714 3.21429L11.6442 3.43273C11.6575 3.47244 11.6641 3.49238 11.6706 3.51024C11.8807 4.09118 12.4256 4.48387 13.0431 4.49952C13.0621 4.5 13.0831 4.5 13.125 4.5"\r\n        stroke="#585858"\r\n      />\r\n    </svg>',
      ActionId: null,
      MenuDesc: "حذف",
      key: "حذف",
      FatherId: null,
      MenuType: null,
      WebLink: "",
      loggedInUserId: null,
    },
  ],
};

export const PermittedGoodsConfig: IDynamicModalConfig = {
  fieldKey: "StockLocationGoodId",
  staticKey: "StockLocationGoodId",
  sourceFieldKey: "StockLocationId",
  deleteUrl: "/api/inv/delete/stockLocationGood",
  createUrl: "/api/inv/insert/stockLocationGood",
  updateUrl: "/api/inv/update/stockLocationGood",
  listConfig: {
    repoViewId: 70008,
    selectUrl: "/api/inv/select/stockLocationGood",
    column: [
      {
        fieldName: "Good.GoodsDesc",
        fieldCaption: "کالا",
        fieldType: "string",
      },
      {
        fieldName: "Capacity",
        fieldCaption: "ظرفیت",
        fieldType: "number",
      },
      {
        fieldName: "MeasureUnit.MeasureUnitDesc",
        fieldCaption: "واحد شمارش",
        fieldType: "string",
      },
    ],
    IsDefault: true,
    IsDisableAutoRefresh: false,
    IsDisableCommentCount: false,
    IsDisableSidebarStats: false,
    IsDisableCount: false,
  },
  formConfig: {
    fields: [
      {
        name: "GoodId",
        caption: "کالا",
        help: "این فیلد الزامی  می باشد",
        type: "selectOption",
        rules: [{ required: true, message: "این فیلد الزامی است" }],
        selectEndpoint: {
          endpoint: "api/sale/select/goods",
          repoViewId: 130063,
        },
        placeHolder: "",
        order: 1,
      },
      {
        name: "Capacity",
        caption: "ظرفیت",
        help: "این فیلد الزامی  می باشد",
        type: "number",
        rules: [{ required: false, message: "این فیلد الزامی است" }],

        placeHolder: "",
        order: 2,
      },
      {
        name: "MeasureUnitId",
        caption: "واحد شمارش",
        help: "این فیلد برای وارد کردن واحد فرعی می باشد",
        type: "treeOption",
        rules: [
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ],
        selectEndpoint: {
          endpoint: "api/com/select/measureUnit4SelectOption",
          repoViewId: null,
          addAppUrl: "string",
          addWebUrl: "string",
        },
        placeHolder: "",
        order: 3,
      },
    ],
  },
  actions: [
    {
      MenuId: null,
      Icon: ' <svg\r\n      xmlns="http://www.w3.org/2000/svg"\r\n      width="18"\r\n      height="18"\r\n      viewBox="0 0 15 15"\r\n      fill="none"\r\n    >\r\n      <path\r\n        d="M5.50015 2H3.40015C2.56007 2 2.13972 2 1.81885 2.16349C1.5366 2.3073 1.3073 2.5366 1.16349 2.81885C1 3.13972 1 3.56007 1 4.40015V11.6001C1 12.4402 1 12.86 1.16349 13.1809C1.3073 13.4632 1.5366 13.6929 1.81885 13.8367C2.1394 14 2.55925 14 3.39768 14H10.6023C11.4408 14 11.86 14 12.1805 13.8367C12.4628 13.6929 12.6929 13.4629 12.8367 13.1807C13 12.8601 13 12.4408 13 11.6023V9.5M10 2.75L5.5 7.25V9.5H7.75L12.25 5M10 2.75L12.25 0.5L14.5 2.75L12.25 5M10 2.75L12.25 5"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n        strokeLinejoin="round"\r\n      />\r\n    </svg>',
      ActionId: null,
      MenuDesc: "ویرایش",
      key: "ویرایش",
      FatherId: null,
      MenuType: null,
      loggedInUserId: null,
    },
    {
      MenuId: null,
      Icon: '<svg\r\n      xmlns="http://www.w3.org/2000/svg"\r\n      width="18"\r\n      height="18"\r\n      viewBox="0 0 18 18"\r\n      fill="none"\r\n    >\r\n      <path\r\n        d="M15.3751 4.5H2.625"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n      />\r\n      <path\r\n        d="M14.125 6.375L13.78 11.5493C13.6473 13.5405 13.5809 14.5361 12.9322 15.1431C12.2834 15.75 11.2856 15.75 9.29001 15.75H8.70999C6.71439 15.75 5.71659 15.75 5.06783 15.1431C4.41907 14.5361 4.3527 13.5405 4.21996 11.5493L3.875 6.375"\r\n        stroke="#585858"\r\n        strokeLinecap="round"\r\n      />\r\n      <path\r\n        opacity="0.5"\r\n        d="M4.875 4.5C4.91691 4.5 4.93786 4.5 4.95686 4.49952C5.57444 4.48387 6.11927 4.09118 6.32941 3.51024C6.33588 3.49237 6.3425 3.47249 6.35576 3.43273L6.42857 3.21429C6.49073 3.02781 6.52181 2.93457 6.56304 2.8554C6.72751 2.53955 7.03181 2.32023 7.38346 2.26407C7.4716 2.25 7.56988 2.25 7.76645 2.25H10.2336C10.4301 2.25 10.5284 2.25 10.6165 2.26407C10.9682 2.32023 11.2725 2.53955 11.437 2.8554C11.4782 2.93457 11.5093 3.02781 11.5714 3.21429L11.6442 3.43273C11.6575 3.47244 11.6641 3.49238 11.6706 3.51024C11.8807 4.09118 12.4256 4.48387 13.0431 4.49952C13.0621 4.5 13.0831 4.5 13.125 4.5"\r\n        stroke="#585858"\r\n      />\r\n    </svg>',
      ActionId: null,
      MenuDesc: "حذف",
      key: "حذف",
      FatherId: null,
      MenuType: null,
      WebLink: "",
      loggedInUserId: null,
    },
  ],
};
