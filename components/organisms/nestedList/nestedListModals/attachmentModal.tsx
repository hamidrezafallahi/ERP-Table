import { CustomModal } from "@components/atoms/defaultElements";
import React, { Dispatch, SetStateAction } from "react";
import { toggleModal } from "./utils";
import Uploader from "@layout/baseLayout/desktop/actionBar/panelForm/uploader";
import { FormModalData, SetStates, States } from "../types";
import { useTranslations } from "next-intl";

interface AttachmentModalProps {
  states: States;
  match: boolean;
  data: FormModalData;
  setStates: SetStates;
  setAttachmentDesc: Dispatch<SetStateAction<string>>;
  attachmentDesc: string;
}
const AttachmentModal = (props: AttachmentModalProps) => {
  const { states, data, match, setStates, attachmentDesc, setAttachmentDesc } =
    props;
  const t = useTranslations();

  return (
    <>
      {states.modals.attachment && (
        <CustomModal
          contentClassName={`${match ? "!min-w-[520px] h-full" : ""}`}
          headerName={t("sidebar.attachment")}
          headerDescription={attachmentDesc}
          closeModal={() => toggleModal(setStates, "attachment", false)}
          isModalOpen={states.modals.attachment}
          content={
            <Uploader
              setModalTitle={setAttachmentDesc}
              RepoId={data.repoId}
              RefId={data.id}
              onlyAcceptImage
            />
          }
        />
      )}
    </>
  );
};

export default AttachmentModal;
