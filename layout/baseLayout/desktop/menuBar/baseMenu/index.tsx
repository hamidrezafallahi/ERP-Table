import {
  FC,
  JSX,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Input,
  Menu,
  Skeleton,
} from 'antd';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { ListOrdered } from '@components/atoms/iconComponents';
import {
  useDarkMode,
  useInitializePage,
} from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
// import { useGetMenuQuery } from '@services/auth/base';
import type { IMenu } from '@services/auth/base/type';
import { useGetData } from '@services/base';
import { MenuTypeEnum } from '@services/base/type';
import type { IMenuItem } from '@type/elementType';
import { getColoredIcon } from '@utils/core';

import type {
  FilteredResult,
  IProps,
} from './type';

const BaseMenu: FC<IProps> = () => {
  const { mode = "light" } = useDarkMode();

  const initializePage = useInitializePage();

  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  const t = useTranslations();
  const [filteredMenuItems, setFilteredMenuItems] = useState<IMenuItem[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(null);

  const { data, isLoading } = useGetData({
    url: "/api/auth/menu",
    body: {
      MenuType: MenuTypeEnum.SidebarMenu,
    },
  });

  const generateMenuItems = (subMenus: IMenu[], level: number): IMenuItem[] => {
    const currentLevel = level;

    return subMenus.map((submenu) => {
      let itemClassName = "";
      if (level === 0) {
        itemClassName = `[&>div>span]:!text-gray-gray10 dark:[&>div>span]:!text-gray-gray4 !ps-0 xxl:text-sm `;
      }
      if (level === 1) {
        itemClassName = ` dark:[&>div>span]:!text-gray-gray4 [&>div>span]:!text-gray-gray9 [&>div>span]:hover:!text-gray-gray10  xxl:text-sm !ps-3 [&>span.ant-menu-item-icon]:!ps-4 [&>span]:!text-gray-gray8`;
      }
      if (level === 2) {
        itemClassName = `dark:[&>div>span]:!text-gray-gray4 [&>div>span]:!text-gray-gray8 [&>div>span]:hover:!text-gray-gray10 [&>span]:!text-gray-gray8 xxl:text-xs [&>span]:hover:!text-gray-gray8 [&>.ant-menu-item-icon]:!ps-0`;
      }
      if (level === 3) {
        itemClassName = `dark:[&>div>span]:!text-gray-gray4 [&>span]:!text-gray-gray7 !ps-0 `;
      }

      const icon = submenu.Icon ? (
        <span
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(getColoredIcon(submenu.Icon, mode)),
          }}
        />
      ) : undefined;

      return {
        key: submenu.MenuId.toString(),
        label: submenu.MenuDesc,
        onClick: () => {
          if (submenu.SubMenus.length === 0) {
            initializePage({ subMenu: submenu });
          }
        },
        icon: icon as JSX.Element | undefined,
        className: `*:!bg-transparent !pe-0 focus:!outline-gray-gray5 focus:!outline-2 ${itemClassName}`,
        children:
          submenu.SubMenus && submenu.SubMenus.length > 0
            ? generateMenuItems(submenu.SubMenus, currentLevel + 1)
            : null,
        tabIndex: 0,
      };
    });
  };

  const menuItems: IMenuItem[] = useMemo(() => {
    if (data && data.Data) {
      return generateMenuItems(data.Data as IMenu[], 0);
    } else {
      return [];
    }
  }, [data?.Data, mode]);
  const handleExpandMenuItem = (keys: string[]) => {
    setExpandedKeys(keys);
  };
  const handleFilterMenuItem = (
    items: IMenuItem[],
    query: string,
  ): FilteredResult => {
    const lowerQuery = query.toLowerCase();

    const filterRecursive = (nodes: IMenuItem[]): IMenuItem[] => {
      const result: IMenuItem[] = [];

      for (const node of nodes) {
        const nodeLabel =
          typeof node.label === "string"
            ? node.label
            : (node.label as any)?.props?.children?.toString() || "";

        const isMatch = nodeLabel.toLowerCase().includes(lowerQuery);

        const children = node.children ?? [];

        if (isMatch) {
          result.push({
            ...node,
            children: children.length > 0 ? children : undefined,
          });
        } else {
          const filteredChildren = filterRecursive(children);
          if (filteredChildren.length > 0) {
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

    const collectAllParentKeys = (nodes: IMenuItem[]): string[] => {
      const keys: string[] = [];
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          keys.push(String(node.key));
          keys.push(...collectAllParentKeys(node.children));
        }
      }
      return keys;
    };
    const defaultExpandedKeys = collectAllParentKeys(filteredItems);

    return {
      filteredItems,
      defaultExpandedKeys,
    };
  };

  useEffect(() => {
    if (menuItems) {
      setFilteredMenuItems(menuItems);
    }
  }, [menuItems]);
  const searchMenuRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        e.preventDefault();
        if (e.key === "f" && searchMenuRef.current) {
          searchMenuRef.current.focus();
        }
        if (e.key === "m" && menuRef.current) {
          menuRef.current.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {match && (
        <div
          id="menuBar"
          className="relative flex items-center gap-2 bg-main-white dark:bg-gray-gray13 p-2 font-bold text-md dark:text-white cursor-pointer"
        >
          <ListOrdered />

          {t("sidebar.menu")}
        </div>
      )}
      <div className="pb-1 w-full">
        <Input
          ref={searchMenuRef}
          className="bg-gray-gray3 dark:bg-gray-gray95 h-10 dark:text-white"
          placeholder={t("general.search")}
          variant="filled"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;

            if (!value) {
              setSearchTerm(null);
              setFilteredMenuItems(menuItems);
              setExpandedKeys([]);
            } else {
              const { filteredItems, defaultExpandedKeys } =
                handleFilterMenuItem(menuItems, value);

              setFilteredMenuItems(filteredItems);
              setSearchTerm(value);
              setExpandedKeys(defaultExpandedKeys);
            }
          }}
        />
      </div>

      <div
        className={`transition-opacity duration-500 opacity-100 overflow-y-auto hidden-show-scrollBar `}
      >
        {isLoading ? (
          <Skeleton active loading />
        ) : (
          <div>
            <Menu
              ref={menuRef}
              className="dark:bg-gray-gray13 !border-none w-full h-full dark:text-gray-gray2"
              mode="inline"
              items={filteredMenuItems}
              openKeys={expandedKeys}
              onOpenChange={handleExpandMenuItem}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default BaseMenu;
