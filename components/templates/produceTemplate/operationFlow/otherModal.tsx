"use client";
import React, { useState } from 'react';

import { useTranslations } from 'next-intl';

import { CustomModal } from '@components/atoms/defaultElements';
import DynamicModal from '@components/organisms/dynamicModal';

import { produceModalConfig } from '../config';
import type { AddNodeModalProps } from './type';

export default function OtherModal({
  open,
  onClose,
  modalType,
  selectedNode,
}: AddNodeModalProps) {
  const [modalContent] = useState<any>(null);
  const t = useTranslations();
  return (
    <CustomModal
      contentClassName={`lg:w-[520px] lg:h-fit`}
      headerName={modalContent?.title}
      open={open}
      onCancel={onClose}
      footer={null}
      headerIcon={modalContent?.icon}
      closeModal={onClose}
      isModalOpen={open}
      content={
        <DynamicModal
          id={selectedNode?.sPlanOpcId}
          sourceKey={
            modalContent?.config?.sourceFieldKey ??
            produceModalConfig.find((item) => item.name === modalType)?.config
              .sourceFieldKey
          }
          config={
            modalContent?.config ??
            produceModalConfig.find((item) => item.name === modalType)?.config
          }
        />
      }
    />
  );
}
