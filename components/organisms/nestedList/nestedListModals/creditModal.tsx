import { CustomModal } from "@components/atoms/defaultElements";
import { CustomerGroupCredit } from "@components/molecules/customerGroupCredit";
import { toggleModal } from "./utils";
import { FormModalData, SetStates, States } from "../types";

interface CreditModalProps {
  states: States;
  match: boolean;
  data: FormModalData;
  setStates: SetStates;
}

const CreditModal = (props: CreditModalProps) => {
  const { states, setStates, data, match } = props;

  return (
    <>
      {states.modals.credit && (
        <CustomModal
          contentClassName={`${match ? "w-[540px] h-[220px]" : ""}`}
          headerName={states.dynamicAction.label}
          // headerIcon={
          //   match && (
          //     <div
          //       dangerouslySetInnerHTML={{
          //         __html: getColoredIcon(states.dynamicAction.icon, mode),
          //       }}
          //       style={{ width: "18px", height: "17px" }}
          //     />
          //   )
          // }
          closeModal={() => toggleModal(setStates, "credit", false)}
          isModalOpen={states.modals.credit}
          content={
            <CustomerGroupCredit
              id={data.id}
              sourceKey={"CustomerGroupId"}
              handleClose={() => toggleModal(setStates, "credit", false)}
            />
          }
        />
      )}
    </>
  );
};

export default CreditModal;
