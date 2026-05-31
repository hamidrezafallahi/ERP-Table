import React, { Dispatch, SetStateAction } from "react";
import FormModal from "./formModal";
import AttachmentModal from "./attachmentModal";
import DeleteDrawer from "./deleteDrawer";
import DeleteModal from "./deleteModal";
import NestedListDynamicModal from "./nestedListDynamicModal";
import CreditModal from "./creditModal";
import { FormModalData, INestedListConfig, LoadingType, NestedListActions, SetStates, States } from "../types";
import { TTheme } from "@slice/config/type";

interface NestedListModalsProps<T> {
  states: States;
  loading: LoadingType;
  config: INestedListConfig;
  setStates: SetStates;
  setAttachmentDesc: Dispatch<SetStateAction<string>>;
  attachmentDesc: string;
  handlers: NestedListActions<T>;
  mode: TTheme;
  match: boolean;
  data: FormModalData;
}

const NestedListModals = <T,>(props: NestedListModalsProps<T>) => {
  const {
    states,
    config,
    loading,
    setStates,
    attachmentDesc,
    setAttachmentDesc,
    handlers,
    mode,
    match,
    data,
  } = props;

  return (
    <>
      <FormModal
        states={states}
        match={match}
        data={data}
        config={config}
        loading={loading}
        setStates={setStates}
      />
      <AttachmentModal
        states={states}
        match={match}
        data={data}
        setStates={setStates}
        attachmentDesc={attachmentDesc}
        setAttachmentDesc={setAttachmentDesc}
      />
      <DeleteDrawer
        states={states}
        data={data}
        loading={loading}
        setStates={setStates}
        handlers={handlers}
      />
      <DeleteModal
        states={states}
        data={data}
        loading={loading}
        setStates={setStates}
        handlers={handlers}
      />
      <NestedListDynamicModal
        states={states}
        match={match}
        data={data}
        setStates={setStates}
        mode={mode}
      />
      <CreditModal
        states={states}
        setStates={setStates}
        match={match}
        data={data}
      />
    </>
  );
};

export default NestedListModals;
