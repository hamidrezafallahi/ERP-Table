import React from "react";
import { FormModalData, SetStates, States } from "../types";
import { getColoredIcon } from "@utils/core";
import DOMPurify from "dompurify";
import { CustomModal } from "@components/atoms/defaultElements";
import { toggleModal } from "./utils";
import { TTheme } from "@slice/config/type";
import DynamicModal from "@components/organisms/dynamicModal";

interface NestedListDynamicProps {
  states: States;
  match: boolean;
  data: FormModalData;
  setStates: SetStates;
  mode: TTheme;
}

const NestedListDynamicModal = (props: NestedListDynamicProps) => {
  const { states, setStates, data, match, mode } = props;
  return (
    <>
      {states.modals.dynamic && (
        <CustomModal
          contentClassName={`${match ? "w-[520px] h-[470px] " : ""}`}
          headerName={states.dynamicAction.label}
          headerIcon={
            <span
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  getColoredIcon(states.dynamicAction.icon, mode),
                ),
              }}
            />
          }
          closeModal={() => toggleModal(setStates, "dynamic", false)}
          isModalOpen={states.modals.dynamic}
          content={
            <DynamicModal
              id={data.id}
              sourceKey={"GoodsCategoryId"}
              config={JSON.parse(states.dynamicAction.actionConfig.Config)}
            />
          }
        />
      )}
    </>
  );
};

export default NestedListDynamicModal;
