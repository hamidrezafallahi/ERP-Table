"use client";
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import { CustomSpin } from '@components/atoms/defaultElements';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  useCUDDataMutation,
  useGetConditionallyMutation,
  useGetData,
} from '@services/base';
import { setPageData } from '@slice/pages';
import {
  showErrorToast,
  showSuccessToast,
} from '@utils/toast';

import AddOperation from './addOperation';
import FlowNode from './flowNode';
import OtherModal from './otherModal';
import type {
  IFlowItem,
  IFlowItemExtended,
  TCases,
} from './type';

export default function OperationFlow() {
  const t = useTranslations();
  const dispatch = useDispatch();

  const [selectedNode, setSelectedNode] = useState<IFlowItemExtended | null>(
    null
  );
  const [flowItems, setFlowItems] = useState<IFlowItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNode, setEditNode] = useState<IFlowItem | null>(null);
  const [modalType, setModalType] = useState<TCases>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const [fetchVersion] = useGetConditionallyMutation();
  const [triggerItem] = useCUDDataMutation();

  const selectedGoodId = useAppSelector(
    (state) =>
      state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((pd) => pd.name === "selectedGoodId")?.value
  );

  const selectedVersionId = useAppSelector(
    (state) =>
      state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((pd) => pd.name === "selectedVersionId")?.value
  );

  const { data: flowData, isLoading } = useGetData<IFlowItem[], any>({
    url: "/api/prd/select/sPlanOpc",
    body: { RepoViewId: 150004, SPlanId: selectedVersionId },
    skip: !selectedVersionId,
  });

  const processFlowItems = useCallback((raw: any[]): IFlowItem[] => {
    const mapped: IFlowItemExtended[] = raw.map((item: any) => ({
      id: Number(item.SPlanOpcId),
      title: item.OprationName,
      type:
        item.OprationType === 0
          ? "circle"
          : item.OprationType === 1
          ? "square"
          : "circleInSquare",
      order: item.Order != null ? Number(item.Order) : null,
      createdAt: item.CreateDate,
      sPlanOpcId: item.SPlanOpcId,
      notMachin: item.NoMachin,
      time: Number(item.Time),
    }));

    const sorted = mapped.sort((a, b) => {
      if (a.order != null && b.order != null) {
        if (a.order !== b.order) return a.order - b.order;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (a.order != null) return -1;
      if (b.order != null) return 1;
      return a.sPlanOpcId - b.sPlanOpcId;
    });

    return sorted.map((item, index) => ({ ...item, order: index + 1 }));
  }, []);

  useEffect(() => {
    if (!selectedVersionId) {
      setFlowItems([]);
      dispatch(setPageData({ name: "hasSplan", value: false }));
      dispatch(setPageData({ name: "hasOpc", value: false }));
      return;
    }

    if (flowData?.Data && Array.isArray(flowData.Data)) {
      const processed = processFlowItems(flowData.Data);
      dispatch(
        setPageData({
          name: "hasSplan",
          value: processed.length > 0,
        })
      );

      setFlowItems(processed);
    }

    const loadOpc = async () => {
      if (!selectedGoodId) return;

      try {
        const res: any = await fetchVersion({
          url: "/api/prd/select/sPlanOpc",
          body: {
            RepoViewId: 150004,
            GoodId: selectedGoodId,
            SPlanId: selectedVersionId,
          },
        }).unwrap();

        const hasOpc = Array.isArray(res?.Data) && res.Data.length > 0;

        dispatch(setPageData({ name: "hasOpc", value: hasOpc }));

        if (!hasOpc) setFlowItems([]);
      } catch {
        showErrorToast(t("toast.failedTitle"));
      }
    };

    loadOpc();
  }, [
    selectedVersionId,
    selectedGoodId,
    flowData,
    processFlowItems,
    dispatch,
    fetchVersion,
    t,
  ]);
  const updateSingleOrder = async (id: number, newOrder: number) => {
    try {
      const res: any = await triggerItem({
        url: "/api/prd/update/sPlanOpcOrder",
        body: {
          SPlanOpcId: id,
          Order: newOrder,
          ChangeFields: ["Order"],
        },
      }).unwrap();

      if (res.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
      }
    } catch {
      showErrorToast(t("toast.failedTitle"));
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    const sourceId = Number(e.dataTransfer.getData("nodeId"));
    if (sourceId === targetId) return;

    setFlowItems((prev) => {
      const updated = [...prev];

      const sourceIndex = updated.findIndex((n) => n.id === sourceId);
      const targetIndex = updated.findIndex((n) => n.id === targetId);

      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);

      // مرتب‌سازی و ست کردن order جدید
      const reordered = updated.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      // فقط آیتم جابجا شده را به بک‌اند بفرست
      const movedItemNewOrder = reordered.find((x) => x.id === sourceId)?.order;
      updateSingleOrder(sourceId, movedItemNewOrder!);

      return reordered;
    });
  };

  const updateOrdersInBackend = async (updatedItems: IFlowItem[]) => {
    for (const item of updatedItems) {
      const res: any = await triggerItem({
        url: "/api/prd/update/sPlanOpcOrder",
        body: {
          SPlanOpcId: Number(item.id),
          Order: Number(item.order),
          ChangeFields: ["Order"],
        },
      }).unwrap();

      if (res.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
      }
    }
  };

  return (
    <>
      <div className="hidden-show-scrollBar mx-auto w-full h-[calc(100dvh-220px)] overflow-auto">
        {isLoading ? (
          <CustomSpin className="w-full" size="large" />
        ) : (
          <div className="flex flex-col justify-center items-center">
            {flowItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center"
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("nodeId", item.id.toString())
                }
                onDrop={(e) => handleDrop(e, item.id)}
                onDragOver={(e) => e.preventDefault()}
              >
                <FlowNode
                  setFlowItems={setFlowItems}
                  selectedNode={selectedNode}
                  editNode={editNode}
                  flowItems={flowItems}
                  item={item}
                  sPlanOpcId={selectedNodeId}
                  selected={selectedNodeId === item.id}
                  onSelect={(id) =>
                    setSelectedNodeId((prev) => (prev === id ? null : id))
                  }
                  handleOpenModal={(type: TCases) => {
                    setModalType(type);
                    setSelectedNode(item as IFlowItemExtended);
                    setEditNode(item);
                    setModalOpen(true);
                  }}
                />
                <div className="bg-gray-gray8 w-px h-12"></div>
              </div>
            ))}

            <AddOperation
              flowItems={flowItems}
              editNode={editNode}
              setFlowItems={setFlowItems}
              modalType={modalType}
            />
          </div>
        )}
      </div>

      <OtherModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditNode(null);
          setModalType(null);
        }}
        setFlowItems={setFlowItems}
        editNode={editNode}
        modalType={modalType}
        flowItems={flowItems}
        selectedNode={selectedNode}
      />
    </>
  );
}
