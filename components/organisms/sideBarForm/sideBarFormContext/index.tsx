"use client";

import { useEffect, useRef, useState } from "react";

import { Form } from "antd";
import { useTranslations } from "next-intl";

import { SpinIcon } from "@components/atoms/iconComponents";
import { useAppSelector } from "@hooks/custom/useAppSelector";

import {
  CustomFormComponentProps,
  IDynamicModalConfig,
  RecordType,
} from "../types";
import { ContextConfirmationPortals } from "./contextConfirmationPortals";
import { ContextHeader } from "./contextHeader";
import { ContextList } from "./contextList";
import { ContextPagination } from "./contextPagination";
import { useActionManager } from "./Hooks/useActionManager";
import { useDataManager } from "./Hooks/useDataManager";

interface SideBarFormContextProps {
  typeId: number;
  config: IDynamicModalConfig;
  isModal?: boolean;
  ExternalCustomForm?: React.ComponentType<CustomFormComponentProps>;
}

export default function SideBarFormContext(props: SideBarFormContextProps) {
  const { typeId, config, isModal = false, ExternalCustomForm } = props;
  const t = useTranslations();
  const [form] = Form.useForm();
  const [pageNumber, setPageNumber] = useState(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editingRecord, setEditingRecord] = useState<RecordType | null>(null);

  const { match, locale } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const locale = state.withPersist.config.lang;
    return { match, locale };
  });

  const perPageCount = isModal ? 3 : 7;
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const {
    tableData,
    tableIsLoading,
    tableTotal,
    cardData,
    cardIsLoading,
    refetchCard,
    refetchTable,
    tableDataWithDesc,
  } = useDataManager({
    config,
    pageNumber,
    perPageCount,
    match,
    typeId,
  });

  const { handleActionClick, triggerIsLoading, handleConfirmation } =
    useActionManager({
      match,
      config,
      setPageNumber,
      setSelectedId,
      setIsConfirmDrawerOpen,
      setIsConfirmModalOpen,
      selectedId,
      t,
      refetchCard,
      refetchTable,
      form,
      setEditingRecord,
    });

  useEffect(() => {
    if (!typeId) {
      setPageNumber(1);
    }
  }, [typeId]);

  useEffect(() => {
    if (pageNumber > 1 && tableData?.Data?.length === 0) {
      setPageNumber((prevState) => prevState - 1);
    }
  }, [tableData?.Data]);

  const noModal = match
    ? "h-full p-0"
    : "h-[calc(100dvh-288px)] border-2 border-dashed rounded p-4";

  const hasModal = match
    ? "h-full border-0 p-4"
    : "h-[calc(100dvh-64px)] border-0 p-4";
  return (
    <div
      className={`${isModal ? hasModal : noModal} overflow-hidden hidden-show-scrollBar relative w-full`}
    >
      <div
        className={`${match ? "" : isModal ? "" : "h-[calc(100dvh-21.5rem)]"} flex flex-col gap-2 my-2`}
        ref={containerRef}
      >
        <ContextHeader
          form={form}
          typeId={typeId}
          config={config}
          editingRecord={editingRecord}
          setEditingRecord={setEditingRecord}
          ExternalCustomForm={ExternalCustomForm}
          refetchCard={refetchCard}
          refetchTable={refetchTable}
        />
        {cardIsLoading || tableIsLoading ? (
          <div
            className={`${match ? "h-full" : "h-[calc(100dvh-23.25rem)]"} flex justify-center items-center text-gray-400`}
          >
            <SpinIcon config={{ width: 24, height: 24 }} />
          </div>
        ) : (
          <ContextList
            match={match}
            config={config}
            cardData={cardData}
            handleActionClick={handleActionClick}
            lastItemRef={lastItemRef}
            tableDataWithDesc={tableDataWithDesc}
            locale={locale}
            isModal={isModal}
          />
        )}
        {match && (
          <ContextPagination
            perPageCount={perPageCount}
            tableTotal={tableTotal}
            tableData={tableData}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
        )}
      </div>
      <ContextConfirmationPortals
        isConfirmModalOpen={isConfirmModalOpen}
        setIsConfirmModalOpen={setIsConfirmModalOpen}
        selectedId={selectedId}
        handleConfirmation={handleConfirmation}
        triggerIsLoading={triggerIsLoading}
        isConfirmDrawerOpen={isConfirmDrawerOpen}
        setIsConfirmDrawerOpen={setIsConfirmDrawerOpen}
      />
    </div>
  );
}
