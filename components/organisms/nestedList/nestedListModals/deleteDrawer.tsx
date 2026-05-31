import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import React from "react";
import { toggleModal } from "./utils";
import Confirmation from "@components/molecules/confirmation";
import {
  FormModalData,
  LoadingType,
  NestedListActions,
  SetStates,
  States,
} from "../types";

interface DeleteDrawerProps<T> {
  states: States;
  data: FormModalData;
  loading: LoadingType;
  setStates: SetStates;
  handlers: NestedListActions<T>;
}
const DeleteDrawer = <T,>(props: DeleteDrawerProps<T>) => {
  const { states, data, loading, setStates, handlers } = props;
  return (
    <>
      <CustomDrawer
        isOpen={states.modals.deleteDrawer}
        onClose={() => toggleModal(setStates, "deleteDrawer", false)}
        content={
          <Confirmation
            onLoading={loading.triggerIsLoading}
            itemsToConfirm={data.id}
            onCancel={() => toggleModal(setStates, "deleteDrawer", false)}
            onConfirm={handlers.handleDeleteConfirm}
          />
        }
      />
    </>
  );
};

export default DeleteDrawer;
