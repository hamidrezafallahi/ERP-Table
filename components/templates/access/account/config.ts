import { IDynamicModalConfig } from "@components/organisms/dynamicModal/type";

export const getDefaultDescriptionsConfig = (
  id: number
): IDynamicModalConfig => ({
  fieldKey: "accountId",
  staticKey: "accountId",
  createUrl: "/api/acc/insert/accountDescription",
  updateUrl: "",
  deleteUrl: "/api/acc/delete/accountDescription",
  confirmUrl: "",
  actions: [
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
  formConfig: {
    fields: [
      {
        name: "Desc",
        caption: "عنوان",
        type: "text",
        placeHolder: "عنوان را وارد کنید",
        order: 1,
        rules: [
          {
            required: true,
            message: "عنوان الزامی است",
          },
        ],
      },
    ],
  },
  listConfig: {
    repoViewId: 1,
    selectUrl: "/api/acc/select/accountDescription",
    body: {
      id: id,
    },
    column: [
      {
        fieldName: "Desc",
        fieldCaption: "شرح",
        fieldType: "string",
      },
    ],
    IsDefault: false,
    IsDisableAutoRefresh: false,
    IsDisableCommentCount: true,
    IsDisableSidebarStats: true,
    IsDisableCount: true,

  },
});
