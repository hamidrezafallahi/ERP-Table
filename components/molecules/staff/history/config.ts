"use client";

import { useTranslations } from "next-intl";

export function useListConfig() {
  const t = useTranslations();
  return {

  listConfig: {
    column: [
    {
      fieldName: "Year",
      fieldCaption: t("general.year"),
      fieldType: "number",
    },
    {
      fieldName: "Date",
      fieldCaption: t("general.date"),
      fieldType: "date",
    },
    {
      fieldName: "Verson",
      fieldCaption: t("general.versionNumber"),
      fieldType: "number",
     }

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
      Icon: '<svg\r\n  width="18"\r\n  height="18"\r\n  viewBox="0 0 18 18"\r\n  fill="none"\r\n  xmlns="http://www.w3.org/2000/svg"\r\n>\r\n  <path d="M15.7483 9.37743C15.7483 9.37743 15.75 9.02532 15.75 8.6272C15.75 5.2674 15.75 3.58751 14.7066 2.54375C13.6631 1.5 11.9838 1.5 8.625 1.5C5.26624 1.5 3.58686 1.5 2.54343 2.54375C1.5 3.58751 1.5 5.2674 1.5 8.6272C1.5 11.987 1.5 13.6669 2.54343 14.7106C3.41839 15.5859 4.7405 15.7272 7.125 15.75"\r\n    stroke="#585858"\r\n    stroke-linecap="round"\r\n  />\r\n  <path d="M1.5 5.25L15.75 5.25"\r\n    stroke="#585858"\r\n    stroke-linejoin="round"\r\n  />\r\n  <path d="M4.5 12H5.25M7.5 9H11.25M4.5 9H5.25"\r\n    stroke="#585858"\r\n    stroke-linecap="round"\r\n    stroke-linejoin="round"\r\n  />\r\n  <path d="M12.75 13.875H12.7567"\r\n    stroke="#585858"\r\n    stroke-linecap="round"\r\n    stroke-linejoin="round"\r\n  />\r\n  <path d="M16.329 13.5169C16.443 13.6767 16.5 13.7567 16.5 13.875C16.5 13.9933 16.443 14.0733 16.329 14.2331C15.8167 14.9515 14.5085 16.5 12.75 16.5C10.9915 16.5 9.68329 14.9515 9.17102 14.2331C9.05701 14.0733 9 13.9933 9 13.875C9 13.7567 9.05701 13.6767 9.17102 13.5169C9.68329 12.7985 10.9915 11.25 12.75 11.25C14.5085 11.25 15.8167 12.7985 16.329 13.5169Z"\r\n    stroke="#585858"\r\n  />\r\n</svg>',      ActionId: null,
      MenuDesc: "مشاهده",
      key: "مشاهده",
      FatherId: null,
      MenuType: null,
      loggedInUserId: null,
      
      }
    ]
  };
}