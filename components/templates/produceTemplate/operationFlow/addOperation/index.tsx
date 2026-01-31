import React, { useState } from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomModal } from '@components/atoms/defaultElements';
import {
  ActionIcon,
  AddIcon,
} from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';
import { useCUDDataMutation } from '@services/base';
import {
  showErrorToast,
  showSuccessToast,
} from '@utils/core';

import {
  AddNodeModalProps,
  IFlowItem,
} from '../type';
import InsertOperation from './InsertAndEditOperation';

function AddOperation({ ...props }: AddNodeModalProps) {
  const t = useTranslations();

  const { flowItems, setFlowItems, editNode } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const [triggerItem] = useCUDDataMutation();

  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;

    return { match };
  }, shallowEqual);

  const { selectedVersionId } = useAppSelector(
    (state) => ({
      selectedVersionId: state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((pd) => pd.name === "selectedVersionId")?.value,
    }),
    shallowEqual
  );

  const handleSubmit = async (node: IFlowItem, newOrder?: number) => {
    try {
      const order = newOrder ?? flowItems.length + 1;

      if (editNode) {
        const changeFields: string[] = [];

        if (node.title !== editNode.title) changeFields.push("OprationName");
        if (node.type !== editNode.type) changeFields.push("OprationType");
        if (node.notMachin !== editNode.notMachin)
          changeFields.push("NoMachin");
        if (node.time !== editNode.time) changeFields.push("Time");

        if (changeFields.length === 0) return;

        const res: any = await triggerItem({
          url: "/api/prd/update/sPlanOpc",
          body: {
            SPlanOpcId: Number(editNode.id),
            ChangeFields: { ...changeFields, Order: Number(order) },
          },
        }).unwrap();

        if (res.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
          setModalOpen(false);
          setFlowItems((prev) => {
            const updated = prev.filter((item) => item.id !== editNode.id);
            const newNode: IFlowItem = {
              ...editNode,
              ...node,
              order: Number(order),
              id: Number(editNode.id),
            };
            updated.splice(order - 1, 0, newNode);
            return updated.map((item, index) => ({
              ...item,
              order: index + 1,
            }));
          });
          setModalOpen(false);
        }
      } else {
        const result: any = await triggerItem({
          url: "/api/prd/insert/sPlanOpc",
          body: {
            ReturnInsertedRow: true,
            RepoViewId: 150004,
            SPlanId: selectedVersionId,
            OprationName: node.title,
            Order: Number(order),
            NoMachin: node.notMachin,
            Time: Number(node.time),
            OprationType:
              node.type === "circle" ? 0 : node.type === "square" ? 1 : 2,
          },
        }).unwrap();

        if (result.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
          setModalOpen(false);
          const newNode: IFlowItem = {
            id: Number(result.Data.SPlanOpcId),
            title: node.title,
            type: node.type,
          };

          setFlowItems((prev) => {
            const updated = [...prev];
            updated.splice(order - 1, 0, newNode);
            return updated.map((item, index) => ({
              ...item,
              order: index + 1,
            }));
          });
          setModalOpen(false);
        }
      }
    } catch (err) {
      showErrorToast(t("toast.failedTitle"));
      setModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <button
        className="flex justify-center items-center border border-gray-gray10 rounded-full w-12 h-12 cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <AddIcon />
      </button>

      <p className="mt-3 text-blue-blue4 text-sm">
        {t("general.createAction")}
      </p>

      <CustomModal
        contentClassName="lg:w-[520px] lg:h-fit"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        key={editNode ? editNode.id : "add-modal"}
        headerIcon={match && <ActionIcon />}
        headerName={
          editNode ? t("general.editOperation") : t("general.addOperation")
        }
        closeModal={() => setModalOpen(false)}
        isModalOpen={modalOpen}
        content={
          <InsertOperation
            setFlowItems={setFlowItems}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmit}
            flowItems={flowItems}
            editNode={editNode}
          />
        }
      />
    </div>
  );
}

export default AddOperation;
