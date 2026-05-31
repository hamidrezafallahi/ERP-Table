import { CustomButton, CustomSpin } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import {
  CloseCircle,
  Magnifier,
  NoData,
} from "@components/atoms/iconComponents";
import { NestedListToolbar } from "@components/molecules/nestedList";
import { RefetchType } from "@services/types";
import { Tree } from "antd";
import { useTranslations } from "next-intl";
import React from "react";
import { SetStates, States } from "./types";
import { DataNode } from "antd/es/tree";
import { TreeProps } from "antd/lib";
import { SwitcherIcon } from "antd/es/tree/Tree";

interface NestedListTreePeops {
  match: boolean;
  expandAll: () => void;
  collapseAll: () => void;
  refetch: RefetchType;
  handleAddFirstItem: () => void;
  handleWhiteSpaceDrop: () => Promise<void>;
  states: States;
  setStates: SetStates;
  isFetching: boolean;
  filteredTreeData: DataNode[];
  handleSelect: (selectedKeys: number[]) => void;
  switcherIcon: SwitcherIcon;
  onExpand: (keys: number[]) => void;
  onDrop: TreeProps["onDrop"];
  handleAddAction: () => void;
}

const NestedListTree = (props: NestedListTreePeops) => {
  const {
    match,
    expandAll,
    collapseAll,
    refetch,
    handleAddFirstItem,
    handleWhiteSpaceDrop,
    states,
    setStates,
    isFetching,
    filteredTreeData,
    handleSelect,
    switcherIcon,
    onExpand,
    onDrop,
    handleAddAction,
  } = props;
  const t = useTranslations();

  return (
    <div className={`${match && "relative"} w-full flex flex-col gap-2 p-2`}>
      <NestedListToolbar
        expandAll={expandAll}
        collapseAll={collapseAll}
        refetch={refetch}
        handleAddFirstItem={handleAddFirstItem}
      />
      <div className="flex flex-col gap-2 w-full h-[calc(100dvh-180px)] overflow-y-auto">
        <InputText
          placeholder={t("general.search")}
          value={states.ui.searchTerm}
          onChange={(e) =>
            setStates.setUi((prev) => ({ ...prev, searchTerm: e.target.value }))
          }
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
            if (states.ui.draggedKey) {
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
              selectedKeys={
                states.selection.selectedId !== null
                  ? [states.selection.selectedId]
                  : []
              }
              onSelect={handleSelect}
              treeData={filteredTreeData}
              switcherIcon={switcherIcon}
              expandedKeys={states.ui.expandedKeys}
              onExpand={onExpand}
              draggable
              onDragStart={(info) => {
                setStates.setUi((prev) => ({
                  ...prev,
                  draggedKey: info.node.key as number | string,
                }));
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
                onClick={handleAddAction}
              >
                {t("general.addNew")}
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NestedListTree;
