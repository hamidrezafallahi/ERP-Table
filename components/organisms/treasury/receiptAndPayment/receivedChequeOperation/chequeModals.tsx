"use client";

import { CustomModal } from "@components/atoms/defaultElements";
import Confirmation from "@components/molecules/confirmation";
import {
  ChequeActionModal,
  ChequeCirculationModal,
  ChequeDynamicForm,
  ChequeInfoModal,
} from "@components/molecules/receiptAndPayment/cheque";
import { chequeDynamicConfig } from "@components/molecules/receiptAndPayment/cheque/chequeDynamicForm/config";
import { getColoredIcon } from "@utils/core";
import React from "react";

const ChequeModals = ({
  state,
  dispatchState,
  match,
  mode,
  gridData,
  selectedId,
  rowFieldKey,
  staticKey,
  selectedHeaderId,
  records,
  refetch,
  mutateIsLoading,
  handlePrevStep,
  handleReturn,
  selectedDetails,
  setSelectedDetails,
  setSelectedItems,
}) => {
  return (
    <>
      {state.isChequeDynamicActionOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[700px]" : ""}`}
          headerName={state.actionConfig.key}
          headerIcon={
            match &&
            typeof state.actionConfig.Icon === "string" && (
              <div
                dangerouslySetInnerHTML={{
                  __html: getColoredIcon(state.actionConfig.Icon, mode),
                }}
                style={{ width: "18px", height: "17px" }}
              />
            )
          }
          headerDescription={`${
            gridData?.Data?.find((item) => item[rowFieldKey] === selectedId)?.[
              staticKey
            ] ?? ""
          }`}
          closeModal={() =>
            dispatchState({ type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL" })
          }
          isModalOpen={state.isChequeDynamicActionOpen}
          content={
            <ChequeActionModal ids={selectedHeaderId}>
              <ChequeDynamicForm
                type={state.actionConfig?.MenuDesc}
                selectedRecords={[
                  records?.find((i) => i[rowFieldKey] === selectedId),
                ]}
                handleClose={() => {
                  dispatchState({
                    type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL",
                  });
                  refetch();
                }}
                sourceId={[
                  {
                    DocumentChequeId: selectedId,
                    RowNum: 1,
                  },
                ]}
                sourceKey={"Details"}
                config={
                  chequeDynamicConfig.find(
                    (item) => item.name === state.actionConfig.MenuDesc,
                  )?.config
                }
              />
            </ChequeActionModal>
          }
        />
      )}
      {state.isInfoModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[700px] h-[400px]" : ""}`}
          headerName={state.actionConfig.MenuDesc}
          closeModal={() => dispatchState({ type: "CLOSE_INFO_MODAL" })}
          isModalOpen={state.isInfoModalOpen}
          content={
            <ChequeActionModal ids={selectedHeaderId}>
              <ChequeInfoModal
                id={selectedId}
                handlePrevStep={handlePrevStep}
                mutateIsLoading={mutateIsLoading}
              />
            </ChequeActionModal>
          }
        />
      )}

      {state.isCirculationModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[700px] h-[400px]" : ""}`}
          headerName={state.actionConfig.MenuDesc}
          closeModal={() => dispatchState({ type: "CLOSE_CIRCULATION_MODAL" })}
          isModalOpen={state.isCirculationModalOpen}
          content={
            <ChequeActionModal
              ids={selectedHeaderId}
              handleReturn={handleReturn}
              selectedDetails={selectedDetails}
              setSelectedDetails={setSelectedDetails}
              setSelectedItems={setSelectedItems}
            >
              <ChequeCirculationModal id={selectedId} />
            </ChequeActionModal>
          }
        />
      )}

      {state.isPrevStepConfirmationModalOpen && (
        <CustomModal
          width={300}
          centered
          disableTitle
          closeModal={() => dispatchState({ type: "CLOSE_PREV_STEP_MODAL" })}
          isModalOpen={state.isPrevStepConfirmationModalOpen}
          content={
            <Confirmation
              itemsToConfirm={selectedId}
              mode="Confirm"
              onLoading={mutateIsLoading}
              onCancel={() => dispatchState({ type: "CLOSE_PREV_STEP_MODAL" })}
              onConfirm={handlePrevStep}
            />
          }
        />
      )}
    </>
  );
};

export default ChequeModals;
