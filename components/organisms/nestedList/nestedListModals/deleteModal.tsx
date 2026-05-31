import { CustomModal } from "@components/atoms/defaultElements";
import React from "react";
import { toggleModal } from "./utils";
import Confirmation from "@components/molecules/confirmation";
import { FormModalData, LoadingType, NestedListActions, SetStates, States } from "../types";

interface DeleteModalProps<T> {
  states: States;
  data: FormModalData;
  loading: LoadingType;
  setStates: SetStates;
  handlers: NestedListActions<T>;
}
const DeleteModal = <T,>(props: DeleteModalProps<T>) => {
  const { states, data, loading, setStates, handlers } = props;
  return (
    <>
      {states.modals.deleteModal && (
        <CustomModal
          centered
          width={300}
          disableTitle
          closeModal={() => toggleModal(setStates, "deleteModal", false)}
          isModalOpen={states.modals.deleteModal}
          content={
            <Confirmation
              onLoading={loading.triggerIsLoading}
              itemsToConfirm={data.id}
              onCancel={() => toggleModal(setStates, "deleteModal", false)}
              onConfirm={handlers.handleDeleteConfirm}
            />
          }
        />
      )}
    </>
  );
};

export default DeleteModal;
