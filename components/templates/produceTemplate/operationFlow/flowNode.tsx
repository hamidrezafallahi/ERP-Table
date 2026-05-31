"use client";
import React, { useState } from 'react';

import { Modal } from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomModal,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import { CustomDrawer } from '@components/atoms/defaultElements/drawer';
import {
  DeleteNodeIcon,
  EditNodeIcon,
  GaugeIcon,
  IdCardIcon,
  LayerIcon,
  PuzzleIcon,
  SpinnerIcon,
  ToolsIcon,
} from '@components/atoms/iconComponents';
import Confirmation from '@components/molecules/confirmation';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useCUDDataMutation } from '@services/base';
import {
  showErrorToast,
  showSuccessToast,
} from '@utils/toast';

import { produceModalConfig } from '../config';
import AddOperation from './addOperation';
import InsertAndEditOperation from './addOperation/InsertAndEditOperation';
import DeleteOperation from './deleteOperation';
import RenderShape from './renderShape';
import type {
  FlowNodeProps,
  IFlowItem,
} from './type';

const FlowNode = ({
  item,
  selected,
  onSelect,
  handleOpenModal,
  editNode,
  flowItems,
  setFlowItems,
}: FlowNodeProps) => {
  const t = useTranslations();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  const [activeModal, setActiveModal] = useState<null | "edit" | "delete">(
    null
  );
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<IFlowItem | null>(null);
  const handleOpenEditModal = (node: IFlowItem) => {
    console.log(node);
    setEditData(node);
    setActiveModal("edit");
  };
  const handleOpenDeleteModal = (id: number) => {
    setSelectedSPlanOpcId(id);
    setActiveModal("delete");
  };

  const handleCloseModal = () => setActiveModal(null);

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const [confirmMode] = useState<"Delete" | "Confirm">("Delete");

  const [selectedSPlanOpcId, setSelectedSPlanOpcId] = useState<number | null>(
    null
  );

  const handleConfirmation = async () => {
    try {
      const confirmResult = await mutateItem({
        url: confirmMode === "Delete" && "/api/prd/delete/sPlanOpc",
        body: { Id: selectedSPlanOpcId },
      }).unwrap();

      if (confirmMode === "Delete") {
        if (confirmResult.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
        }
        setIsConfirmDrawerOpen(false);
      } else {
        if (confirmResult.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
        }
        setIsConfirmDrawerOpen(false);
      }
    } catch (error) {
      showErrorToast(t("toast.failedTitle"));
    }
  };

  const elements = [
    {
      icon: (
        <EditNodeIcon config={{ width: 29, height: 29, stroke: "#585858" }} />
      ),
      type: "ویرایش",
      onClick: () => handleOpenEditModal(item),
      title: t("general.editOperation"),
      subTitle: t("general.thisButtonIsUsedToEditThisItemOfTheChart"),
      config: null,
      component: (
        <AddOperation
          editNode={editNode}
          setFlowItems={setFlowItems}
          flowItems={flowItems}
          modalType="ویرایش"
        />
      ),
    },
    {
      icon: <LayerIcon />,
      type: "مواد اولیه",
      onClick: () => handleOpenModal("مواد اولیه"),
      title: t("general.rawMaterial"),
      subTitle: t("general.thisButtonIsUsedToRawMaterialThisItemOfTheChart"),
      config: produceModalConfig.find((item) => item.name === "مواد اولیه")
        ?.config,
      component: null,
    },
    {
      icon: <PuzzleIcon />,
      type: "نیم ساخته",
      onClick: () => handleOpenModal("نیم ساخته"),
      title: t("general.semiFinished"),
      subTitle: t("general.thisButtonIsUsedToSemiFinishedThisItemOfTheChart"),
      config: produceModalConfig.find((item) => item.name === "نیم ساخته")
        ?.config,
      component: null,
    },
    {
      icon: <ToolsIcon />,
      type: "ابزار",
      onClick: () => handleOpenModal("ابزار"),
      title: t("general.tool"),
      subTitle: t("general.thisButtonIsUsedToToolThisItemOfTheChart"),
      config: produceModalConfig.find((item) => item.name === "ابزار")?.config,
      component: null,
    },
    {
      icon: <GaugeIcon />,
      type: "ماشین",
      onClick: () => handleOpenModal("ماشین"),
      title: t("title.machin"),
      subTitle: t("general.thisButtonIsUsedToMachinThisItemOfTheChart"),
      config: produceModalConfig.find((item) => item.name === "ماشین")?.config,
      component: null,
    },
    {
      icon: <IdCardIcon />,
      type: "تخصص",
      onClick: () => handleOpenModal("تخصص"),
      title: t("general.expert"),
      subTitle: t("general.thisButtonIsUsedToExpertThisItemOfTheChart"),
      config: produceModalConfig.find((item) => item.name === "تخصص")?.config,
      component: null,
    },
    {
      icon: <SpinnerIcon />,
      type: "انرژی",
      onClick: () => handleOpenModal("انرژی"),
      title: t("general.energy"),
      subTitle: t("general.thisButtonIsUsedToEnergyThisItemOfTheChart"),
      config: produceModalConfig.find((item) => item.name === "انرژی")?.config,
      component: null,
    },
    {
      icon: <DeleteNodeIcon />,
      type: "حذف",
      onClick: () => handleOpenDeleteModal(item.id),
      title: t("general.deleteOperation"),
      subTitle: t("general.thisButtonIsForRemovingThisItemFromTheChart"),
      config: null,
    },
  ];

  console.log("notMachin", editData?.notMachin);

  return (
    <>
      <div
        className="relative flex items-center gap-5"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
      >
        <RenderShape item={item} selected={selected} />

        {selected && (
          <div
            dir="ltr"
            className="top-0 -right-20 lg:-right-28 absolute items-center gap-2 grid grid-cols-2 lg:grid-cols-3"
          >
            {elements
              .filter((e) =>
                item.type === "square"
                  ? e.type === "ویرایش" || e.type === "حذف"
                  : true
              )
              .map((action, i) => {
                const handleClick = () => {
                  if (action.type === "ویرایش") {
                    handleOpenEditModal(item);
                  } else if (typeof action.onClick === "function") {
                    action.onClick();
                  }
                };

                return (
                  <button key={i} onClick={handleClick}>
                    <CustomTooltip
                      className={`${
                        editData?.notMachin === true && action.type === "ماشین"
                          ? "cursor-not-allowed  opacity-40"
                          : ""
                      }`}
                      title={
                        <div
                          className={` ${
                            editData?.notMachin === true &&
                            action.type === "ماشین"
                              ? "opacity-40"
                              : ""
                          }   text-center`}
                        >
                          <div>{action.title}</div>
                          <p className="py-2 text-gray-gray6 text-xs">
                            {action.subTitle}
                          </p>
                        </div>
                      }
                    >
                      {action.icon}
                    </CustomTooltip>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {activeModal === "edit" && editData && (
        <CustomModal
          headerName={t("general.editOperation")}
          isModalOpen
          closeModal={handleCloseModal}
          contentClassName="lg:min-w-[520px] lg:h-full"
          content={
            <InsertAndEditOperation
              editNode={editData}
              setFlowItems={setFlowItems}
              onClose={handleCloseModal}
              flowItems={flowItems}
            />
          }
        />
      )}
      {activeModal === "delete" && (
        <>
          {match ? (
            <Modal
              open
              footer={null}
              closable={false}
              title={null}
              centered
              width={318}
              onCancel={handleCloseModal}
            >
              <DeleteOperation
                onClose={handleCloseModal}
                flowItems={flowItems}
                sPlanOpcId={selectedSPlanOpcId}
              />
            </Modal>
          ) : (
            <CustomDrawer
              isOpen={!isConfirmDrawerOpen}
              onClose={() => {
                setIsConfirmDrawerOpen(false);
                handleCloseModal();
              }}
              content={
                <Confirmation
                  itemsToConfirm={selectedSPlanOpcId}
                  mode={confirmMode}
                  onCancel={() => {
                    setIsConfirmDrawerOpen(false);
                    handleCloseModal();
                  }}
                  onConfirm={handleConfirmation}
                  onLoading={mutateIsLoading}
                />
              }
            />
          )}
        </>
      )}
    </>
  );
};

export default FlowNode;
