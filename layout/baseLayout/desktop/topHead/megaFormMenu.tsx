import React, {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomDropdownButton } from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import { NewButton } from '@components/atoms/iconComponents';
import {
  useDarkMode,
  useInitializePage,
} from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
// import { useGetMenuQuery } from "@services/auth/base";
import { MenuTypeEnum } from '@services/base/type';
import type { IRequest } from '@services/mng/report/type';
import { getColoredIcon } from '@utils/core';

interface IMegaMenu {
  name: string;
  icon: string;
  url: string;
  repoId: number;
  systemId: number;
  children: IMegaMenu[];
}

const MegaMenu = () => {
  const { lang, role } = useAppSelector((state) => {
    const lang = state.withPersist.config.lang;
    const role = state.withPersist.config.userSession?.RoleDto?.find(
      (item) => item.isActiveRole
    );
    return { lang, role };
  }, shallowEqual);
  if (role == undefined || role.IsSupporter === true) {
    return null;
  } else {
    return (
      <CustomDropdownButton
        popupRender={() => <MegaMenuDropdown />}
        placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
        className="flex justify-center items-center bg-black-black9 hover:!bg-white !shadow-none p-[6px] border hover:border-black-black8 dark:border-none rounded w-[44px] h-[26px] text-white hover:text-black-black9 text-xs active:[bg-black-black-9]"
        items={null}
      >
        <span className="cursor-pointer">
          <NewButton
            inheritStyle
            config={{
              height: 28,
              width: 28,
            }}
          />
        </span>
      </CustomDropdownButton>
    );
  }
};

const MegaMenuDropdown = () => {
  const [currentAddItems, setCurrentAddItems] = useState([]);
  const [searchPhrase, setSearchPhrase] = useState("");
  const t = useTranslations();
  const { data, isLoading } = useGetData<any, IRequest>({
    url: "/api/auth/menu",
    body: {
      MenuType: MenuTypeEnum.SidebarMenu,
    },
  });

  function transformMenuData(inputData) {
    const menuArray = inputData.Data || inputData;

    return menuArray.map((menu) => {
      const transformedMenu = {
        name: menu.MenuDesc,
        icon: menu.Icon,
        repoId: menu.RepoId,
        systemId: menu.SystemId || null,
        children: [],
      };

      function processSubMenus(subMenus) {
        const result = [];

        for (const subMenu of subMenus) {
          if (subMenu.SubMenus && subMenu.SubMenus.length > 0) {
            result.push(...processSubMenus(subMenu.SubMenus));
          } else if (subMenu.ActionType === 1) {
            let url = subMenu.WebLink || subMenu.AppLink || "";

            if (subMenu.MenuDesc === "فاکتور فروش") {
              url = "sale/standardSalesInvoice";
            } else if (subMenu.MenuDesc === "بازگشت فروش") {
              url = "sale/returnSalesInvoice";
            } else if (subMenu.MenuDesc === "گزارشات") {
              url = "report/reportForm";
            } else {
              if (url.endsWith("List")) {
                url = url.substring(0, url.length - 4);
              }
            }

            result.push({
              name: subMenu.MenuDesc,
              icon: subMenu.Icon,
              url: url,
              repoId: subMenu.RepoId,
              systemId: subMenu.SystemId || null,
              children: [],
            });
          }
        }

        return result;
      }

      if (menu.SubMenus && menu.SubMenus.length > 0) {
        transformedMenu.children = processSubMenus(menu.SubMenus);
      }

      return transformedMenu;
    });
  }

  const handleFilterMenuItem = (items, query: string) => {
    const lowerQuery = query.toLowerCase();
    const expandedKeySet = new Set<string>();

    const filterRecursive = (nodes) => {
      const result = [];

      for (const node of nodes) {
        const nodeLabel =
          typeof node.name === "string"
            ? node.name
            : (node.name as any)?.props?.children?.toString() || "";

        const isMatch = nodeLabel.toLowerCase().includes(lowerQuery);

        const children = node.children ?? [];

        if (isMatch) {
          if (children.length > 0) {
            expandedKeySet.add(node.key);
          }
          result.push({
            ...node,
            children: children.length > 0 ? children : undefined,
          });
        } else {
          const filteredChildren = filterRecursive(children);
          if (filteredChildren.length > 0) {
            expandedKeySet.add(node.key);
            result.push({
              ...node,
              children: filteredChildren,
            });
          }
        }
      }

      return result;
    };

    const filteredItems = filterRecursive(items);

    return {
      filteredItems,
      defaultExpandedKeys: [...expandedKeySet],
    };
  };
  useEffect(() => {
    if (data?.Data?.length > 0) {
      const transformedMenu = transformMenuData(data?.Data);
      setCurrentAddItems(transformedMenu);
    }
  }, [data?.Data]);
  return (
    <div className="flex flex-col gap-1 bg-white dark:!bg-gray-gray85 shadow-xl px-2 py-4">
      <div className="pt-2">
        <InputText
          placeholder={t("general.search")}
          autoFocus
          value={searchPhrase}
          onChange={(e) => {
            const value = e.target.value;

            if (!value) {
              setSearchPhrase(null);
              if (data?.Data?.length > 0) {
                const transformedMenu = transformMenuData(data?.Data);
                setCurrentAddItems(transformedMenu);
              }
            } else {
              const { filteredItems } = handleFilterMenuItem(
                currentAddItems,
                value
              );

              setCurrentAddItems(filteredItems);
              setSearchPhrase(value);
            }
          }}
        />
      </div>
      {/* {menu} */}
      <MegaFormMenu data={currentAddItems} />
    </div>
  );
};

const MegaFormMenu = ({ data }: { data: IMegaMenu[] }) => {
  const initializePage = useInitializePage();
  const { mode = "light" } = useDarkMode();

  return (
    <div className="hidden-show-scrollBar flex flex-col flex-wrap gap-6 mx-2 h-[450px] overflow-auto">
      {data?.map((menu) => (
        <div key={menu.name} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 py-2 border-b-2">
            <span
              dangerouslySetInnerHTML={{
                __html: getColoredIcon(menu.icon, mode),
              }}
            />

            <span className="font-light text-[13px]">{menu.name}</span>
          </div>
          <div className="flex flex-col flex-wrap gap-2">
            {menu?.children?.map((subMenu) => (
              <div
                key={subMenu.name}
                onClick={() => {
                  initializePage({
                    config: {
                      url: subMenu.url,
                      RepoId: subMenu.repoId,
                      SystemId: subMenu.systemId,
                    },
                  });
                }}
                className="flex items-center gap-2 rounded cursor-pointer"
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: getColoredIcon(subMenu.icon, mode),
                  }}
                />

                <span className="text-[11px]">{subMenu.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MegaMenu;
