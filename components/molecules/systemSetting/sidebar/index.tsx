import { useState } from "react";

import { useTranslations } from "next-intl";

import InputText from "@components/atoms/defaultElements/inputText";
import {
  CloseCircle,
  DownChevron,
  Magnifier,
} from "@components/atoms/iconComponents";
import { SystemSettingEnum } from "@components/organisms/systemSetting/type";

import type { IProps } from "./type";

interface ITab {
  id: string;
  label: string;
  children?: ITab[];
}

export const SystemSettingSidebar = ({ activeItem, handleChange }: IProps) => {
  const t = useTranslations();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState<string>("");

  const settingItems: ITab[] = [
    {
      id: `${SystemSettingEnum.General}`,
      label: "عمومی",
      children: [
        {
          id: `${SystemSettingEnum.General}-1`,
          label: "ارز های منتخب",
        },
        {
          id: `${SystemSettingEnum.General}-2`,
          label: "ارز مبنا",
        },
        {
          id: `${SystemSettingEnum.General}-3`,
          label: "تعداد واحد اندازه گیری در اسناد",
        },
      ],
    },
    {
      id: `${SystemSettingEnum.Accounting}`,
      label: "حسابداری",
      children: [
        {
          id: `${SystemSettingEnum.Accounting}-1`,
          label: "عمومی",
        },
      ],
    },
    {
      id: `${SystemSettingEnum.ReceivablesAndPayment}`,
      label: "دریافت و پرداخت",
    },
    {
      id: `${SystemSettingEnum.Sales}`,
      label: "فروش",
      children: [
        {
          id: `${SystemSettingEnum.Sales}-1`,
          label: "تسویه فاکتور",
        },
        {
          id: `${SystemSettingEnum.Sales}-2`,
          label: "مورد 2",
        },
        {
          id: `${SystemSettingEnum.Sales}-3`,
          label: "مورد 3",
        },
      ],
    },
    { id: `${SystemSettingEnum.Inventory}`, label: "انبار" },
    { id: `${SystemSettingEnum.Purchasing}`, label: "خرید" },
    { id: `${SystemSettingEnum.Payroll}`, label: "حقوق و دستمزد" },
    { id: `${SystemSettingEnum.FixedAssets}`, label: "اموال و دارایی ثابت" },
  ];

  const toggleExpand = (id: string) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  const filterItems = (items: ITab[]): ITab[] => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    const walk = (list: ITab[]): ITab[] => {
      return list
        .map((it) => {
          if (!it) return undefined as any;
          const labelMatch =
            it.label.toLowerCase().includes(q) ||
            it.id.toLowerCase().includes(q);
          if (!it.children || it.children.length === 0) {
            return labelMatch ? it : undefined;
          }

          const filteredChildren = walk(it.children);

          if (labelMatch || filteredChildren.length > 0) {
            return { ...it, children: filteredChildren } as ITab;
          }

          return undefined;
        })
        .filter(Boolean) as ITab[];
    };

    return walk(items);
  };

  const renderItems = (items: ITab[]) => {
    return items.map((item) => {
      const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;
      const isExpanded = expanded[item.id];

      const hasActive = (node: ITab | undefined): boolean => {
        if (!node) return false;
        if (node.id === activeItem) return true;
        return (node.children ?? []).some((c) => hasActive(c));
      };

      const isActiveNode = hasActive(item);

      const showChildren = hasChildren && (isExpanded || Boolean(query.trim()));

      return (
        <div key={item.id}>
          <div
            className={` flex flex-col border-b py-2 border-gray-gray5 gap-2 cursor-pointer`}
            onClick={() => {
              if (hasChildren) {
                toggleExpand(item.id);
              } else {
                handleChange(item.id);
              }
            }}
          >
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(item.id);
                  }}
                  aria-label={isExpanded ? "collapse" : "expand"}
                  className="flex justify-center items-center w-5 h-5"
                  type="button"
                >
                  {isExpanded ? (
                    <span
                      className={`custom-switcher-icon ${"rotate-180"} h-full `}
                    >
                      <DownChevron />
                    </span>
                  ) : (
                    <span className="custom-switcher-icon">
                      <DownChevron />
                    </span>
                  )}
                </button>
              )}

              <span className={`${isActiveNode ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </div>

            <div className="flex flex-col gap-2 ms-4 ps-3 border-gray-gray5 border-r">
              {hasChildren &&
                showChildren &&
                (item.children ?? []).map((child) => {
                  const isActiveChild = activeItem === child.id;
                  return (
                    <div
                      key={child.id}
                      className={` relative flex items-center gap-2 p-2 rounded-lg cursor-pointer  ${
                        isActiveChild ? "font-semibold" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChange(child.id);
                      }}
                    >
                      <span
                        className={`absolute -start-3 top-1/2 -translate-y-1/2 w-3 h-px bg-gray-gray5`}
                        aria-hidden
                      />

                      <span>{child.label}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      );
    });
  };

  const itemsToRender = filterItems(settingItems);

  return (
    <div className="flex flex-col gap-2">
      <div className="">
        <InputText
          placeholder={t("general.search")}
          prefix={<Magnifier />}
          value={query}
          allowClear={{ clearIcon: <CloseCircle /> }}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-gray-gray3 px-4 py-2 rounded w-full text-sm"
        />
      </div>
      <div className="flex flex-col gap-2 px-1 h-[420px] overflow-y-auto">
        {renderItems(itemsToRender)}
      </div>
    </div>
  );
};
