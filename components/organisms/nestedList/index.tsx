"use client";
import React, { useState } from "react";

import { Tree, TreeProps } from "antd";
import { ItemType } from "antd/es/menu/interface";
import DOMPurify from "dompurify";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { shallowEqual } from "react-redux";

import {
  CustomButton,
  CustomDropdownButton,
  CustomModal,
  CustomSpin,
  CustomSwitch,
  CustomTooltip,
} from "@components/atoms/defaultElements";
import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import InputText from "@components/atoms/defaultElements/inputText";
import {
  AddChild,
  AddCircle,
  CloseCircle,
  DownChevron,
  Edit,
  Link,
  Magnifier,
  NoData,
  Settings,
  TrashBin,
} from "@components/atoms/iconComponents";
import Confirmation from "@components/molecules/confirmation";
import {
  NestedListForm,
  NestedListToolbar,
} from "@components/molecules/nestedList";
import { PlaceDefinitionForm } from "@components/molecules/placeDefinitionForm";
import RenderStatus from "@components/molecules/renderStatus";
import { useDarkMode } from "@hooks/custom";
import Uploader from "@layout/baseLayout/desktop/actionBar/panelForm/uploader";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation, useGetData } from "@services/base";
import { type IBaseDto, PendingStatusEnum } from "@services/base/type";
import type { IToolbarMenu } from "@type/toolbar";
import {
  findItemInNestedData,
  findNestedLevel,
  getColoredIcon,
  showSuccessToast,
} from "@utils/core";

import DynamicModal from "../dynamicModal";
import type { IProps } from "./type";

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
    deleteUrl,
    repoViewId,
    uniqueKey,
    displayKey,
    nestedKey,
    descriptionKey,
    fatherKey,
    levelKey,
    tooltips,
    showUploadAction = false,
  } = config;

  const { data, isFetching, refetch } = useGetData<T[], K>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
    },
  });
  const [trigger, { isLoading: triggerIsLoading }] = useCUDDataMutation();
  const [title, setTitle] = useState<string | null>(null);
  const [isDeleteDrawerVisible, setIsDeleteDrawerVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [attachmentModalDesc, setAttachmentModalDesc] = useState(
    t("sidebar.drag"),
  );
  const [isDynamicModalOpen, setIsDynamicModalOpen] = useState(false);
  const [dynamicAction, setDynamicAction] = useState<{
    icon: string;
    label: string;
    actionConfig: IToolbarMenu;
  }>();
  const [id, setId] = useState<number>(null);
  const [fatherId, setFatherId] = useState<number>(null);
  const [level, setLevel] = useState<number>(null);
  const [draggedKey, setDraggedKey] = useState<number | string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);

  const repoId = initPage?.RepoId;
  const parts = pathname.split("/").filter(Boolean);
  const systemName = parts[1];
  const repoName = parts[2]?.replace(/List$/, "");

  const switcherIcon = (nodeProps) => (
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
  );

  const findCorrectTooltip = (mode: "add" | "addChild", level?: number) => {
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
  };

  const renderAddChildAction = (item: T) => {
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
          onClick={() => {
            handleAddAction(item[uniqueKey], item[fatherKey], "addChild");
          }}
          style={{ padding: 0 }}
        />
      </CustomTooltip>
    );
  };

  const getAllKeys = (data: T[]) => {
    const keys = [];
    const traverse = (nodes) => {
      nodes.forEach((node) => {
        keys.push(node.key);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(data);
    return keys;
  };

  const renderCustomAction = (item: T) => {
    const condition = addChildCondition ? addChildCondition(item) : true;
    if (!condition) return null;
    const settingMenuItems: ItemType[] =
      settingItems?.length > 0
        ? settingItems?.map((menuItem) => ({
            key: menuItem.key,
            label: (
              <span
                className="flex items-center gap-3 text-sm"
                onClick={() => {
                  setId(item[uniqueKey]);
                  setDynamicAction({
                    icon: menuItem.Icon,
                    label: menuItem.MenuDesc,
                    actionConfig: menuItem,
                  });
                  setIsDynamicModalOpen(true);
                }}
              >
                {/* {menuItem.Icon} */}
                <span
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      getColoredIcon(menuItem.Icon, mode),
                    ),
                  }}
                />
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
  };

  const transformDataToTree = (data: T[]) => {
    return data?.map((item) => {
      const displayDesc = item?.[displayKey]
        ? item?.[displayKey]
        : item[uniqueKey];
      const isPending =
        item?.PendingStatusId === PendingStatusEnum.Pending1 ||
        item?.PendingStatusId === PendingStatusEnum.Pending2 ||
        item?.PendingStatusId === PendingStatusEnum.Pending3;
      const isActive = withoutActivation ? true : item.Inactive ? false : true;
      return {
        key: item[uniqueKey],
        name: `${displayDesc} - ${item[descriptionKey]}`,
        title: (
          <div
            className={`${
              match
                ? "flex flex-wrap items-center gap-2 p-2"
                : "flex flex-col gap-2 p-2 w-full"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                onClick={() => handleDeselect()}
                className={`${
                  id === item[uniqueKey] && "inline-flex font-bold"
                } ${!isActive && "text-gray-gray7"}`}
              >
                {displayDesc} - {item[descriptionKey]}
              </span>
              {!!item?.PendingStatusId && (
                <RenderStatus
                  id={item[uniqueKey]}
                  pendingStatusId={item?.PendingStatusId}
                  pendingMessage={item?.PendingMessage}
                  isMobile={!match ? true : false}
                />
              )}
            </div>
            {id === item[uniqueKey] && !isPending && (
              <div className="flex items-center gap-3">
                {isActive && (
                  <CustomTooltip
                    title={findCorrectTooltip("add", item[levelKey])}
                  >
                    <CustomButton
                      type="link"
                      icon={
                        <AddCircle
                          config={
                            !match
                              ? {
                                  width: 20,
                                  height: 20,
                                }
                              : {
                                  width: 16,
                                  height: 16,
                                }
                          }
                        />
                      }
                      onClick={() => {
                        handleAddAction(
                          item[uniqueKey],
                          item[fatherKey],
                          "addSide",
                        );
                      }}
                      style={{ padding: 0 }}
                    />
                  </CustomTooltip>
                )}
                {isActive && renderAddChildAction(item)}

                {isActive &&
                  settingItems &&
                  settingItems?.length > 0 &&
                  renderCustomAction(item)}

                {isActive && customAction && customAction(item)}

                {isActive && (
                  <CustomTooltip title={t("general.update")}>
                    <CustomButton
                      type="link"
                      icon={
                        <Edit
                          config={
                            !match
                              ? {
                                  width: 18,
                                  height: 18,
                                }
                              : {
                                  width: 16,
                                  height: 16,
                                }
                          }
                        />
                      }
                      onClick={() => {
                        handleEditAction(item[uniqueKey]);
                      }}
                    />
                  </CustomTooltip>
                )}
                {isActive && showUploadAction && (
                  <CustomButton
                    type="text"
                    className="flex justify-between hover:!bg-transparent p-0 w-full"
                    onClick={() => setIsAttachmentModalOpen(true)}
                  >
                    <Link
                      config={
                        !match
                          ? {
                              width: 22,
                              height: 22,
                            }
                          : {
                              width: 20,
                              height: 20,
                            }
                      }
                    />
                  </CustomButton>
                )}
                {isActive && (
                  <CustomTooltip title={t("general.delete")}>
                    <CustomButton
                      type="link"
                      icon={
                        <TrashBin
                          config={
                            !match
                              ? {
                                  width: 18,
                                  height: 18,
                                }
                              : {
                                  width: 16,
                                  height: 16,
                                }
                          }
                        />
                      }
                      onClick={() => handleDeleteAction(item[uniqueKey])}
                    />
                  </CustomTooltip>
                )}

                {!withoutActivation && conditionalActivation(item) && (
                  <CustomTooltip
                    title={
                      item.Inactive
                        ? t("general.notActive")
                        : t("general.active")
                    }
                  >
                    <CustomSwitch
                      config={{
                        url: `/api/${systemName}/inActive/${repoName}`,
                        id: item[uniqueKey],
                      }}
                      defaultChecked={item.Inactive ? false : true}
                    />
                  </CustomTooltip>
                )}
              </div>
            )}
          </div>
        ),
        children:
          item[nestedKey] && item[nestedKey].length > 0
            ? transformDataToTree(item[nestedKey])
            : undefined,
      };
    });
  };
  const transformedTreeData = transformDataToTree(data?.Data || []);

  const handleFilterTreeData = (data, searchTerm) => {
    if (!searchTerm) return data;

    return data
      .map((item) => {
        const title = item.name?.toLowerCase() || "";
        const isMatch = title.includes(searchTerm.toLowerCase());

        const filteredChildren = handleFilterTreeData(
          item.children || [],
          searchTerm,
        );

        if (isMatch) {
          return {
            ...item,
            children: item.children?.length > 0 ? item.children : undefined,
          };
        }

        if (filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredTreeData = handleFilterTreeData(
    transformedTreeData,
    searchTerm,
  );
  const expandAll = () => {
    const keysToExpand = getAllKeys(filteredTreeData);
    setExpandedKeys(keysToExpand);
  };
  const collapseAll = () => {
    setExpandedKeys([]);
  };
  const onExpand = (keys: number[]) => {
    setExpandedKeys(keys);
  };
  const handleSelect = (selectedKeys: number[]) => {
    if (selectedKeys.length > 0) {
      const isSelected = selectedKeys[0] === id;
      setId(isSelected ? null : selectedKeys[0]);
    }
  };
  const handleDeselect = () => {
    setId(null);
    setFatherId(null);
    setLevel(null);
  };

  const handleAddAction = (
    id: number,
    fatherId: number,
    type: "addSide" | "addChild" | "firstItem",
  ) => {
    if (type === "firstItem") {
      setFatherId(null);
      setId(null);
      setLevel(1);
    } else if (type === "addChild") {
      const level = findNestedLevel(data?.Data, id, {
        idKey: uniqueKey,
        childrenKey: nestedKey,
      });
      setFatherId(id);
      setId(null);
      setLevel(level + 1);
    } else {
      const level = findNestedLevel(data?.Data, id, {
        idKey: uniqueKey,
        childrenKey: nestedKey,
      });
      setFatherId(fatherId);
      setId(null);
      setLevel(level);
    }
    setIsFormModalOpen(true);
  };
  const handleEditAction = (id: number) => {
    const level = findNestedLevel(data.Data, id, {
      idKey: uniqueKey,
      childrenKey: nestedKey,
    });
    setId(id);
    setLevel(level);
    setFatherId(null);
    setIsFormModalOpen(true);
  };
  const handleDeleteAction = (id: number) => {
    setId(id);
    if (match) {
      setIsDeleteModalVisible(true);
    } else {
      setIsDeleteDrawerVisible(true);
    }
  };
  const handleDeleteConfirm = async () => {
    try {
      const deleteResult = await trigger({
        url: deleteUrl,
        body: { Id: id },
      }).unwrap();

      if (deleteResult.DeleteResults[0].IsDelete === true) {
        showSuccessToast(t("toast.successTitle"));
        setId(null);
      }
      setIsDeleteModalVisible(false);
      setIsDeleteDrawerVisible(false);
    } catch (error) {
      null;
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

    await handleDropAction(dragKey, newFatherId);
    setDraggedKey(null);
  };

  const handleWhiteSpaceDrop = async () => {
    if (draggedKey) {
      await handleDropAction(draggedKey, null);
      setDraggedKey(null);
    }
  };

  const handleDropAction = async (
    dragKey: number | string,
    newFatherId: number | null,
  ) => {
    try {
      const triggerFormResponse = await trigger({
        url: config.updateUrl,
        body: {
          [fatherKey]: newFatherId,
          [uniqueKey]: dragKey,
          ChangeFields: [`${fatherKey}`],
        },
      }).unwrap();

      if (triggerFormResponse?.Result !== "Failed") {
        showSuccessToast(t("toast.successTitle"));
        refetch();
      }
    } catch (error) {
      null;
    }
  };

  return (
    <>
      <div className={`${match && "relative"} w-full flex flex-col gap-2 p-2`}>
        <NestedListToolbar
          expandAll={expandAll}
          collapseAll={collapseAll}
          refetch={refetch}
          handleAddFirstItem={() => handleAddAction(null, null, "firstItem")}
        />
        <div className="flex flex-col gap-2 w-full h-[calc(100dvh-180px)] overflow-y-auto">
          <InputText
            placeholder={t("general.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: 10 }}
            prefix={<Magnifier />}
            allowClear={{
              clearIcon: <CloseCircle />,
            }}
            className="flex items-center !bg-gray-gray5 rounded w-full text-xs"
          />
          <div
            className="hidden-show-scrollBar h-[540px] overflow-scroll"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedKey) {
                handleWhiteSpaceDrop();
              }
            }}
          >
            {isFetching ? (
              <div className="flex items-center w-full h-[400px]">
                <CustomSpin className="w-full" size="large" />
              </div>
            ) : filteredTreeData?.length > 0 ? (
              <Tree
                className="draggable-tree"
                showLine={{ showLeafIcon: false }}
                selectedKeys={id ? [id] : []}
                onSelect={handleSelect}
                treeData={filteredTreeData}
                switcherIcon={switcherIcon}
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                draggable
                onDragStart={(info) => {
                  setDraggedKey(info.node.key as number | string);
                }}
                onDrop={onDrop}
              />
            ) : (
              <div className="flex flex-col justify-center items-center gap-8 m-28">
                <NoData />
                <span className="text-[18px] text-gray-gray9">
                  {t("general.noData")}
                </span>

                <CustomButton
                  type="text"
                  className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
                  onClick={() => handleAddAction(null, null, "firstItem")}
                >
                  {t("general.addNew")}
                </CustomButton>
              </div>
            )}
          </div>
        </div>
      </div>
      {isFormModalOpen && (
        <CustomModal
          contentClassName={`${match ? "!min-w-[520px] h-full" : ""}`}
          headerName={
            id ? (
              <div className="flex flex-col justify-between gap-1 max-h-20">
                {t("general.update")}
                {title && (
                  <>
                    <span className="font-light text-gray-gray85 text-xs">
                      {title}
                    </span>
                  </>
                )}
              </div>
            ) : (
              t("general.addNew")
            )
          }
          closeModal={() => setIsFormModalOpen(false)}
          isModalOpen={isFormModalOpen}
          content={
            config.formType === "placeDefinition" ? (
              <PlaceDefinitionForm
                config={config}
                fatherId={fatherId}
                id={id}
                level={level}
                onClose={() => setIsFormModalOpen(false)}
                onGetDefault={(e) => {
                  if (!titleKey) return;

                  if (Array.isArray(titleKey)) {
                    const combinedTitle = titleKey
                      .map((key) => e?.[key])
                      .filter(Boolean)
                      .join(" - ");

                    setTitle(combinedTitle || null);
                  } else {
                    setTitle(e?.[titleKey] ?? null);
                  }
                }}
              />
            ) : (
              <NestedListForm
                config={config}
                fatherId={fatherId}
                onGetDefault={(e) => {
                  if (!titleKey) return;

                  if (Array.isArray(titleKey)) {
                    const combinedTitle = titleKey
                      .map((key) => e?.[key])
                      .filter(Boolean)
                      .join(" - ");

                    setTitle(combinedTitle || null);
                  } else {
                    setTitle(e?.[titleKey] ?? null);
                  }
                }}
                id={id}
                level={level}
                onClose={() => setIsFormModalOpen(false)}
              />
            )
          }
        />
      )}
      {isAttachmentModalOpen && (
        <CustomModal
          contentClassName={`${match ? "!min-w-[520px] h-full" : ""}`}
          headerName={t("sidebar.attachment")}
          headerDescription={attachmentModalDesc}
          closeModal={() => setIsAttachmentModalOpen(false)}
          isModalOpen={isAttachmentModalOpen}
          content={
            <Uploader
              setModalTitle={setAttachmentModalDesc}
              RepoId={repoId}
              RefId={id}
              onlyAcceptImage
            />
          }
        />
      )}
      <CustomDrawer
        isOpen={isDeleteDrawerVisible}
        onClose={() => setIsDeleteDrawerVisible(false)}
        content={
          <Confirmation
            onLoading={triggerIsLoading}
            itemsToConfirm={id}
            onCancel={() => setIsDeleteDrawerVisible(false)}
            onConfirm={handleDeleteConfirm}
          />
        }
      />

      {isDeleteModalVisible && (
        <CustomModal
          centered
          width={300}
          disableTitle
          closeModal={() => setIsDeleteModalVisible(false)}
          isModalOpen={isDeleteModalVisible}
          content={
            <Confirmation
              onLoading={triggerIsLoading}
              itemsToConfirm={id}
              onCancel={() => setIsDeleteModalVisible(false)}
              onConfirm={handleDeleteConfirm}
            />
          }
        />
      )}
      {isDynamicModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[520px] h-[470px] " : ""}`}
          headerName={dynamicAction.label}
          headerIcon={
            <span
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  getColoredIcon(dynamicAction.icon, mode),
                ),
              }}
            />
          }
          closeModal={() => setIsDynamicModalOpen(false)}
          isModalOpen={isDynamicModalOpen}
          content={
            <DynamicModal
              id={id}
              sourceKey={"GoodsCategoryId"}
              config={
                JSON.parse(dynamicAction.actionConfig.Config)
                // dynamicModalConfig?.find(
                //   (item) => item.name === dynamicAction.label
                // )?.config
              }
            />
          }
        />
      )}
    </>
  );
}
