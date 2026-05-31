"use client";
import {
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import { TreeProps } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomDropdownButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import {
  AddChild,
  DownChevron,
  Settings,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useDarkMode } from '@hooks/custom/useDarkMode';
import { useGetData } from '@services/base';
import { type IBaseDto } from '@services/base/type';
import {
  findItemInNestedData,
  getColoredIcon,
} from '@utils/core';

import { useNestedListLogic } from './hooks/useNestedListLogic';
import NestedListModals from './nestedListModals';
import NestedListTree from './nestedListTree';
import { TreeTitle } from './treeTitle';
import type { IProps } from './types';
import {
  getAllKeys,
  handleFilterTreeData,
} from './utils';

export default function NestedList<T extends IBaseDto, K>({
  config,
  addChildCondition,
  customAction,
  withoutActivation,
  conditionalActivation = () => true,
  titleKey,
}: IProps<T>) {
  const t = useTranslations();
  const pathname = usePathname();

  const { match, initPage, activePage } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const initPage = state.withPersist.init;
    const activePage = state.withPersist.pages?.find((page) => page.isActive);
    return { match, initPage, activePage };
  }, shallowEqual);
  const { mode = "light" } = useDarkMode();

  const settingItems = activePage?.toolbarData?.GridMenu;

  const {
    getUrl,
    repoViewId,
    uniqueKey,
    displayKey,
    nestedKey,
    descriptionKey,
    fatherKey,
    levelKey,
    tooltips,
  } = config;

  const { data, isFetching, refetch, isLoading } = useGetData<T[], K>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
    },
  });

  const {
    selection,
    ui,
    modals,
    setSelection,
    setUi,
    setModals,
    setDynamicAction,
    actions,
    triggerIsLoading,
    attachmentDesc,
    setAttachmentDesc,
  } = useNestedListLogic(config, titleKey, data, refetch, match);

  const parts = pathname.split("/").filter(Boolean);
  const systemName = parts[1];
  const repoName = parts[2]?.replace(/List$/, "");
  const repoId = initPage?.RepoId;

  const switcherIcon = useCallback(
    (nodeProps) => (
      <>
        {nodeProps?.expanded ? (
          <span className={`custom-switcher-icon ${"rotate-180"} h-full `}>
            <DownChevron />
          </span>
        ) : (
          <span className="custom-switcher-icon">
            <DownChevron />
          </span>
        )}
      </>
    ),
    [],
  );

  const findCorrectTooltip = useCallback(
    (mode: "add" | "addChild", level?: number) => {
      if (!tooltips || !level)
        return mode === "add" ? t("general.add") : t("general.addChild");
      switch (mode) {
        case "add":
          if (level === 1) {
            return `${t("general.add")} ${tooltips.level1}`;
          } else if (level === 2) {
            return `${t("general.add")} ${tooltips.level2}`;
          } else return `${t("general.add")} ${tooltips.level3}`;
        case "addChild":
          if (level === 1) {
            return `${t("general.add")} ${tooltips.level2}`;
          } else if (level === 2) {
            return `${t("general.add")} ${tooltips.level3}`;
          } else return t("general.addChild");

        default:
          return null;
      }
    },
    [tooltips],
  );

  const renderAddChildAction = useCallback(
    (item: T) => {
      const condition = addChildCondition ? addChildCondition(item) : true;
      if (!condition) return null;
      return (
        <CustomTooltip title={findCorrectTooltip("addChild", item[levelKey])}>
          <CustomButton
            type="link"
            icon={
              <AddChild
                config={
                  !match ? { width: 20, height: 18 } : { width: 16, height: 16 }
                }
              />
            }
            onClick={(e) => {
              e.stopPropagation();
              actions.handleAddAction(
                item[config.uniqueKey],
                item[config.fatherKey],
                "addChild",
              );
            }}
            style={{ padding: 0 }}
          />
        </CustomTooltip>
      );
    },
    [addChildCondition, findCorrectTooltip, levelKey, actions.handleAddAction],
  );

  const renderCustomAction = useCallback((item: T) => {
    const condition = addChildCondition ? addChildCondition(item) : true;
    if (!condition) return null;
    const settingMenuItems: ItemType[] =
      settingItems?.length > 0
        ? settingItems?.map((menuItem) => ({
            key: menuItem.key,
            label: (
              <span
                className="flex items-center gap-3 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection((prev) => ({ ...prev, id: item[uniqueKey] }));
                  actions.handleAction(menuItem);
                }}
              >
                {typeof menuItem.Icon === "string" && (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        getColoredIcon(menuItem.Icon, mode),
                      ),
                    }}
                  />
                )}
                {/* {menuItem.MenuDesc.split(" - ")[1]} */}
                {menuItem.MenuDesc}
              </span>
            ),
          }))
        : null;
    return (
      <>
        <CustomTooltip title={t("general.setting")}>
          <CustomDropdownButton placement="bottom" items={settingMenuItems}>
            <div className="cursor-pointer">
              <Settings
                config={
                  !match
                    ? {
                        width: 20,
                        height: 20,
                      }
                    : {
                        width: 18,
                        height: 18,
                      }
                }
              />
            </div>
          </CustomDropdownButton>
        </CustomTooltip>
      </>
    );
  }, []);

  const transformDataToTree = (data: T[]) => {
    return data?.map((item) => {
      return {
        key: item[uniqueKey],
        name: `${item[displayKey] || item[uniqueKey]} - ${item[descriptionKey]}`,
        title: (
          <TreeTitle
            item={item}
            selectedId={selection.selectedId}
            config={config}
            systemName={systemName}
            repoName={repoName}
            renderAddChildAction={renderAddChildAction}
            renderCustomAction={renderCustomAction}
            handlers={{
              findTooltip: findCorrectTooltip,
              onAdd: () =>
                actions.handleAddAction(
                  item[uniqueKey],
                  item[fatherKey],
                  "addSide",
                ),
              onEdit: () => actions.handleEditAction(item),
              onDelete: () => actions.handleDeleteAction(item[uniqueKey]),
              onUpload: () =>
                setModals((prev) => ({ ...prev, attachment: true })),
            }}
            customAction={customAction}
            setStates={{ setSelection, setUi, setModals, setDynamicAction }}
            conditionalActivation={conditionalActivation}
            withoutActivation={withoutActivation}
          />
        ),
        children:
          item[nestedKey] && item[nestedKey].length > 0
            ? transformDataToTree(item[nestedKey])
            : undefined,
      };
    });
  };
  const transformedTreeData = useMemo(
    () => transformDataToTree(data?.Data ?? []),
    [data?.Data, selection.selectedId, mode],
  );

  const filteredTreeData = handleFilterTreeData(
    transformedTreeData,
    ui.searchTerm,
  );

  useEffect(() => {
    if (!ui.searchTerm) return;
    const keysToExpand = getAllKeys(filteredTreeData);
    setUi((prev) => {
      if (
        prev.expandedKeys.length === keysToExpand.length &&
        prev.expandedKeys.every((key, index) => key === keysToExpand[index])
      ) {
        return prev;
      }
      return {
        ...prev,
        expandedKeys: keysToExpand,
      };
    });
  }, [ui.searchTerm, filteredTreeData]);

  const expandAll = () => {
    const keysToExpand = getAllKeys(filteredTreeData);
    setUi((prev) => ({
      ...prev,
      expandedKeys: keysToExpand,
    }));
  };
  const collapseAll = () => {
    setUi((prev) => ({
      ...prev,
      expandedKeys: [],
    }));
  };
  const onExpand = (keys: number[]) => {
    setUi((prev) => ({
      ...prev,
      expandedKeys: keys,
    }));
  };
  const handleSelect = (selectedKeys: number[]) => {
    if (selectedKeys.length > 0) {
      const newId = selectedKeys[0];
      const isAlreadySelected = selection.selectedId === newId;

      setSelection((prev) => ({
        ...prev,
        selectedId: isAlreadySelected ? null : newId,
        id: isAlreadySelected ? null : newId,
      }));
    } else {
      // اگر سلکشن برداشته شد
      setSelection((prev) => ({
        ...prev,
        selectedId: null,
        id: null,
      }));
    }
  };

  const onDrop: TreeProps["onDrop"] = async (info) => {
    const dragKey = info.dragNode.key as number | string;
    const dropKey = info.node.key;

    const newFatherId = dropKey
      ? findItemInNestedData(data?.Data, uniqueKey as keyof T, dropKey)?.[
          fatherKey
        ]
      : null;

    await actions.handleDropAction(dragKey, newFatherId);
    setUi((prev) => ({ ...prev, draggedKey: null }));
  };

  const handleWhiteSpaceDrop = async () => {
    if (ui.draggedKey) {
      await actions.handleDropAction(ui.draggedKey, null);
      setUi((prev) => ({ ...prev, draggedKey: null }));
    }
  };

  return (
    <>
      <NestedListTree
        match={match}
        collapseAll={collapseAll}
        expandAll={expandAll}
        refetch={refetch}
        handleAddFirstItem={() =>
          actions.handleAddAction(null, null, "firstItem")
        }
        handleWhiteSpaceDrop={handleWhiteSpaceDrop}
        states={{ ui, selection }}
        setStates={{ setUi }}
        isFetching={isFetching}
        filteredTreeData={filteredTreeData}
        onDrop={onDrop}
        handleAddAction={() => actions.handleAddAction(null, null, "firstItem")}
        handleSelect={handleSelect}
        onExpand={onExpand}
        switcherIcon={switcherIcon}
      />
      <NestedListModals
        states={{ modals }}
        match={match}
        data={{
          id: selection.id,
          fatherId: selection.fatherId,
          level: selection.level,
          title: selection.title,
          titleKey: titleKey,
          repoId: repoId,
        }}
        config={config}
        loading={{ isLoading, triggerIsLoading }}
        setStates={{ setModals, setSelection }}
        attachmentDesc={attachmentDesc}
        setAttachmentDesc={setAttachmentDesc}
        handlers={{ handleDeleteConfirm: actions.handleDeleteConfirm }}
        mode={mode}
      />
    </>
  );
}
